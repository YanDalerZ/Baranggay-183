import pool from '../database/db.js';
// Dynamically helper to cast to number if string is entirely numeric, else return string
const castValueDynamic = (value) => {
    if (value === '')
        return '';
    const num = Number(value);
    return !isNaN(num) ? num : value;
};
export const getConfiguration = async (req, res) => {
    try {
        // Fetch everything stored in your key-value table dynamically
        const [rows] = await pool.query('SELECT `key`, `value` FROM global_configurations');
        // Dynamically build the object without hardcoded arrays
        const configObject = rows.reduce((acc, row) => {
            acc[row.key] = castValueDynamic(row.value);
            return acc;
        }, {});
        res.json(configObject);
    }
    catch (error) {
        console.error('Config fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch configurations' });
    }
};
export const updateConfiguration = async (req, res) => {
    const configData = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Parameterized UPSERT query
        const query = `
            INSERT INTO global_configurations (\`key\`, \`value\`) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE \`value\` = ?
        `;
        // Dynamic forEach replacement: Loops exactly over whatever keys are submitted in the request payload
        for (const [key, value] of Object.entries(configData)) {
            // Skips undefined values cleanly
            if (value === undefined || value === null)
                continue;
            await connection.execute(query, [
                String(key),
                String(value),
                String(value)
            ]);
        }
        await connection.commit();
        res.json({ message: 'Configuration updated successfully' });
    }
    catch (error) {
        await connection.rollback();
        console.error('Config update error:', error);
        res.status(500).json({ message: 'Failed to update configurations' });
    }
    finally {
        connection.release();
    }
};
//# sourceMappingURL=GlobalConfigurationController.js.map