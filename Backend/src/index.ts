import 'dotenv/config';
import express from 'express';
import type { Request, Response, Application } from 'express';
import path from 'path';

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;
//asdas
app.use(express.json());

// 1. Point Express to your React build folder (usually 'dist' for Vite)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 2. Route the root to serve the React index.html
app.get('/', (req: Request, res: Response): void => {
    // If you just want to send JSON (API style):
    /*
    res.status(200).json({
        message: "Backend is active",
        page: "UserMainPage"
    });
    */

    // If you want to serve the actual Frontend app:
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 [server]: Server is running at http://localhost:${PORT}`);
});