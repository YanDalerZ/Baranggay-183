import 'dotenv/config'; // Loads .env variables immediately
import express from 'express';
import type { Request, Response, Application } from 'express';

const app: Application = express();

// Use the PORT from .env, or default to 3000 if it's missing
const PORT: number = Number(process.env.PORT) || 3000;
//asdas
app.use(express.json());

app.get('/', (req: Request, res: Response): void => {
    res.status(200).json({
        message: "Backend is using Environment Variables!",
        environment: process.env.NODE_ENV,
        port_active: PORT
    });
});

app.listen(PORT, () => {
    console.log(`🚀 [server]: Server is running at http://localhost:${PORT}`);
    console.log(`🌍 [env]: Current mode is ${process.env.NODE_ENV}`);
});