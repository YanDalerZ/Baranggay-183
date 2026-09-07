import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';
import { RowDataPacket } from 'mysql2';
import NotificationService from '../services/NotificationService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// In-memory OTP store (Use Redis or DB table in production)
const proxyOtpStore: { [key: string]: { otp: string; expiresAt: number; userId: number } } = {};

class LoginController {

    private generateToken = (user: any): string => {
        const fullName = `${user.firstname} ${user.lastname}`.trim();

        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                fullname: fullName
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    };

    public UserLogin = async (req: Request, res: Response): Promise<Response> => {
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

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is not active." });
            }

            if (user.id_expiry_date) {
                const today = new Date();
                const expiryDate = new Date(user.id_expiry_date);

                const diffTime = expiryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0 && diffDays <= 365) {
                    const monthsLeft = Math.floor(diffDays / 30);
                    const remainingDays = diffDays % 30;

                    let timeString = "";
                    if (monthsLeft > 0) {
                        timeString = `${monthsLeft} month(s) and ${remainingDays} day(s)`;
                    } else {
                        timeString = `${diffDays} day(s)`;
                    }

                    NotificationService.sendExpiryWarningEmail(
                        user.email,
                        `${user.firstname} ${user.lastname}`,
                        timeString,
                        user.id_expiry_date
                    );
                }
            }

            const token = this.generateToken(user);
            const { password: _, ...userData } = user;
            userData.fullname = `${user.firstname} ${user.lastname}`.trim();

            return res.status(200).json({
                message: "Login successful",
                token,
                user: userData
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public RequestProxyOTP = async (req: Request, res: Response): Promise<Response> => {
        const { fullName, birthday } = req.body;

        try {
            if (!fullName || !birthday) {
                return res.status(400).json({ message: "Resident full name and birthday are required." });
            }

            // Find user matching full name and date of birth
            const [users] = await pool.execute<RowDataPacket[]>(
                `SELECT u.*, ec.contact AS emergency_contact 
                 FROM users u 
                 INNER JOIN emergency_contacts ec ON u.id = ec.user_id 
                 WHERE CONCAT(TRIM(u.firstname), ' ', TRIM(u.lastname)) = TRIM(?) 
                 AND DATE(u.birthday) = DATE(?)`,
                [fullName, birthday]
            );

            const user = users[0];

            if (!user) {
                return res.status(404).json({ message: "Resident profile or emergency contact details not found." });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is not active." });
            }

            if (!user.emergency_contact) {
                return res.status(400).json({ message: "No emergency contact phone number on record for this resident." });
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry

            proxyOtpStore[user.id] = { otp, expiresAt, userId: user.id };

            // Send OTP to emergency contact number
            await NotificationService.sendSMS({
                phoneNumber: user.emergency_contact,
                message: `[Barangay 183] Your Proxy Verification OTP code is: ${otp}. Valid for 5 minutes.`
            });

            // Mask emergency contact number for UI display (e.g., 0952****560)
            const phone = user.emergency_contact;
            const maskedPhone = phone.length > 7
                ? `${phone.substring(0, 4)}****${phone.substring(phone.length - 3)}`
                : phone;

            return res.status(200).json({
                message: "OTP sent successfully to emergency contact.",
                userId: user.id,
                maskedContact: maskedPhone
            });

        } catch (error) {
            console.error("Proxy OTP Request Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public ProxyLogin = async (req: Request, res: Response): Promise<Response> => {
        const { userId, otp } = req.body;

        try {
            if (!userId || !otp) {
                return res.status(400).json({ message: "User ID and OTP are required." });
            }

            const record = proxyOtpStore[userId];

            if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
                return res.status(401).json({ message: "Invalid or expired OTP code." });
            }

            // OTP verified, remove code from memory
            delete proxyOtpStore[userId];

            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            const user = rows[0];

            if (!user || user.status !== 'active') {
                return res.status(403).json({ message: "Account is inactive or not found." });
            }

            const token = this.generateToken(user);
            const { password: _, ...userData } = user;
            userData.fullname = `${user.firstname} ${user.lastname}`.trim();

            return res.status(200).json({
                message: "Proxy login successful",
                token,
                user: userData
            });

        } catch (error) {
            console.error("Proxy Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public AdminLogin = async (req: Request, res: Response): Promise<Response> => {
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

            if (!user || user.role !== 1 || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid admin credentials." });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is inactive." });
            }

            const token = this.generateToken(user);

            const { password: _, ...userData } = user;
            userData.fullname = `${user.firstname} ${user.lastname}`.trim();

            return res.status(200).json({
                message: "Admin login successful",
                token,
                user: userData
            });

        } catch (error) {
            console.error("Admin Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public SuperAdminLogin = async (req: Request, res: Response): Promise<Response> => {
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

            if (!user || user.role !== 3 || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid super admin credentials." });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is inactive." });
            }

            const token = this.generateToken(user);

            const { password: _, ...userData } = user;
            userData.fullname = `${user.firstname} ${user.lastname}`.trim();

            return res.status(200).json({
                message: "Super Admin login successful",
                token,
                user: userData
            });

        } catch (error) {
            console.error("Super Admin Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public VerifyToken = async (req: Request, res: Response): Promise<Response> => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: "No token provided." });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return res.status(200).json({ valid: true, user: decoded });
        } catch (error) {
            return res.status(401).json({ valid: false, message: "Token expired or invalid." });
        }
    };

    public ForgotPassword = async (req: Request, res: Response): Promise<Response> => {
        const { email } = req.body;

        try {
            const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
            const user = rows[0];

            if (!user) {
                return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
            }

            const resetToken = jwt.sign(
                { email: user.email, id: user.id },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '15m' }
            );

            const fullName = `${user.firstname} ${user.lastname}`;
            const emailSent = await NotificationService.sendPasswordResetEmail(user.email, fullName, resetToken);

            if (!emailSent) {
                return res.status(500).json({ message: "Error sending email. Please try again later." });
            }

            return res.status(200).json({ message: "Reset link sent to your email." });

        } catch (error) {
            console.error("Forgot Password Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };

    public ResetPassword = async (req: Request, res: Response): Promise<Response> => {
        const { token, newPassword } = req.body;

        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await pool.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, decoded.email]
            );

            return res.status(200).json({ message: "Password updated successfully." });

        } catch (error) {
            console.error("Reset Password Error:", error);
            return res.status(400).json({ message: "Invalid or expired reset link." });
        }
    };
}

export default new LoginController();