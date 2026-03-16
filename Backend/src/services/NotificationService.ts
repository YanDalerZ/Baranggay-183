import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface BulkNotifyOptions {
    recipientEmail: string;
    recipientName: string;
    title: string;
    message: string;
}

interface SMSOptions {
    phoneNumber: string | number;
    message: string;
}

class NotificationService {
    private transporter: any;
    private readonly SENDER_LABEL = "BRGY 183 ALERT";
    private readonly SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages';
    private readonly SEMAPHORE_API_KEY = 'a7b3f101637f65bb2bb01bfd0ac5595c';

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

    private formatPhoneNumber(phone: string | number): string {
        let cleanPhone = String(phone).trim().replace(/\D/g, '');

        if (cleanPhone.startsWith('0')) {
            cleanPhone = '63' + cleanPhone.substring(1);
        }
        else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
            cleanPhone = '63' + cleanPhone;
        }

        return cleanPhone;
    }

    async sendSMS({ phoneNumber, message }: SMSOptions) {
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
        } catch (error: any) {
            if (error.response) {
                console.error(`[SMS Error] status: ${error.response.status}`);
                console.error(`[SMS Error] data:`, error.response.data);
            } else {
                console.error(`[SMS Error] message: ${error.message}`);
            }
            return null;
        }
    }

    async sendRegistrationEmail(userEmail: string, fullName: string, systemId: string, rawPassword: string) {
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
        } catch (error) {
            console.error("[Email Error] Registration Email Failed:", error);
        }
    }

    async sendBroadcastNotification({ recipientEmail, recipientName, title, message }: BulkNotifyOptions) {
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
        } catch (error) {
            console.error(`[Email Error] Broadcast failed to ${recipientEmail}`);
            return null;
        }
    }
}

export default new NotificationService();