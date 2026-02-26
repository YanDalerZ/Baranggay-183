import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/db.js';
import EmailService from '../services/EmailService.js';
class UserController {

    public async fetchAllUsers(req: Request, res: Response): Promise<Response> {
        try {

            const query = `
                SELECT 
                    u.*, 
                    ec.name as emergency_name, 
                    ec.relationship as emergency_relationship, 
                    ec.contact as emergency_contact
                FROM users u
                LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
                WHERE u.role = 2
                ORDER BY u.created_at DESC
            `;

            const [rows]: any = await pool.execute(query);

            const formattedUsers = rows.map((user: any) => ({
                id: user.id,
                system_id: user.system_id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact_number: user.contact_number,
                gender: user.gender,
                birthday: user.birthday,
                address: user.address,
                type: user.type,
                id_expiry_date: user.id_expiry_date,
                disability: user.disability,
                is_flood_prone: user.is_flood_prone === 1,
                status: user.status,
                emergencyContact: user.emergency_name ? {
                    name: user.emergency_name,
                    relationship: user.emergency_relationship,
                    contact: user.emergency_contact
                } : null
            }));

            return res.status(200).json(formattedUsers);

        } catch (error) {
            console.error("Fetch Users Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
    public fetchUserBySystemId = async (req: Request, res: Response): Promise<Response> => {
        const { system_id } = req.params;

        try {
            const query = `
                SELECT 
                    u.*, 
                    ec.name as emergency_name, 
                    ec.relationship as emergency_relationship, 
                    ec.contact as emergency_contact
                FROM users u
                LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
                WHERE u.system_id = ? AND u.role = 2
                LIMIT 1
            `;

            const [rows]: any = await pool.execute(query, [system_id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Resident not found." });
            }

            const user = rows[0];

            const formattedUser = {
                id: user.id,
                system_id: user.system_id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                contact_number: user.contact_number,
                gender: user.gender,
                birthday: user.birthday,
                address: user.address,
                type: user.type,
                id_expiry_date: user.id_expiry_date,
                disability: user.disability,
                is_flood_prone: user.is_flood_prone === 1,
                status: user.status,
                emergencyContact: user.emergency_name ? {
                    name: user.emergency_name,
                    relationship: user.emergency_relationship,
                    contact: user.emergency_contact
                } : null
            };

            return res.status(200).json(formattedUser);

        } catch (error) {
            console.error("Fetch User Detail Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public AddNewUser = async (req: Request, res: Response): Promise<Response> => {
        const {
            firstname, lastname, email, contact_number,
            gender, birthday, address, type, id_expiry_date,
            disability, is_flood_prone, emergencyContact
        } = req.body;

        // 1. Validation
        if (!firstname || !lastname || !type) {
            return res.status(400).json({ message: "Required fields (Firstname, Lastname, Type) are missing." });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [userResult]: any = await connection.execute(
                `INSERT INTO users (
                system_id, firstname, lastname, email, password, contact_number, 
                gender, birthday, address, type, id_expiry_date, 
                disability, is_flood_prone, role, status
            ) VALUES ('TEMP', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 'active')`,
                [
                    firstname, lastname, email || null, 'TEMPORARY_PASS', contact_number,
                    gender, birthday, address, type, id_expiry_date || null,
                    disability || 'N/A', is_flood_prone ? 1 : 0
                ]
            );

            const newIdFromDB = userResult.insertId;

            let prefix = 'PWD';
            if (type === 'Both') {
                prefix = 'SC-PWD';
            } else if (type === 'Senior Citizen' || type === 'SC') {
                prefix = 'SC';
            }

            const system_id = `${prefix}-${newIdFromDB.toString().padStart(3, '0')}`;

            const cleanLastName = lastname.replace(/\s+/g, '').toLowerCase();
            const rawPassword = `${system_id}${cleanLastName}`;
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            await connection.execute(
                `UPDATE users SET system_id = ?, password = ? WHERE id = ?`,
                [system_id, hashedPassword, newIdFromDB]
            );

            if (emergencyContact && emergencyContact.name) {
                await this.saveEmergencyContact(newIdFromDB, emergencyContact, connection);
            }

            await connection.commit();

            if (email) {
                const fullName = `${firstname} ${lastname}`;
                EmailService.sendRegistrationEmail(email, fullName, system_id, rawPassword);
            }

            return res.status(201).json({
                success: true,
                message: "Resident registered successfully!",
                data: {
                    system_id,
                    generated_password: rawPassword
                }
            });

        } catch (error: any) {
            await connection.rollback();
            console.error("Registration Error:", error.message);

            // Handling the "Data Truncated" error if the 'type' column is still too short
            if (error.code === 'WARN_DATA_TRUNCATED' || error.errno === 1265) {
                return res.status(400).json({
                    message: "Database Error: The 'type' field is too long. Please ensure your 'users' table 'type' column is VARCHAR(50)."
                });
            }

            return res.status(500).json({ message: "Internal server error." });
        } finally {
            connection.release();
        }
    };
    public updateUser = async (req: Request, res: Response): Promise<Response> => {
        const { system_id } = req.params; // The current ID (e.g., PWD-015)
        const {
            firstname, lastname, email, contact_number,
            gender, birthday, address, type, id_expiry_date,
            disability, is_flood_prone, emergencyContact
        } = req.body;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Get the existing User's numeric ID
            const [userRow]: any = await connection.execute(
                "SELECT id FROM users WHERE system_id = ?",
                [system_id]
            );

            if (userRow.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Resident not found." });
            }

            const userId = userRow[0].id;

            // 2. Generate the NEW system_id based on the (potentially new) Category
            // This ensures if they change from PWD to 'Both', the ID updates to SC-PWD-
            let prefix = 'PWD';
            if (type === 'Both') {
                prefix = 'SC-PWD';
            } else if (type === 'Senior Citizen' || type === 'SC') {
                prefix = 'SC';
            }

            const newSystemId = `${prefix}-${userId.toString().padStart(3, '0')}`;

            // 3. Update the User record
            await connection.execute(
                `UPDATE users SET 
                system_id = ?,
                firstname = ?, lastname = ?, email = ?, 
                contact_number = ?, gender = ?, birthday = ?, 
                address = ?, type = ?, id_expiry_date = ?, 
                disability = ?, is_flood_prone = ?
            WHERE id = ?`,
                [
                    newSystemId,
                    firstname, lastname, email || null, contact_number,
                    gender, birthday, address, type, id_expiry_date || null,
                    disability || 'N/A', is_flood_prone ? 1 : 0,
                    userId
                ]
            );

            if (emergencyContact && emergencyContact.name) {
                await connection.execute(
                    `INSERT INTO emergency_contacts (user_id, name, relationship, contact) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    name = VALUES(name), 
                    relationship = VALUES(relationship), 
                    contact = VALUES(contact)`,
                    [
                        userId,
                        emergencyContact.name,
                        emergencyContact.relationship || 'N/A',
                        emergencyContact.contact_number || emergencyContact.contact
                    ]
                );
            }

            await connection.commit();
            return res.status(200).json({
                message: "Resident updated successfully!",
                new_system_id: newSystemId
            });

        } catch (error: any) {
            await connection.rollback();
            console.error("Update Error:", error.message);

            if (error.code === 'WARN_DATA_TRUNCATED' || error.errno === 1265) {
                return res.status(400).json({
                    message: "Data too long. Check if 'type' or 'system_id' column lengths are sufficient."
                });
            }

            return res.status(500).json({ message: "Internal server error." });
        } finally {
            connection.release();
        }
    };
    public DeleteUserBySystemId = async (req: Request, res: Response): Promise<Response> => {
        const { system_id } = req.params;

        if (!system_id) {
            return res.status(400).json({ message: "System ID is required for deletion." });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [rows]: any = await connection.execute(
                `SELECT id FROM users WHERE system_id = ?`,
                [system_id]
            );

            if (rows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "User not found." });
            }

            const userId = rows[0].id;

            await connection.execute(
                `DELETE FROM emergency_contacts WHERE user_id = ?`,
                [userId]
            );

            const [deleteResult]: any = await connection.execute(
                `DELETE FROM users WHERE id = ?`,
                [userId]
            );

            if (deleteResult.affectedRows === 0) {
                throw new Error("Failed to delete user record.");
            }

            await connection.commit();

            return res.status(200).json({
                message: `User with System ID ${system_id} has been deleted successfully.`
            });

        } catch (error) {
            await connection.rollback();
            console.error("Deletion Error:", error);
            return res.status(500).json({ message: "Internal server error during deletion." });
        } finally {
            connection.release();
        }
    };

    private saveEmergencyContact = async (userId: number, contactData: any, connection: any): Promise<void> => {
        const { name, relationship, contact } = contactData;

        await connection.execute(
            `INSERT INTO emergency_contacts (user_id, name, relationship, contact) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            relationship = VALUES(relationship), 
            contact = VALUES(contact)`,
            [userId, name, relationship, contact]
        );
    };


}

export default new UserController();