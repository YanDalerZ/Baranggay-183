import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../database/db.js';

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

        try {
            if (!firstname || !lastname || !type) {
                return res.status(400).json({ message: "Firstname, Lastname, and Type are required." });
            }

            const [tableStatus]: any = await pool.execute(
                `SELECT AUTO_INCREMENT FROM information_schema.TABLES 
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
            );
            const nextId = tableStatus[0].AUTO_INCREMENT;
            const system_id = `${type === 'SC' ? 'SC' : 'PWD'}-${nextId.toString().padStart(3, '0')}`;

            const rawPassword = `${system_id}${lastname}`;
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            const [userResult]: any = await pool.execute(
                `INSERT INTO users (
                    system_id, firstname, lastname, email, password, contact_number, 
                    gender, birthday, address, type, id_expiry_date, 
                    disability, is_flood_prone, role, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 'active')`,
                [
                    system_id, firstname, lastname, email || null, hashedPassword, contact_number,
                    gender, birthday, address, type, id_expiry_date || null,
                    disability || 'N/A', is_flood_prone ? 1 : 0
                ]
            );

            const newUserId = userResult.insertId;

            if (emergencyContact && emergencyContact.name) {
                await this.saveEmergencyContact(newUserId, emergencyContact);
            }

            return res.status(201).json({
                message: "Resident registered successfully!",
                system_id,
                generated_password: rawPassword
            });

        } catch (error) {
            console.error("Registration Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public updateUser = async (req: Request, res: Response): Promise<Response> => {
        const { system_id } = req.params;
        const {
            firstname, lastname, email, contact_number,
            gender, birthday, address, type, id_expiry_date,
            disability, is_flood_prone, emergencyContact
        } = req.body;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [updateResult]: any = await connection.execute(
                `UPDATE users SET 
                    firstname = ?, lastname = ?, email = ?, 
                    contact_number = ?, gender = ?, birthday = ?, 
                    address = ?, type = ?, id_expiry_date = ?, 
                    disability = ?, is_flood_prone = ?
                WHERE system_id = ?`,
                [
                    firstname, lastname, email || null, contact_number,
                    gender, birthday, address, type, id_expiry_date || null,
                    disability || 'N/A', is_flood_prone ? 1 : 0, system_id
                ]
            );

            if (emergencyContact && emergencyContact.name) {
                const [userRow]: any = await connection.execute(
                    "SELECT id FROM users WHERE system_id = ?",
                    [system_id]
                );

                if (userRow.length > 0) {
                    const userId = userRow[0].id;

                    await connection.execute(
                        `INSERT INTO emergency_contacts (user_id, name, relationship, contact) 
                         VALUES (?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE 
                            name = VALUES(name), 
                            relationship = VALUES(relationship), 
                            contact = VALUES(contact)`,
                        [userId, emergencyContact.name, emergencyContact.relationship, emergencyContact.contact]
                    );
                }
            }

            await connection.commit();
            return res.status(200).json({ message: "Resident and Contact updated successfully!" });

        } catch (error) {
            await connection.rollback();
            console.error("Update Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        } finally {
            connection.release();
        }
    };

    private saveEmergencyContact = async (userId: number, contactData: any): Promise<void> => {
        const { name, relationship, contact } = contactData;
        await pool.execute(
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