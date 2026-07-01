import bcrypt from 'bcrypt';
import pool from '../database/db.js';
import NotificationService from '../services/NotificationService.js';
class SuperAdminUserController {
    async fetchAllUsers(req, res) {
        try {
            const query = `
            SELECT 
                id,
                system_id,
                firstname,
                lastname,
                email,
                password,
                contact_number,
                role,
                status,
                created_at,
                updated_at
            FROM users 
            WHERE role IN (1, 3)
            ORDER BY created_at DESC
        `;
            const [rows] = await pool.execute(query);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Fetch Users Error:", error);
            return res.status(500).json({
                message: "Internal server error.",
                error: error.message
            });
        }
    }
    fetchUserBySystemId = async (req, res) => {
        const { system_id } = req.params;
        try {
            const query = `
            SELECT 
                id,
                system_id,
                firstname,
                lastname,
                email,
                password,
                contact_number,
                role,
                status,
                created_at,
                updated_at
            FROM users 
            WHERE system_id = ? AND role IN (1, 2, 3)
            LIMIT 1
        `;
            const [rows] = await pool.execute(query, [system_id]);
            if (rows.length === 0)
                return res.status(404).json({ message: "User not found." });
            const user = rows[0];
            return res.status(200).json(user);
        }
        catch (error) {
            console.error("Fetch User Detail Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    AddNewUser = async (req, res) => {
        const { firstname, lastname, email, contact_number, role, status, password } = req.body;
        if (!firstname || !lastname || !role) {
            return res.status(400).json({ message: "Required fields (Firstname, Lastname, Role) are missing." });
        }
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [userResult] = await connection.execute(`INSERT INTO users (
                system_id, firstname, lastname, email, password, contact_number, role, status
            ) VALUES ('TEMP', ?, ?, ?, 'TEMPORARY_PASS', ?, ?, ?)`, [
                firstname || null,
                lastname || null,
                email || null,
                contact_number || null,
                role,
                status || 'active'
            ]);
            const newIdFromDB = userResult.insertId;
            let prefix = 'RES';
            if (parseInt(role) === 3)
                prefix = 'SUPERADMIN';
            else if (parseInt(role) === 1)
                prefix = 'ADMIN';
            const system_id = `${prefix}-${newIdFromDB.toString().padStart(3, '0')}`;
            // Use custom input password if provided, otherwise generate default
            let rawPassword = password;
            if (!rawPassword || rawPassword.trim() === '') {
                const cleanLastName = lastname.replace(/\s+/g, '').toLowerCase();
                rawPassword = `${system_id}${cleanLastName}`;
            }
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            await connection.execute(`UPDATE users SET system_id = ?, password = ? WHERE id = ?`, [system_id, hashedPassword, newIdFromDB]);
            await connection.commit();
            // Send email credential notification if an email is registered
            if (email) {
                const fullName = `${firstname} ${lastname}`;
                try {
                    await NotificationService.sendRegistrationEmail(email, fullName, system_id, rawPassword);
                }
                catch (emailError) {
                    console.error("Failed to send registration email:", emailError);
                }
            }
            return res.status(201).json({
                success: true,
                message: "User registered successfully!",
                data: { system_id, generated_password: rawPassword }
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Registration Error:", error);
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        }
        finally {
            connection.release();
        }
    };
    updateUser = async (req, res) => {
        const { system_id: oldSystemId } = req.params;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No data provided in request body." });
        }
        const { firstname, lastname, email, contact_number, role, status, password } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [userRow] = await connection.execute("SELECT id FROM users WHERE system_id = ?", [oldSystemId]);
            if (userRow.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "User not found." });
            }
            const userId = userRow[0].id;
            let prefix = 'RES';
            if (parseInt(role) === 3)
                prefix = 'SUPERADMIN';
            else if (parseInt(role) === 1)
                prefix = 'ADMIN';
            const newSystemId = `${prefix}-${userId.toString().padStart(3, '0')}`;
            // Dynamic Query Update to conditionally change password only if specified
            let updateQuery = `
            UPDATE users SET 
                system_id = ?, firstname = ?, lastname = ?, email = ?, contact_number = ?, role = ?, status = ?
        `;
            const queryParams = [
                newSystemId,
                firstname || null,
                lastname || null,
                email || null,
                contact_number || null,
                role,
                status || 'active'
            ];
            if (password && password.trim() !== '') {
                const hashedNewPassword = await bcrypt.hash(password, 10);
                updateQuery += `, password = ? `;
                queryParams.push(hashedNewPassword);
            }
            updateQuery += ` WHERE id = ?`;
            queryParams.push(userId);
            await connection.execute(updateQuery, queryParams);
            await connection.commit();
            return res.status(200).json({
                success: true,
                message: "User updated successfully!",
                data: { new_system_id: newSystemId }
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Update Error:", error);
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        }
        finally {
            connection.release();
        }
    };
    DeleteUserBySystemId = async (req, res) => {
        const { system_id } = req.params;
        if (!system_id) {
            return res.status(400).json({ message: "System ID is required for deletion." });
        }
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = await connection.execute(`SELECT id FROM users WHERE system_id = ?`, [system_id]);
            if (rows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "User not found." });
            }
            const userId = rows[0].id;
            const [deleteResult] = await connection.execute(`DELETE FROM users WHERE id = ?`, [userId]);
            if (deleteResult.affectedRows === 0) {
                throw new Error("Failed to delete user record.");
            }
            await connection.commit();
            return res.status(200).json({
                message: `User with System ID ${system_id} and all related records have been deleted successfully.`
            });
        }
        catch (error) {
            if (connection)
                await connection.rollback();
            console.error("Deletion Error:", error);
            return res.status(500).json({ message: "Internal server error during deletion." });
        }
        finally {
            if (connection)
                connection.release();
        }
    };
}
export default new SuperAdminUserController();
//# sourceMappingURL=SuperAdminUserController.js.map