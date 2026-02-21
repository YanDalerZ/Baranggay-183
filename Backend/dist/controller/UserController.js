import bcrypt from 'bcrypt';
import pool from '../database/db.js';
class UserController {
    async register(req, res) {
        const { firstname, lastname, email, password, contact_number } = req.body;
        try {
            if (!firstname || !lastname || !email || !password) {
                return res.status(400).json({ message: "All required fields must be filled." });
            }
            const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                return res.status(409).json({ message: "Email is already registered." });
            }
            // 3. Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            // 4. Insert into Database
            await pool.execute(`INSERT INTO users (firstname, lastname, email, password, contact_number, status) 
                 VALUES (?, ?, ?, ?, ?, 'active')`, [firstname, lastname, email, hashedPassword, contact_number || null]);
            return res.status(201).json({ message: "User created successfully!" });
        }
        catch (error) {
            console.error("Registration Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
}
export default new UserController();
//# sourceMappingURL=UserController.js.map