import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
class NotificationService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    async sendRegistrationEmail(userEmail, fullName, systemId, rawPassword) {
        try {
            const mailOptions = {
                from: `"System Registration" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: "Welcome! Your Account Has Been Created",
                html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                <h2 style="color: #2563eb;">Account Successfully Created</h2>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>Your registration is complete. You can now log in to the system using the following credentials:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${rawPassword}</code></p>
                </div>

                <p style="font-size: 14px; color: #555;"><strong>System ID:</strong> ${systemId}</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999;">For security reasons, we recommend changing your password after your first login.</p>
            </div>
            `
            };
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error("Failed to send registration email:", error);
        }
    }
    async sendBroadcastNotification({ recipientEmail, recipientName, title, message }) {
        try {
            const mailOptions = {
                from: `"Community Alerts" <${process.env.EMAIL_USER}>`,
                to: recipientEmail,
                subject: `📢 ${title}`,
                html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #00308F; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 20px; text-transform: uppercase;">Official Notification</h1>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p style="font-size: 16px; color: #111827;">Hello <strong>${recipientName}</strong>,</p>
                    <h2 style="color: #111827; font-size: 18px; margin-top: 20px;">${title}</h2>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                            This is an automated system alert. Please do not reply directly to this email.
                        </p>
                    </div>
                </div>
            </div>
            `
            };
            return await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error(`Failed to send notification to ${recipientEmail}:`, error);
            return null;
        }
    }
}
export default new NotificationService();
//# sourceMappingURL=NotificationService.js.map