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
                b.id,
                b.batch_name,
                b.target_group,
                b.items_summary,
                b.created_at,
                -- Count actual claims from the distribution table
                COALESCE((
                    SELECT COUNT(DISTINCT resident_id) 
                    FROM distribution 
                    WHERE batch_id = b.id AND status = 'Claimed'
                ), 0) as claimed_count,
                
                -- Dynamic count of eligible users based on target_group
                COALESCE((
                    SELECT COUNT(*) 
                    FROM users u 
                    WHERE u.status = 'Active' AND (
                        -- Case 1: Batch is for BOTH groups
                        (b.target_group = 'BOTH' AND u.type IN ('SC', 'PWD', 'BOTH')) OR
                        
                        -- Case 2: Batch is for SC (Residents marked BOTH are also SC)
                        (b.target_group = 'SC' AND u.type IN ('SC', 'BOTH')) OR
                        
                        -- Case 3: Batch is for PWD (Residents marked BOTH are also PWD)
                        (b.target_group = 'PWD' AND u.type IN ('PWD', 'BOTH')) OR
                        
                        -- Case 4: Direct match for any other custom types
                        (u.type = b.target_group)
                    )
                ), 0) as total_eligible
            FROM distribution_batches b 
            ORDER BY b.created_at DESC`;
            const [rows] = await pool.execute(query);
            return res.status(200).json(rows || []);
        }
        catch (error) {
            console.error("Fetch Batches Error:", error);
            return res.status(500).json({ message: "Error fetching batches list." });
        }
    };
    fetchAllDistributions = async (req, res) => {
        try {
            const query = `
    SELECT 
        CONCAT(u.firstname, ' ', u.lastname) AS resident,
        u.id AS resident_id,
        u.system_id,
        d.batch_id,
        d.status,
        db.batch_name, 
        DATE_FORMAT(MAX(d.date_claimed), '%Y-%m-%d %H:%i') AS date_claimed,
        GROUP_CONCAT(CONCAT(i.name, ' (', d.qty, ' ', i.unit, ')') SEPARATOR ', ') AS item_description
    FROM distribution d
    JOIN users u ON d.resident_id = u.id
    JOIN inventory i ON d.inventory_id = i.id
    JOIN distribution_batches db ON d.batch_id = db.id 
    WHERE d.status = 'Claimed' 
    GROUP BY 
        u.id, 
        u.firstname,
        u.lastname,
        d.batch_id, 
        d.status, 
        db.batch_name,
        u.system_id
    ORDER BY MAX(d.date_claimed) DESC`;
            const [rows] = await pool.execute(query);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Global Distribution Error:", error);
            return res.status(500).json({ message: "Error fetching global distribution data." });
        }
    };
    fetchDistributionByBatch = async (req, res) => {
        const { batchId } = req.params;
        try {
            const [batch] = await pool.execute(`SELECT target_group, batch_name, items_summary FROM distribution_batches WHERE id = ?`, [batchId]);
            if (!batch.length) {
                return res.status(404).json({ message: "Batch not found" });
            }
            const { target_group, batch_name, items_summary } = batch[0];
            const query = `
    SELECT 
        CONCAT(u.firstname, ' ', u.lastname) AS resident,
        u.id AS resident_id,
        u.system_id AS system_id,
        u.type AS resident_type,
        -- If they haven't claimed, show the batch's default items summary
        COALESCE(
            GROUP_CONCAT(CONCAT(i.name, ' (', d.qty, ' ', i.unit, ')') SEPARATOR ', '), 
            ? 
        ) AS item_description,
        -- If there is no record in distribution, status is 'To Claim'
        COALESCE(MAX(d.status), 'To Claim') AS status,
        -- We use MAX to get the most recent time if there's a slight millisecond/second difference
        DATE_FORMAT(MAX(d.date_claimed), '%Y-%m-%d %H:%i') AS date_claimed,
        ? AS batch_name
    FROM users u
    LEFT JOIN distribution d ON u.id = d.resident_id AND d.batch_id = ?
    LEFT JOIN inventory i ON d.inventory_id = i.id
    WHERE u.status = 'Active' AND (
        (? = 'BOTH' AND u.type IN ('SC', 'PWD', 'BOTH')) OR
        (? = 'SC' AND u.type IN ('SC', 'BOTH')) OR
        (? = 'PWD' AND u.type IN ('PWD', 'BOTH')) OR
        (u.type = ?)
    )
    -- Group ONLY by the unique resident fields
    GROUP BY 
        u.id, 
        u.firstname, 
        u.lastname, 
        u.system_id, 
        u.type
    ORDER BY u.lastname ASC
`;
            const [rows] = await pool.execute(query, [
                items_summary,
                batch_name,
                batchId,
                target_group,
                target_group,
                target_group,
                target_group
            ]);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Database Error in fetchDistributionByBatch:", error);
            return res.status(500).json({ message: "Error fetching residents in batch." });
        }
    };
    generateBatch = async (req, res) => {
        const { batchName, targetGroup, selectedItems } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const itemsSummary = selectedItems.map((i) => `${i.qty} ${i.name}`).join(', ');
            const [batch] = await connection.execute(`INSERT INTO distribution_batches (batch_name, target_group, items_summary) VALUES (?, ?, ?)`, [batchName, targetGroup, itemsSummary]);
            const batchId = batch.insertId;
            const batchItemValues = selectedItems.map((si) => [batchId, si.id, si.qty]);
            await connection.query(`INSERT INTO batch_items (batch_id, inventory_id, qty) VALUES ?`, [batchItemValues]);
            await connection.commit();
            return res.status(201).json({ message: `Batch "${batchName}" generated.` });
        }
        catch (error) {
            if (connection)
                await connection.rollback();
            return res.status(500).json({ message: error.message });
        }
        finally {
            connection.release();
        }
    };
    claimBenefit = async (req, res) => {
        const { batchId, residentId } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [batchItems] = await connection.execute(`SELECT inventory_id, qty FROM batch_items WHERE batch_id = ?`, [batchId]);
            if (batchItems.length === 0) {
                throw new Error("No items found for this batch configuration.");
            }
            const [existing] = await connection.execute(`SELECT id FROM distribution WHERE batch_id = ? AND resident_id = ? LIMIT 1`, [batchId, residentId]);
            if (existing.length > 0)
                throw new Error("Already claimed.");
            for (const item of batchItems) {
                const [update] = await connection.execute(`UPDATE inventory SET allocated = allocated + ? 
                 WHERE id = ? AND (total - allocated) >= ?`, [item.qty, item.inventory_id, item.qty]);
                if (update.affectedRows === 0) {
                    throw new Error("Insufficient stock in inventory.");
                }
                await connection.execute(`INSERT INTO distribution (batch_id, resident_id, inventory_id, qty, status, date_claimed) 
                 VALUES (?, ?, ?, ?, 'Claimed', NOW())`, [batchId, residentId, item.inventory_id, item.qty]);
            }
            await connection.commit();
            return res.status(200).json({ message: "Claim successful!" });
        }
        catch (error) {
            if (connection)
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
            const [user] = await pool.execute(`SELECT type FROM users WHERE id = ?`, [userId]);
            if (!user.length)
                return res.status(404).json([]);
            const userType = user[0].type;
            const query = `
                SELECT 
                    db.id AS batch_id,
                    db.batch_name,
                    db.items_summary,
                    db.target_group,
                    -- Use MAX(status) or COALESCE to get the claim status for the batch
                    COALESCE(MAX(d.status), 'To Claim') AS status,
                    DATE_FORMAT(MAX(d.date_claimed), '%Y-%m-%d %H:%i') as date_claimed,
                    DATE_FORMAT(db.created_at, '%Y-%m-%d') as date_posted
                FROM distribution_batches db
                LEFT JOIN distribution d ON d.batch_id = db.id AND d.resident_id = ?
                WHERE 
                    (db.target_group = 'BOTH' AND ? IN ('SC', 'PWD', 'BOTH')) OR
                    (db.target_group = 'SC' AND ? IN ('SC', 'BOTH')) OR
                    (db.target_group = 'PWD' AND ? IN ('PWD', 'BOTH')) OR
                    (db.target_group = ?)
                GROUP BY db.id
                ORDER BY db.created_at DESC;
            `;
            const [rows] = await pool.execute(query, [userId, userType, userType, userType, userType]);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Fetch User Benefits Error:", error);
            return res.status(500).json([]);
        }
    };
    /**
     * FIXED: fetchUserClaimStats
     * Ensures stats logic matches the 1-batch-per-row UI
     */
    fetchUserClaimStats = async (req, res) => {
        const { userId } = req.params;
        try {
            const [user] = await pool.execute(`SELECT type FROM users WHERE id = ?`, [userId]);
            if (!user.length)
                return res.status(404).json({ message: "User not found" });
            const userType = user[0].type;
            const statsQuery = `
            SELECT 
                (SELECT COUNT(id) FROM distribution_batches 
                 WHERE (target_group = 'BOTH') OR (target_group = ?)
                ) AS total_claims,

                (SELECT COUNT(DISTINCT batch_id) 
                 FROM distribution 
                 WHERE resident_id = ? AND status = 'Claimed'
                ) AS claimed_completed,

                (SELECT COUNT(DISTINCT batch_id) 
                 FROM distribution 
                 WHERE resident_id = ? AND status = 'Approved'
                ) AS approved_ready,

                (SELECT COUNT(DISTINCT batch_id) 
                 FROM distribution 
                 WHERE resident_id = ? AND status = 'Pending'
                ) AS pending_review
            `;
            const [stats] = await pool.execute(statsQuery, [userType, userId, userId, userId]);
            return res.status(200).json({
                stats: stats[0]
            });
        }
        catch (error) {
            console.error("Fetch User Claim Stats Error:", error);
            return res.status(500).json({ message: "Error fetching claim statistics." });
        }
    };
}
export default new LedgerController();
//# sourceMappingURL=BenefitsController.js.map