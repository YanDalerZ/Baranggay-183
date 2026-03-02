import pool from '../database/db.js';
class RiskMapController {
    async getAllResidentLocations(req, res) {
        try {
            const [rows] = await pool.execute(`SELECT 
                id, system_id, firstname, lastname, 
                house_no, street, barangay, 
                disability, coordinates, is_flood_prone
             FROM users
             WHERE role=2`);
            const residents = rows.map(user => {
                // Construct address string for searching
                const fullAddress = [
                    user.street,
                    user.barangay,
                    "Pasay City", // Adding context for Leaflet search
                    "Philippines"
                ].filter(Boolean).join(', ');
                return {
                    id: user.id.toString(),
                    system_id: user.system_id,
                    name: `${user.firstname} ${user.lastname}`,
                    address: fullAddress,
                    coordinates: user.coordinates, // This will be null initially
                    vulnerability: user.disability || 'None',
                    isHighRisk: !!user.is_flood_prone
                };
            });
            return res.status(200).json(residents);
        }
        catch (error) {
            console.error("Fetch Resident Locations Error:", error);
            return res.status(500).json({ message: "Failed to retrieve resident locations." });
        }
    }
    // GET all flood zones
    async getFloodZones(req, res) {
        try {
            const [rows] = await pool.execute('SELECT id, lat, lng, radius FROM flood_zones');
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error("Fetch Flood Zones Error:", error);
            return res.status(500).json({ message: "Failed to retrieve flood zones." });
        }
    }
    // POST create a new flood zone
    async createFloodZone(req, res) {
        const { lat, lng, radius } = req.body;
        try {
            const [result] = await pool.execute('INSERT INTO flood_zones (lat, lng, radius) VALUES (?, ?, ?)', [lat, lng, radius]);
            return res.status(201).json({
                message: "Flood zone added",
                id: result.insertId
            });
        }
        catch (error) {
            console.error("Create Flood Zone Error:", error);
            return res.status(500).json({ message: "Failed to add flood zone." });
        }
    }
    // PUT update radius or position
    async updateFloodZone(req, res) {
        const { id } = req.params;
        const { radius } = req.body;
        try {
            await pool.execute('UPDATE flood_zones SET radius = ? WHERE id = ?', [radius, id]);
            return res.status(200).json({ message: "Flood zone updated" });
        }
        catch (error) {
            console.error("Update Flood Zone Error:", error);
            return res.status(500).json({ message: "Failed to update flood zone." });
        }
    }
    // DELETE a flood zone
    async deleteFloodZone(req, res) {
        const { id } = req.params;
        try {
            await pool.execute('DELETE FROM flood_zones WHERE id = ?', [id]);
            return res.status(200).json({ message: "Flood zone deleted" });
        }
        catch (error) {
            console.error("Delete Flood Zone Error:", error);
            return res.status(500).json({ message: "Failed to delete flood zone." });
        }
    }
}
export default new RiskMapController();
//# sourceMappingURL=RiskMapController.js.map