import { Request, Response } from 'express';
import pool from '../database/db.js';
import { RowDataPacket } from 'mysql2';

// Dynamic row structure capturing key-value pairs from the table
interface ConfigurationRow extends RowDataPacket {
    key: string;
    value: string;
}

// Dynamically helper to cast to number if string is entirely numeric, else return string
const castValueDynamic = (value: string): string | number => {
    if (value === '') return '';
    const num = Number(value);
    return !isNaN(num) ? num : value;
};

export const getConfiguration = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch everything stored in your key-value table dynamically
        const [rows] = await pool.query<ConfigurationRow[]>('SELECT `key`, `value` FROM global_configurations');

        // Dynamically build the object without hardcoded arrays
        const configObject = rows.reduce((acc: Record<string, string | number>, row) => {
            acc[row.key] = castValueDynamic(row.value);
            return acc;
        }, {});

        res.json(configObject);
    } catch (error) {
        console.error('Config fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch configurations' });
    }
};

export const updateConfiguration = async (req: Request, res: Response): Promise<void> => {
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
            if (value === undefined || value === null) continue;

            await connection.execute(query, [
                String(key),
                String(value),
                String(value)
            ]);
        }

        await connection.commit();
        res.json({ message: 'Configuration updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Config update error:', error);
        res.status(500).json({ message: 'Failed to update configurations' });
    } finally {
        connection.release();
    }
};