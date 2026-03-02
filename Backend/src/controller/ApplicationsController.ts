import { Request, Response } from 'express';
import pool from '../database/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class ServiceController {
    // Citizen Side: Submit
    public async submitApplication(req: Request, res: Response): Promise<Response> {
        const {
            user_system_id,
            application_type,
            disability_type,
            medical_condition,
            gsis_sss_number,
            maintenance_meds,
            healthcare_provider,
            is_living_alone,
            is_bedridden,
            emergency_contact_id,
            employment_status,
            blood_type
        } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const doc_medical_cert = files?.['medical_cert'] ? files['medical_cert'][0].buffer : null;
        const doc_id_proof = files?.['id_proof'] ? files['id_proof'][0].buffer : null;
        const doc_psa_birth = files?.['psa_birth'] ? files['psa_birth'][0].buffer : null;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO service_applications (
                    user_system_id, 
                    application_type, 
                    disability_type, 
                    medical_condition, 
                    gsis_sss_number, 
                    maintenance_meds, 
                    healthcare_provider, 
                    is_living_alone, 
                    is_bedridden, 
                    emergency_contact_id, 
                    employment_status, 
                    blood_type,
                    doc_medical_cert,
                    doc_id_proof,
                    doc_psa_birth,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
                [
                    user_system_id,
                    application_type,
                    disability_type || null,
                    medical_condition || null,
                    gsis_sss_number || null,
                    maintenance_meds || null,
                    healthcare_provider || null,
                    is_living_alone === 'true' || is_living_alone === true ? 1 : 0,
                    is_bedridden === 'true' || is_bedridden === true ? 1 : 0,
                    emergency_contact_id || null,
                    employment_status || null,
                    blood_type || null,
                    doc_medical_cert,
                    doc_id_proof,
                    doc_psa_birth
                ]
            );

            return res.status(201).json({
                message: "Application submitted successfully",
                applicationId: result.insertId
            });
        } catch (error) {
            console.error("Submit Application Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }

    // Admin Side: Get All Applications (with user names)
    public async getAllApplications(req: Request, res: Response): Promise<Response> {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                `SELECT sa.id, 
                    sa.user_system_id, 
                    sa.application_type, -- Changed from 'as type' to 'application_type'
                    sa.status, 
                    sa.created_at as submittedDate, 
                    sa.updated_at as reviewedDate,
                    CONCAT(u.firstname, ' ', u.lastname) as name
             FROM service_applications sa
             JOIN users u ON sa.user_system_id = u.system_id
             ORDER BY sa.created_at DESC`
            );
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Fetch All Applications Error:", error);
            return res.status(500).json({ message: "Error retrieving applications." });
        }
    }
    // Add this method to your ServiceController
    public async getSingleApplicationDetails(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const query = `
        SELECT 
            sa.id, sa.user_system_id, sa.application_type, sa.status, sa.created_at,
            sa.disability_type, sa.medical_condition, sa.gsis_sss_number, 
            sa.maintenance_meds, sa.healthcare_provider, sa.is_living_alone, 
            sa.is_bedridden, sa.employment_status, sa.blood_type, sa.admin_notes,
            -- Convert Blobs from service_applications table to Base64
            TO_BASE64(sa.doc_medical_cert) as medical_cert_data,
            TO_BASE64(sa.doc_id_proof) as id_proof_data,
            TO_BASE64(sa.doc_psa_birth) as psa_birth_data,
            -- User Details
            u.firstname, u.middlename, u.lastname, u.email, u.contact_number, u.gender, u.birthday,
            u.civil_status, u.occupation, u.nationality, u.monthly_income, u.is_registered_voter,
            CONCAT(u.firstname, ' ', u.lastname) as name,
            CONCAT(u.house_no, ' ', u.street, ' ', u.barangay) as address,
            -- Emergency Contact
            ec.name AS emergency_name, 
            ec.relationship AS emergency_relationship, 
            ec.contact AS emergency_contact
        FROM service_applications sa
        INNER JOIN users u ON sa.user_system_id = u.system_id
        LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
        WHERE sa.id = ?
        LIMIT 1
    `;

            const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Application not found." });
            }

            const app = rows[0];

            // Helper function to detect MIME type from Base64 string (Magic Bytes)
            const detectMimeType = (base64: string): string => {
                const signatures: { [key: string]: string } = {
                    "JVBERi0": "application/pdf",
                    "iVBORw0KGgo": "image/png",
                    "/9j/": "image/jpeg",
                    "R0lGODdh": "image/gif"
                };
                for (const s in signatures) {
                    if (base64.startsWith(s)) return signatures[s];
                }
                return "application/octet-stream"; // Fallback if unknown
            };

            // Construct a structured attachments array dynamically
            const applicationFiles: any[] = [];

            const docs = [
                { key: 'medical_cert_data', label: 'Medical Certificate' },
                { key: 'id_proof_data', label: 'ID Proof' },
                { key: 'psa_birth_data', label: 'PSA Birth Certificate' }
            ];

            docs.forEach(doc => {
                if (app[doc.key]) {
                    const b64Data = app[doc.key];
                    applicationFiles.push({
                        file_type: doc.label,
                        // Replaces spaces with underscores for the filename
                        file_name: `${doc.label.replace(/\s+/g, '_')}_${app.user_system_id}`,
                        file_data: b64Data,
                        mime_type: detectMimeType(b64Data)
                    });
                }
                // Clean up the raw base64 from the root object to save bandwidth
                delete app[doc.key];
            });

            // Add the processed attachments to the final object
            app.attachments = applicationFiles;

            return res.status(200).json(app);
        } catch (error) {
            console.error("Fetch Application Details Error:", error);
            return res.status(500).json({ message: "Error retrieving application details." });
        }
    }
    public async updateApplicationStatus(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        const validStatuses = ['Pending', 'Approved', 'Denied', 'Incomplete'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `UPDATE service_applications 
                 SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [status, admin_notes || null, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Application not found." });
            }

            return res.status(200).json({ message: `Application marked as ${status}.` });
        } catch (error) {
            console.error("Update Status Error:", error);
            return res.status(500).json({ message: "Error updating application status." });
        }
    }
    public async getUserApplications(req: Request, res: Response): Promise<Response> {
        const { system_id } = req.params;
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                `SELECT id, application_type, status, created_at, admin_notes 
             FROM service_applications 
             WHERE user_system_id = ? 
             ORDER BY created_at DESC`,
                [system_id]
            );
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Fetch User Applications Error:", error);
            return res.status(500).json({ message: "Error retrieving your applications." });
        }
    }
}

export default new ServiceController();