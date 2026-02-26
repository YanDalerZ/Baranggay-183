import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
    user?: {
        fullname: string;
        id: number;
        email: string;
        role: number;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 1) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};