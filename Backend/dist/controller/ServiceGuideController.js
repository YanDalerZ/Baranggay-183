import pool from '../database/db.js';
class ServiceGuideController {
    // CREATE
    createGuide = async (req, res) => {
        const { title, category, processing_time, office_hours, requirements, steps } = req.body;
        try {
            const [result] = await pool.execute(`INSERT INTO service_guides (title, category, processing_time, office_hours, requirements, steps, last_updated) 
                 VALUES (?, ?, ?, ?, ?, ?, CURDATE())`, [
                title,
                category,
                processing_time,
                office_hours,
                JSON.stringify(requirements),
                JSON.stringify(steps)
            ]);
            return res.status(201).json({
                message: "Guide created successfully",
                guideId: result.insertId
            });
        }
        catch (error) {
            console.error("Create Guide Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    // READ (All)
    getAllGuides = async (_req, res) => {
        try {
            const [rows] = await pool.execute('SELECT * FROM service_guides ORDER BY created_at DESC');
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Fetch Guides Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    // UPDATE
    updateGuide = async (req, res) => {
        const { id } = req.params;
        const { title, category, processing_time, office_hours, requirements, steps } = req.body;
        try {
            const [result] = await pool.execute(`UPDATE service_guides SET 
                    title = ?, category = ?, processing_time = ?, 
                    office_hours = ?, requirements = ?, steps = ?, 
                    last_updated = CURDATE() 
                 WHERE id = ?`, [
                title,
                category,
                processing_time,
                office_hours,
                JSON.stringify(requirements),
                JSON.stringify(steps),
                id
            ]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Guide not found." });
            }
            return res.status(200).json({ message: "Guide updated successfully" });
        }
        catch (error) {
            console.error("Update Guide Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    // DELETE
    deleteGuide = async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.execute('DELETE FROM service_guides WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Guide not found." });
            }
            return res.status(200).json({ message: "Guide deleted successfully" });
        }
        catch (error) {
            console.error("Delete Guide Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
}
export default new ServiceGuideController();
//# sourceMappingURL=ServiceGuideController.js.map