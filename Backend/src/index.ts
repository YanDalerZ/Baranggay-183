import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool from './database/db.ts';
import * as AllRoutes from './routes/AllRoutes.ts';

const app: Application = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://baranggay-183.onrender.com/",

].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.error(`CORS Blocked: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/login', AllRoutes.LoginRoute);
app.use('/api/user', AllRoutes.UserRoute);


app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.listen(PORT, async () => {

    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL Pool Ready and Connected to Aiven.');
        conn.release();
    } catch (err) {
        console.error('❌ Connection failed. Check Aiven IP Whitelist or .env credentials.');
        console.error(err);
    }
});