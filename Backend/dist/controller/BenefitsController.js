import pool from '../database/db.js';
class LedgerController {
    fetchInventory = async (req, res) => {
        try {
            const query = `SELECT id, name, category, total, allocated, unit FROM inventory ORDER BY name ASC`;
            const [rows] = await pool.execute(query);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching inventory." });
        }
    };
    addNewItem = async (req, res) => {
        const { name, category, total, unit } = req.body;
        try {
            const query = `INSERT INTO inventory (name, category, total, allocated, unit) VALUES (?, ?, ?, 0, ?)`;
            await pool.execute(query, [name, category || 'General', total, unit]);
            return res.status(201).json({ message: "Item added successfully!" });
        }
        catch (error) {
            return res.status(500).json({ message: "Error adding item." });
        }
    };
    editItem = async (req, res) => {
        const { id } = req.params;
        const { name, category, total, unit } = req.body;
        try {
            const query = `UPDATE inventory SET name = ?, category = ?, total = ?, unit = ? WHERE id = ?`;
            await pool.execute(query, [name, category, total, unit, id]);
            return res.status(200).json({ message: "Item updated successfully!" });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error updating item." });
        }
    };
    deleteItem = async (req, res) => {
        const { id } = req.params;
        try {
            const [linked] = await pool.execute(`SELECT id FROM distribution WHERE inventory_id = ? LIMIT 1`, [id]);
            if (linked.length > 0) {
                return res.status(400).json({ message: "Cannot delete item. It is already linked to distribution records." });
            }
            await pool.execute(`DELETE FROM inventory WHERE id = ?`, [id]);
            return res.status(200).json({ message: "Item deleted successfully!" });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error deleting item." });
        }
    };
    fetchBatches = async (req, res) => {
        try {
            const query = `
                SELECT 
                    b.*, 
                    (SELECT COUNT(DISTINCT resident_id) FROM distribution WHERE batch_id = b.id) as resident_count
                FROM distribution_batches b 
                ORDER BY created_at DESC`;
            const [rows] = await pool.execute(query);
            return res.status(200).json(rows);
        }
        catch (error) {
            return res.status(500).json({ message: "Error fetching batches list." });
        }
    };
    fetchAllDistributions = async (req, res) => {
        try {
            const query = `
        SELECT 
            CONCAT(u.firstname, ' ', u.lastname) AS resident,
            u.id AS resident_id,
            d.batch_id,
            d.status,
            -- We pull the name from the batches table to ensure it's never null
            db.batch_name AS batch_name, 
            DATE_FORMAT(d.date_claimed, '%Y-%m-%d %H:%i') AS date_claimed,
            GROUP_CONCAT(CONCAT(i.name, ' (', d.qty, ' ', i.unit, ')') SEPARATOR ', ') AS item_description
        FROM distribution d
        JOIN users u ON d.resident_id = u.id
        JOIN inventory i ON d.inventory_id = i.id
        -- Join the source of truth for batch names
        JOIN distribution_batches db ON d.batch_id = db.id 
        GROUP BY 
            u.id, 
            d.batch_id, 
            d.status, 
            d.date_claimed,
            db.batch_name -- Added to Group By for SQL Strict Mode compliance
        ORDER BY d.date_claimed DESC, d.batch_id DESC`;
            const [rows] = await pool.execute(query);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ message: "Error fetching global distribution data." });
        }
    };
    fetchDistributionByBatch = async (req, res) => {
        const { batchId } = req.params;
        try {
            const query = `
        SELECT 
            CONCAT(u.firstname, ' ', u.lastname) AS resident,
            u.id AS resident_id,
            u.system_id AS system_id,
            u.type AS resident_type,
            GROUP_CONCAT(CONCAT(i.name, ' (', d.qty, ' ', i.unit, ')') SEPARATOR ', ') AS item_description,
            d.status,
            DATE_FORMAT(d.date_claimed, '%Y-%m-%d %H:%i') AS date_claimed,
            db.batch_name -- Removed the trailing comma that was before the FROM clause
        FROM distribution d
        JOIN users u ON d.resident_id = u.id
        JOIN inventory i ON d.inventory_id = i.id
        JOIN distribution_batches db ON d.batch_id = db.id
        WHERE d.batch_id = ?
        GROUP BY u.id, d.status, d.date_claimed, db.batch_name
        ORDER BY u.lastname ASC`;
            const [rows] = await pool.execute(query, [batchId]);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ message: "Error fetching residents in batch." });
        }
    };
    generateBatch = async (req, res) => {
        const { batchName, targetGroup, selectedItems } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // 1. Create items summary
            const itemsSummary = selectedItems.map((i) => `${i.qty} ${i.name}`).join(', ');
            // 2. Insert the main batch record
            const [batch] = await connection.execute(`INSERT INTO distribution_batches (batch_name, target_group, items_summary) VALUES (?, ?, ?)`, [batchName, targetGroup, itemsSummary]);
            const batchId = batch.insertId;
            /**
             * 3. Build User Query
             * Logic:
             * - If Target is SC: Fetch users where type is 'SC' OR type is 'BOTH'
             * - If Target is PWD: Fetch users where type is 'PWD' OR type is 'BOTH'
             * - If Target is BOTH: Fetch users where type is 'SC', 'PWD', OR 'BOTH'
             */
            let userQuery = `SELECT id FROM users WHERE status = 'Active' AND (`;
            let queryParams = [];
            if (targetGroup === 'BOTH') {
                userQuery += `type = 'SC' OR type = 'PWD' OR type = 'BOTH'`;
            }
            else if (targetGroup === 'SC') {
                userQuery += `type = 'SC' OR type = 'BOTH'`;
            }
            else if (targetGroup === 'PWD') {
                userQuery += `type = 'PWD' OR type = 'BOTH'`;
            }
            else {
                // Fallback for other types
                userQuery += `type = ?`;
                queryParams.push(targetGroup);
            }
            userQuery += `)`;
            const [users] = await connection.execute(userQuery, queryParams);
            if (users.length === 0) {
                throw new Error(`No active residents found for target group: ${targetGroup}`);
            }
            // 4. Prepare bulk insert for distribution table
            const distValues = [];
            users.forEach((u) => {
                selectedItems.forEach((si) => {
                    distValues.push([
                        batchId,
                        u.id,
                        si.id,
                        si.qty,
                        'To Claim'
                    ]);
                });
            });
            // 5. Bulk Insert
            await connection.query(`INSERT INTO distribution (batch_id, resident_id, inventory_id, qty, status) VALUES ?`, [distValues]);
            await connection.commit();
            return res.status(201).json({
                message: `Successfully generated "${batchName}" for ${users.length} residents.`
            });
        }
        catch (error) {
            if (connection)
                await connection.rollback();
            console.error("Batch Generation Error:", error);
            return res.status(500).json({ message: error.message });
        }
        finally {
            if (connection)
                connection.release();
        }
    };
    claimBenefit = async (req, res) => {
        const { batchId, residentId } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [items] = await connection.execute(`SELECT inventory_id, qty FROM distribution WHERE batch_id = ? AND resident_id = ? AND status = 'To Claim'`, [batchId, residentId]);
            if (items.length === 0) {
                throw new Error("Distribution record not found or already claimed.");
            }
            for (const item of items) {
                const [check] = await connection.execute(`SELECT (total - allocated) as available FROM inventory WHERE id = ?`, [item.inventory_id]);
                if (check[0].available < item.qty) {
                    throw new Error(`Insufficient stock for item ID: ${item.inventory_id}`);
                }
                await connection.execute(`UPDATE inventory SET allocated = allocated + ? WHERE id = ?`, [item.qty, item.inventory_id]);
            }
            await connection.execute(`UPDATE distribution SET status = 'Claimed', date_claimed = NOW() WHERE batch_id = ? AND resident_id = ?`, [batchId, residentId]);
            await connection.commit();
            return res.status(200).json({ message: "Goods released and inventory updated." });
        }
        catch (error) {
            await connection.rollback();
            return res.status(500).json({ message: error.message });
        }
        finally {
            connection.release();
        }
    };
    fetchUserBenefitsById = async (req, res) => {
        const { userId } = req.params;
        try {
            const query = `
            SELECT 
                d.batch_id,
                db.batch_name,
                db.target_group,
                db.items_summary,
                d.status,
                d.date_claimed,
                DATE_FORMAT(db.created_at, '%Y-%m-%d') as date_posted
            FROM distribution d
            JOIN distribution_batches db ON d.batch_id = db.id
            WHERE d.resident_id = ?
            ORDER BY db.created_at DESC`;
            const [rows] = await pool.execute(query, [userId]);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching user benefits." });
        }
    };
}
export default new LedgerController();
//# sourceMappingURL=BenefitsController.js.map