import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';
import NotificationService from '../services/NotificationService.js';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
class LoginController {
    generateToken = (user) => {
        const fullName = `${user.firstname} ${user.lastname}`.trim();
        return jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: fullName
        }, JWT_SECRET, { expiresIn: '1h' });
    };
    UserLogin = async (req, res) => {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
            const user = rows[0];
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Invalid email or password." });
            }
            if (user.status !== 'active') {
                return res.status(403).json({ message: "Account is not active." });
            }
            const token = this.generateToken(user);
            const { password: _, ...userData } = user;
            userData.fullname = `${user.firstname} ${user.lastname}`.trim();
            return res.status(200).json({
                message: "Login successful",
                token,
                user: userData
            });
        }
        catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    AdminLogin = async (req, res) => {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
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
        }
        catch (error) {
            console.error("Admin Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    SuperAdminLogin = async (req, res) => {
        const { email, password } = req.body;
        try {
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
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
        }
        catch (error) {
            console.error("Super Admin Login Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    VerifyToken = async (req, res) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: "No token provided." });
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return res.status(200).json({ valid: true, user: decoded });
        }
        catch (error) {
            return res.status(401).json({ valid: false, message: "Token expired or invalid." });
        }
    };
    ForgotPassword = async (req, res) => {
        const { email } = req.body;
        try {
            // 1. Find user
            const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
            const user = rows[0];
            if (!user) {
                // For security, don't reveal if email exists or not
                return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
            }
            // 2. Generate Reset Token (15 min expiry)
            const resetToken = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
            // 3. Send Email
            const fullName = `${user.firstname} ${user.lastname}`;
            const emailSent = await NotificationService.sendPasswordResetEmail(user.email, fullName, resetToken);
            if (!emailSent) {
                return res.status(500).json({ message: "Error sending email. Please try again later." });
            }
            return res.status(200).json({ message: "Reset link sent to your email." });
        }
        catch (error) {
            console.error("Forgot Password Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
    ResetPassword = async (req, res) => {
        const { token, newPassword } = req.body;
        try {
            // 1. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            // 2. Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            // 3. Update DB
            await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, decoded.email]);
            return res.status(200).json({ message: "Password updated successfully." });
        }
        catch (error) {
            console.error("Reset Password Error:", error);
            return res.status(400).json({ message: "Invalid or expired reset link." });
        }
    };
}
export default new LoginController();
//# sourceMappingURL=LoginController.js.map