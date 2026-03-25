import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
class NotificationService {
    transporter;
    SENDER_LABEL = "BRGY 183 ALERT";
    SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages';
    SEMAPHORE_API_KEY = 'a7b3f101637f65bb2bb01bfd0ac5595c';
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    formatPhoneNumber(phone) {
        let cleanPhone = String(phone).trim().replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '63' + cleanPhone.substring(1);
        }
        else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
            cleanPhone = '63' + cleanPhone;
        }
        return cleanPhone;
    }
    async sendSMS({ phoneNumber, message }) {
        try {
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            const payload = {
                apikey: this.SEMAPHORE_API_KEY,
                number: formattedPhone,
                message: `[${this.SENDER_LABEL}]\n${message}`,
                sendername: 'BARANGAY183',
            };
            //
            const response = await axios.post(this.SEMAPHORE_API_URL, payload);
            console.log(`[SMS Success] sent to ${formattedPhone}:`, response.data);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                console.error(`[SMS Error] status: ${error.response.status}`);
                console.error(`[SMS Error] data:`, error.response.data);
            }
            else {
                console.error(`[SMS Error] message: ${error.message}`);
            }
            return null;
        }
    }
    async sendRegistrationEmail(userEmail, fullName, systemId, rawPassword) {
        try {
            const mailOptions = {
                from: `"Barangay 183 Admin" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: "Account Created - Barangay 183 System",
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2563eb;">Welcome to Barangay 183</h2>
                        <p>Hello <strong>${fullName}</strong>,</p>
                        <p>Your account has been set up. Credentials:</p>
                        <p><strong>Email:</strong> ${userEmail}</p>
                        <p><strong>Password:</strong> ${rawPassword}</p>
                        <p><strong>System ID:</strong> ${systemId}</p>
                        <p style="margin-top:20px; font-size:12px; color:gray;">Please change your password after your first login.</p>
                    </div>
                `
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`[Email] Registration sent to ${userEmail}`);
        }
        catch (error) {
            console.error("[Email Error] Registration Email Failed:", error);
        }
    }
    async sendBroadcastNotification({ recipientEmail, recipientName, title, message }) {
        try {
            const mailOptions = {
                from: `"Barangay 183 Alerts" <${process.env.EMAIL_USER}>`,
                to: recipientEmail,
                subject: `📢 ${title}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px;">
                        <h2 style="color: #b91c1c; margin-top:0;">⚠️ ${title}</h2>
                        <p>Attention ${recipientName},</p>
                        <div style="background:#fef2f2; padding:15px; border-radius:8px; color:#991b1b; font-weight:bold;">
                            ${message}
                        </div>
                        <p style="font-size: 11px; color: #6b7280; margin-top: 20px;">
                            This is an official emergency broadcast from the Barangay 183 Command Center.
                        </p>
                    </div>
                `
            };
            return await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error(`[Email Error] Broadcast failed to ${recipientEmail}`);
            return null;
        }
    }
    async sendPasswordResetEmail(userEmail, fullName, resetToken) {
        try {
            // Use the environment variable if it exists, otherwise fallback to local
            // In Render, set FRONTEND_URL to https://baranggay-183.onrender.com
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173/';
            const resetLink = `${baseUrl}reset-password/${resetToken}`;
            const mailOptions = {
                from: `"Barangay 183 Security" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: "Password Reset Request - Barangay 183",
                html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #1e293b; margin: 0;">Password Reset</h2>
                        <p style="color: #64748b; font-size: 14px;">Barangay 183 Services Platform</p>
                    </div>
                    
                    <p style="color: #334155;">Hello <strong>${fullName}</strong>,</p>
                    <p style="color: #334155; line-height: 1.5;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                           Reset My Password
                        </a>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 13px; text-align: center; font-weight: 500;">
                        This link will expire in 15 minutes for your security.
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                    
                    <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.4;">
                        If the button above doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
                    </p>
                </div>
            `
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`[Email] Reset link sent to ${userEmail}`);
            return true;
        }
        catch (error) {
            console.error("[Email Error] Password Reset Email Failed:", error);
            return false;
        }
    }
}
export default new NotificationService();
//# sourceMappingURL=NotificationService.js.map