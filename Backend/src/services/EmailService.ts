import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface MailOptions {
    fromName: string;
    fromEmail: string;
    subject: string;
    message: string;
}

class EmailService {
    private transporter;

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

    async sendContactEmail({ fromName, fromEmail, subject, message }: MailOptions) {
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
        } catch (error) {
            console.error("Mail Error:", error);
            throw new Error("Failed to send email");
        }
    }

    // Add this method to your EmailService class in ../services/EmailService.ts

    async sendRegistrationEmail(userEmail: string, fullName: string, systemId: string, rawPassword: string) {
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
        } catch (error) {
            console.error("Failed to send registration email:", error);
        }
    }
}

export default new EmailService();