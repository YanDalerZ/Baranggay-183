import { Request, Response } from 'express';
import pool from '../database/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import notificationService from '../services/NotificationService.js';

class AppointmentController {
    public getAttachment = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT attachment FROM appointments WHERE id = ?',
                [id]
            );

            if (rows.length === 0 || !rows[0].attachment) {
                return res.status(404).json({ message: "Attachment not found." });
            }

            const buffer = rows[0].attachment;

            // Detect the format by checking the magic numbers (first few bytes)
            let mimeType = 'application/octet-stream';
            let extension = '';

            if (buffer.length > 4) {
                const hex = buffer.toString('hex', 0, 4).toUpperCase();

                if (hex.startsWith('89504E47')) {
                    mimeType = 'image/png';
                    extension = '.png';
                } else if (hex.startsWith('FFD8FF')) {
                    mimeType = 'image/jpeg';
                    extension = '.jpg';
                } else if (hex.startsWith('47494638')) {
                    mimeType = 'image/gif';
                    extension = '.gif';
                } else if (hex.startsWith('25504446')) {
                    mimeType = 'application/pdf';
                    extension = '.pdf';
                } else if (buffer.toString('utf8', 8, 12) === 'WEBP') {
                    mimeType = 'image/webp';
                    extension = '.webp';
                }
            }

            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="attachment-${id}${extension}"`);

            return res.send(buffer);
        } catch (error) {
            console.error("Fetch Attachment Error:", error);
            return res.status(500).json({ message: "Error retrieving file." });
        }
    };

    public getAllAppointmentsAdmin = async (_req: Request, res: Response): Promise<Response> => {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(`
            SELECT 
                a.*, 
                CONCAT(u.firstname, ' ', u.lastname) as user_name, 
                u.email as user_email 
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        `);

            return res.status(200).json(rows);
        } catch (error) {
            console.error("Admin Fetch Error:", error);
            return res.status(500).json({ message: "Internal server error while fetching all appointments." });
        }
    };
    public updateStatus = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Denied', 'Incomplete'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        try {
            // 1. Fetch User and Appointment details for the notification
            const [appointmentData]: any = await pool.execute(
                `SELECT a.service_type, a.appointment_date, a.appointment_time, u.email, u.firstname, u.contact_number 
                 FROM appointments a
                 JOIN users u ON a.user_id = u.id
                 WHERE a.id = ?`, [id]
            );

            if (appointmentData.length === 0) {
                return res.status(404).json({ message: "Appointment not found." });
            }

            // 2. Update the record
            const [result] = await pool.execute<ResultSetHeader>(
                `UPDATE appointments 
                 SET status = COALESCE(?, status), 
                     admin_notes = COALESCE(?, admin_notes)
                 WHERE id = ?`,
                [status || null, admin_notes || null, id]
            );

            // 3. NOTIFICATION: Alert the resident
            const { email, firstname, contact_number, service_type, appointment_date, appointment_time } = appointmentData[0];
            const dateStr = new Date(appointment_date).toLocaleDateString();

            notificationService.sendBroadcastNotification({
                recipientEmail: email,
                recipientName: firstname,
                title: `Appointment Status: ${status}`,
                message: `Your appointment for ${service_type} on ${dateStr} at ${appointment_time} is now ${status}. ${admin_notes ? `Note: ${admin_notes}` : ''}`
            });

            if (contact_number) {
                notificationService.sendSMS({
                    phoneNumber: contact_number,
                    message: `BRGY 183: Your ${service_type} appointment on ${dateStr} is ${status}. ${admin_notes ? `Note: ${admin_notes}` : ''}`
                });
            }

            return res.status(200).json({
                message: `Appointment ${id} updated to ${status || 'current status'} successfully.`
            });
        } catch (error: any) {
            console.error("Update Status Error:", error);
            return res.status(500).json({ message: "Internal server error during update." });
        }
    };

    public createAppointment = async (req: Request, res: Response): Promise<Response> => {
        const {
            service_id,
            service_type,
            appointment_date,
            appointment_time,
            purpose,
            priority,
            home_visit
        } = req.body;

        const user_id = (req as any).user.id;
        const attachmentBuffer = req.file ? req.file.buffer : null;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO appointments (
                    user_id, service_id, service_type, appointment_date, 
                    appointment_time, purpose, priority, home_visit, attachment
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    service_id && service_id !== 'null' ? parseInt(service_id) : null,
                    service_type || null,
                    appointment_date || null,
                    appointment_time || null,
                    purpose || null,
                    priority || 'Normal',
                    home_visit === 'true' || home_visit === true ? 1 : 0,
                    attachmentBuffer
                ]
            );

            const [user]: any = await pool.execute(`SELECT email, firstname FROM users WHERE id = ?`, [user_id]);

            if (user.length > 0) {
                notificationService.sendBroadcastNotification({
                    recipientEmail: user[0].email,
                    recipientName: user[0].firstname,
                    title: "Appointment Request Sent",
                    message: `Your request for a ${service_type} appointment on ${appointment_date} has been received and is pending approval.`
                });
            }

            return res.status(201).json({
                message: "Appointment requested successfully",
                id: result.insertId
            });
        } catch (error: any) {
            console.error("SQL Error:", error.message);
            return res.status(500).json({ message: "Database Error", details: error.message });
        }
    };

    public getUserAppointments = async (req: Request, res: Response): Promise<Response> => {
        const user_id = (req as any).user.id;
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date DESC',
                [user_id]
            );
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Fetch Appointments Error:", error);
            return res.status(500).json({ message: "Error fetching appointments" });
        }
    };
    public deleteAppointment = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;
        const user_id = (req as any).user.id;
        const user_role = (req as any).user.role;

        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT user_id FROM appointments WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: "Appointment not found." });
            }


            const [result] = await pool.execute<ResultSetHeader>(
                'DELETE FROM appointments WHERE id = ?',
                [id]
            );

            return res.status(200).json({ message: "Appointment deleted successfully." });
        } catch (error) {
            console.error("Delete Appointment Error:", error);
            return res.status(500).json({ message: "Internal server error during deletion." });
        }
    };
}

export default new AppointmentController();