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
                ec.contact as emergency_contact,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'file_type', ua.file_type, 
                            'file_name', ua.file_name,
                            'mime_type', ua.mime_type,
                            'file_data', TO_BASE64(ua.file_data)
                        )
                    ) 
                    FROM user_attachments ua 
                    WHERE ua.user_id = u.id
                ) as attachments
            FROM users u
            LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
            WHERE u.role = 2
            ORDER BY u.created_at DESC
        `;

            const [rows]: any = await pool.execute(query);

            const formattedUsers = rows.map((user: any) => {
                let parsedAttachments = [];

                if (user.attachments) {
                    try {
                        // JSON_ARRAYAGG returns a proper JSON array or stringified array
                        parsedAttachments = typeof user.attachments === 'string'
                            ? JSON.parse(user.attachments)
                            : user.attachments;
                    } catch (e) {
                        console.error(`Error parsing attachments for user ${user.system_id}:`, e);
                        parsedAttachments = [];
                    }
                }

                return {
                    ...user,
                    // Ensure boolean conversion
                    is_flood_prone: user.is_flood_prone === 1,
                    is_registered_voter: user.is_registered_voter === 1,
                    // Format emergency contact object
                    emergencyContact: user.emergency_name ? {
                        name: user.emergency_name,
                        relationship: user.emergency_relationship,
                        contact: user.emergency_contact
                    } : null,
                    attachments: parsedAttachments
                };
            });

            return res.status(200).json(formattedUsers);
        } catch (error: any) {
            console.error("Fetch Users Error:", error);
            return res.status(500).json({
                message: "Internal server error.",
                error: error.message
            });
        }
    }

    public fetchUserBySystemId = async (req: Request, res: Response): Promise<Response> => {
        const { system_id } = req.params;
        try {
            const query = `
            SELECT 
                u.*,
                CONCAT(house_no, ' ', street, ' ', barangay) as address,
                ec.name as emergency_name, 
                ec.relationship as emergency_relationship, 
                ec.contact as emergency_contact,
                (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'file_type', file_type, 
                        'file_name', file_name,
                        'mime_type', mime_type,
                        'file_data', TO_BASE64(file_data)
                    )
                ) FROM user_attachments WHERE user_id = u.id) as attachments 
            FROM users u
            LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
            WHERE u.system_id = ? AND u.role = 2
            LIMIT 1
        `;

            const [rows]: any = await pool.execute(query, [system_id]);
            if (rows.length === 0) return res.status(404).json({ message: "Resident not found." });

            const user = rows[0];

            // In React, you will display this as: 
            // <img src={`data:${attachment.mime_type};base64,${attachment.file_data}`} />
            const formattedUser = {
                ...user,
                is_flood_prone: user.is_flood_prone === 1,
                is_registered_voter: user.is_registered_voter === 1,
                emergencyContact: user.emergency_name ? {
                    name: user.emergency_name,
                    relationship: user.emergency_relationship,
                    contact: user.emergency_contact
                } : null,
                attachments: typeof user.attachments === 'string' ? JSON.parse(user.attachments) : user.attachments || []
            };

            return res.status(200).json(formattedUser);
        } catch (error) {
            console.error("Fetch User Detail Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public AddNewUser = async (req: Request, res: Response): Promise<Response> => {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const {
            firstname, middlename, lastname, suffix, email, contact_number,
            gender, birthday, birthplace, nationality, civil_status, blood_type,
            house_no, street, barangay, ownership_type, years_of_residency, residence_status,
            occupation, monthly_income, education, school, household_number,
            type, id_expiry_date, tcic_id, disability, is_flood_prone, is_registered_voter,
            emergencyContact
        } = req.body;

        if (!firstname || !lastname || !type) {
            return res.status(400).json({ message: "Required fields (Firstname, Lastname, Type) are missing." });
        }

        let parsedEmergencyContact = emergencyContact;
        if (typeof emergencyContact === 'string') {
            try {
                parsedEmergencyContact = JSON.parse(emergencyContact);
            } catch (e) {
                console.error("Failed to parse emergencyContact:", e);
            }
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Removed 'yearly_income' and 'educational_level'
            const [userResult]: any = await connection.execute(
                `INSERT INTO users (
            system_id, firstname, middlename, lastname, suffix, email, password, contact_number, 
            gender, birthday, birthplace, nationality, civil_status, blood_type,
            house_no, street, barangay, ownership_type, years_of_residency, residence_status,
            occupation, monthly_income, education, school, household_number,
            type, id_expiry_date, tcic_id, disability, is_flood_prone, is_registered_voter, role, status
        ) VALUES ('TEMP', ?, ?, ?, ?, ?, 'TEMPORARY_PASS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 'active')`,
                [
                    firstname || null,
                    middlename || null,
                    lastname || null,
                    suffix || null,
                    email || null,
                    contact_number || null,
                    gender || null,
                    birthday || null,
                    birthplace || null,
                    nationality || 'Filipino',
                    civil_status || null,
                    blood_type || null,
                    house_no || null,
                    street || null,
                    barangay || null,
                    ownership_type || null,
                    years_of_residency || 0,
                    residence_status || 'Resident',
                    occupation || null,
                    monthly_income || null,
                    education || null,
                    school || null,
                    household_number || null,
                    type || 'Resident',
                    id_expiry_date || null,
                    tcic_id || null,
                    disability || 'N/A',
                    (is_flood_prone === 'true' || is_flood_prone === 1 || is_flood_prone === true) ? 1 : 0,
                    (is_registered_voter === 'true' || is_registered_voter === 1 || is_registered_voter === true) ? 1 : 0
                ]
            );

            const newIdFromDB = userResult.insertId;

            // 2. Generate System ID
            let prefix = 'RES';
            if (type === 'Both') prefix = 'SC-PWD';
            else if (['Senior Citizen', 'SC'].includes(type)) prefix = 'SC';
            else if (type === 'PWD') prefix = 'PWD';

            const system_id = `${prefix}-${newIdFromDB.toString().padStart(3, '0')}`;
            const cleanLastName = lastname.replace(/\s+/g, '').toLowerCase();
            const rawPassword = `${system_id}${cleanLastName}`;
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            await connection.execute(
                `UPDATE users SET system_id = ?, password = ? WHERE id = ?`,
                [system_id, hashedPassword, newIdFromDB]
            );

            // 3. Save Emergency Contact
            if (parsedEmergencyContact && parsedEmergencyContact.name) {
                await connection.execute(
                    `INSERT INTO emergency_contacts (user_id, name, relationship, contact) VALUES (?, ?, ?, ?)`,
                    [
                        newIdFromDB,
                        parsedEmergencyContact.name || null,
                        parsedEmergencyContact.relationship || null,
                        parsedEmergencyContact.contact || null
                    ]
                );
            }

            // 4. Save Attachments
            if (files) {
                const attachmentTypes = ['photo_2x2', 'proof_of_residency'];
                for (const fieldName of attachmentTypes) {
                    if (files[fieldName]) {
                        const file = files[fieldName][0];
                        await connection.execute(
                            `INSERT INTO user_attachments (user_id, file_type, file_data, file_name, mime_type) 
                 VALUES (?, ?, ?, ?, ?)`,
                            [
                                newIdFromDB,
                                fieldName,
                                file.buffer,      // The binary data
                                file.originalname, // The filename
                                file.mimetype     // e.g., 'image/jpeg'
                            ]
                        );
                    }
                }
            }

            await connection.commit();

            return res.status(201).json({
                success: true,
                message: "Resident registered successfully!",
                data: { system_id, generated_password: rawPassword }
            });

        } catch (error: any) {
            await connection.rollback();
            console.error("Registration Error:", error);
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        } finally {
            connection.release();
        }
    };

    public updateUser = async (req: Request, res: Response): Promise<Response> => {
        const { system_id: oldSystemId } = req.params;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No data provided in request body." });
        }

        const {
            firstname, middlename, lastname, suffix, email, contact_number,
            gender, birthday, birthplace, nationality, civil_status, blood_type,
            house_no, street, barangay, ownership_type, years_of_residency, residence_status,
            occupation, monthly_income, education, school, household_number,
            type, id_expiry_date, tcic_id, disability, is_flood_prone, is_registered_voter,
            emergencyContact
        } = req.body;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Find the User ID first
            const [userRow]: any = await connection.execute(
                "SELECT id FROM users WHERE system_id = ?",
                [oldSystemId]
            );

            if (userRow.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Resident not found." });
            }

            const userId = userRow[0].id;

            // 2. Re-generate System ID if 'type' changed
            let prefix = 'RES';
            if (type === 'Both') prefix = 'SC-PWD';
            else if (['Senior Citizen', 'SC'].includes(type)) prefix = 'SC';
            else if (type === 'PWD') prefix = 'PWD';

            const newSystemId = `${prefix}-${userId.toString().padStart(3, '0')}`;

            // 3. Update User fields (Removed 'yearly_income' and 'educational_level')
            await connection.execute(
                `UPDATE users SET 
            system_id = ?, firstname = ?, middlename = ?, lastname = ?, suffix = ?, 
            email = ?, contact_number = ?, gender = ?, birthday = ?, birthplace = ?, 
            nationality = ?, civil_status = ?, blood_type = ?, 
            house_no = ?, street = ?, barangay = ?, ownership_type = ?, 
            years_of_residency = ?, residence_status = ?, occupation = ?, 
            monthly_income = ?, education = ?, school = ?, 
            household_number = ?, type = ?, 
            id_expiry_date = ?, tcic_id = ?, disability = ?, 
            is_flood_prone = ?, is_registered_voter = ?
        WHERE id = ?`,
                [
                    newSystemId,
                    firstname || null,
                    middlename || null,
                    lastname || null,
                    suffix || null,
                    email || null,
                    contact_number || null,
                    gender || null,
                    birthday || null,
                    birthplace || null,
                    nationality || 'Filipino',
                    civil_status || null,
                    blood_type || null,
                    house_no || null,
                    street || null,
                    barangay || null,
                    ownership_type || null,
                    years_of_residency || 0,
                    residence_status || 'Resident',
                    occupation || null,
                    monthly_income || null,
                    education || null,
                    school || null,
                    household_number || null,
                    type || 'Resident',
                    id_expiry_date || null,
                    tcic_id || null,
                    disability || 'N/A',
                    (is_flood_prone === 'true' || is_flood_prone === 1 || is_flood_prone === true) ? 1 : 0,
                    (is_registered_voter === 'true' || is_registered_voter === 1 || is_registered_voter === true) ? 1 : 0,
                    userId
                ]
            );

            // 4. Update Emergency Contact
            let parsedEmergencyContact = emergencyContact;
            if (typeof emergencyContact === 'string') {
                try { parsedEmergencyContact = JSON.parse(emergencyContact); } catch (e) { }
            }

            if (parsedEmergencyContact && parsedEmergencyContact.name) {
                await connection.execute(
                    `INSERT INTO emergency_contacts (user_id, name, relationship, contact) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                relationship = VALUES(relationship), 
                contact = VALUES(contact)`,
                    [
                        userId,
                        parsedEmergencyContact.name,
                        parsedEmergencyContact.relationship || 'N/A',
                        parsedEmergencyContact.contact || parsedEmergencyContact.contact_number
                    ]
                );
            }

            // 5. Handle File Updates (Attachments)
            if (files) {
                const attachmentTypes = ['photo_2x2', 'proof_of_residency'];

                for (const fileType of attachmentTypes) {
                    if (files[fileType]) {
                        const file = files[fileType][0];

                        // Delete old binary record
                        await connection.execute(
                            `DELETE FROM user_attachments WHERE user_id = ? AND file_type = ?`,
                            [userId, fileType]
                        );

                        // Insert new binary record
                        await connection.execute(
                            `INSERT INTO user_attachments (user_id, file_type, file_data, file_name, mime_type) 
                 VALUES (?, ?, ?, ?, ?)`,
                            [
                                userId,
                                fileType,
                                file.buffer,
                                file.originalname,
                                file.mimetype
                            ]
                        );
                    }
                }
            }

            await connection.commit();
            return res.status(200).json({
                success: true,
                message: "Resident updated successfully!",
                data: { new_system_id: newSystemId }
            });

        } catch (error: any) {
            await connection.rollback();
            console.error("Update Error:", error);
            return res.status(500).json({ message: "Internal server error.", error: error.message });
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

    public async getPriority(req: Request, res: Response): Promise<Response> {
        try {
            const sql = `
            SELECT 
                id, 
                CONCAT(firstname, ' ', lastname) as name, 
                CONCAT(house_no, ' ', street, ' ', barangay) as address, 
                contact_number as phone, 
                CASE 
                    -- Highest Priority: Both SC/PWD AND Flood Prone
                    WHEN type = 'BOTH' AND is_flood_prone = 1 THEN 1
                    -- Mid Priority: Just Flood Prone
                    WHEN is_flood_prone = 1 THEN 2
                    -- Lowest Priority: Just BOTH (not flood prone)
                    WHEN type = 'BOTH' THEN 3
                    ELSE 4 
                END as priority_level,
                is_flood_prone,
                type
            FROM users
            WHERE is_flood_prone = 1 OR type = 'BOTH'
            ORDER BY priority_level ASC
            LIMIT 50
        `;

            // Note: Using pool.query or db.query depending on your setup
            const [rows]: any = await pool.query(sql);

            const formattedResidents = rows.map((row: any) => {
                const tags: string[] = [];
                let priorityLabel = "";

                // 1. Determine the Label (High, Mid, or None)
                if (row.priority_level === 1) {
                    priorityLabel = "High Priority";
                } else if (row.priority_level === 2) {
                    priorityLabel = "Mid Priority";
                }

                // 2. Determine Tags
                if (row.is_flood_prone) tags.push('Flood-Prone');
                if (row.type === 'BOTH') tags.push('SC/PWD');
                // If you still use 'PWD' or 'SC' individual types elsewhere:
                if (row.type === 'PWD') tags.push('PWD');
                if (row.type === 'SC') tags.push('Senior Citizen');

                return {
                    id: row.id.toString(),
                    name: row.name,
                    address: row.address,
                    phone: row.phone,
                    priority: row.priority_level, // Changed from row.priority to priority_level
                    priorityLabel: priorityLabel, // Pass this to the frontend
                    tags: tags
                };
            });

            return res.status(200).json(formattedResidents);
        } catch (error) {
            console.error("Error fetching priority residents:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    // Add this method inside your UserController class

    // Inside your UserController class in UserController.ts/js
    public updateUserCoordinates = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;
        const { coordinates } = req.body;

        if (!coordinates) {
            return res.status(400).json({ message: "Coordinates are required." });
        }

        try {
            // We use 'id' because the Risk Map uses the numeric primary key, not the system_id string
            const [result]: any = await pool.execute(
                `UPDATE users SET coordinates = ? WHERE id = ?`,
                [coordinates, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Resident record not found." });
            }

            return res.status(200).json({
                success: true,
                message: "Coordinates updated successfully.",
                data: { id, coordinates }
            });
        } catch (error: any) {
            console.error("Database Error:", error);
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        }
    };
    public getAllResidentLocations = async (req: Request, res: Response): Promise<Response> => {
        try {
            const [rows]: any = await pool.execute(
                `SELECT id, system_id, firstname, lastname, house_no, street, barangay, disability, coordinates, is_flood_prone 
             FROM users 
             WHERE role = 2`
            );

            const residents = rows.map((user: any) => ({
                id: user.id.toString(),
                system_id: user.system_id,
                name: `${user.firstname} ${user.lastname}`,
                address: `${user.house_no || ''} ${user.street || ''} ${user.barangay || ''}, Pasay City`.trim(),
                coordinates: user.coordinates,
                vulnerability: user.disability || 'None',
                isHighRisk: user.is_flood_prone === 1
            }));

            return res.status(200).json(residents);
        } catch (error) {
            console.error("GIS Fetch Error:", error);
            return res.status(500).json({ message: "Failed to retrieve resident locations." });
        }
    };
}

export default new UserController();