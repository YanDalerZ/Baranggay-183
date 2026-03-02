import pool from '../database/db.js';
class AppointmentController {
    getAllAppointmentsAdmin = async (_req, res) => {
        try {
            // Joining with a hypothetical users table to see WHO booked the appointment
            const [rows] = await pool.execute(`
                SELECT 
                    a.*, 
                    u.full_name as user_name, 
                    u.email as user_email 
                FROM appointments a
                LEFT JOIN users u ON a.user_id = u.id
                ORDER BY a.appointment_date ASC, a.appointment_time ASC
            `);
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Admin Fetch Error:", error);
            return res.status(500).json({ message: "Internal server error while fetching all appointments." });
        }
    };
    /**
     * ADMIN: Update the status or add admin notes to an appointment
     * Route: PATCH /api/appointments/:id/status
     */
    updateStatus = async (req, res) => {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        // Validation: Ensure status is one of the ENUM values defined in DB
        const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }
        try {
            // Dynamically build the update query based on provided fields
            const [result] = await pool.execute(`UPDATE appointments 
                 SET status = COALESCE(?, status), 
                     admin_notes = COALESCE(?, admin_notes)
                 WHERE id = ?`, [status || null, admin_notes || null, id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Appointment not found." });
            }
            return res.status(200).json({
                message: `Appointment ${id} updated to ${status || 'current status'} successfully.`
            });
        }
        catch (error) {
            console.error("Update Status Error:", error);
            return res.status(500).json({ message: "Internal server error during update." });
        }
    };
    // AppointmentController.ts
    createAppointment = async (req, res) => {
        const { service_id, service_type, appointment_date, appointment_time, purpose, priority, home_visit } = req.body;
        const user_id = req.user.id;
        try {
            const [result] = await pool.execute(`INSERT INTO appointments (
                user_id, 
                service_id, 
                service_type, 
                appointment_date, 
                appointment_time, 
                purpose, 
                priority, 
                home_visit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                user_id,
                service_id || null, // If service_id is undefined/empty, send NULL
                service_type,
                appointment_date,
                appointment_time,
                purpose,
                priority || 'Normal',
                home_visit ? 1 : 0 // Convert boolean to 1 or 0 for MySQL TINYINT
            ]);
            return res.status(201).json({
                message: "Appointment requested",
                id: result.insertId
            });
        }
        catch (error) {
            console.error("SQL Error:", error.message);
            return res.status(500).json({
                message: "Database Error",
                details: error.message
            });
        }
    };
    // READ (User specific)
    getUserAppointments = async (req, res) => {
        const user_id = req.user.id;
        try {
            const [rows] = await pool.execute('SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date DESC', [user_id]);
            return res.status(200).json(rows);
        }
        catch (error) {
            return res.status(500).json({ message: "Error fetching appointments" });
        }
    };
}
export default new AppointmentController();
//# sourceMappingURL=AppointmentController.js.map