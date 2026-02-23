import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';
import { RowDataPacket } from 'mysql2';

class LoginController {

    public async UserLogin(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }

            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            const user = rows[0];

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is not active." });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1h' }
            );

            const { password: _, ...userData } = user;

            return res.status(200).json({
                message: "Login successful",
                token,
                user: userData
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }

    public async AdminLogin(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }

            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            const user = rows[0];

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            // 1. Check if the user is an admin (Optional: only if this is an Admin Login)
            if (user.role !== 'admin') {
                 return res.status(403).json({ message: "Access denied. Admins only." });
             }

            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is not active." });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            // 2. Add 'role' to the JWT token payload
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role // Now the token carries the "admin" or "user" status
                },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1h' }
            );

            const { password: _, ...userData } = user;

            return res.status(200).json({
                message: "Login successful",
                token,
                user: userData // userData now includes the 'role' field automatically
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
}

export default new LoginController();