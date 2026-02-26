import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
class EmailService {
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
    async sendContactEmail({ fromName, fromEmail, subject, message }) {
        try {
            const mailOptions = {
                from: `"${fromName}" <${process.env.EMAIL_USER}>`,
                to: 'tejaresdale@gmail.com',
                replyTo: fromEmail,
                subject: `Portfolio Contact: ${subject}`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">New Portfolio Message</h2>
            <p><strong>Name:</strong> ${fromName}</p>
            <p><strong>Email:</strong> ${fromEmail}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="white-space: pre-wrap; color: #444; line-height: 1.6;">${message}</p>
          </div>
        `,
            };
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true };
        }
        catch (error) {
            console.error("Mail Error:", error);
            throw new Error("Failed to send email");
        }
    }
    async sendLoginNotification(userEmail, fullName) {
        try {
            const mailOptions = {
                from: `"System Security" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: "Successful Login Notification",
                html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #10b981;">Login Successful</h2>
                    <p>Hello <strong>${fullName}</strong>,</p>
                    <p>This is a confirmation that you have successfully logged into your account.</p>
                    <p style="color: #666; font-size: 12px;">Timestamp: ${new Date().toLocaleString()}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">If this wasn't you, please change your password immediately.</p>
                </div>
                `
            };
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error("Failed to send login email:", error);
        }
    }
}
export default new EmailService();
//# sourceMappingURL=EmailService.js.map