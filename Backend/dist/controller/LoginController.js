import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';
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
}
export default new LoginController();
//# sourceMappingURL=LoginController.js.map