import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+08:00',
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+08:00';", (err: { message: any; }) => {
        if (err) {
            console.error("❌ Failed to set session timezone:", err.message);
        } else {
            console.log("✅ Database session timezone synchronized to Manila (+08:00)");
        }
    });
});

export default pool;