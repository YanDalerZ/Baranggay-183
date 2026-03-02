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
    private smsAuth: string;
    private deviceId: string;
    private readonly SENDER_LABEL = "BRGY 183 ALERT";

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

        const smsLogin = process.env.SMS_GATEWAY_LOGIN;
        const smsPassword = process.env.SMS_GATEWAY_PASSWORD;
        this.deviceId = process.env.SMS_GATEWAY_DEVICE_ID || '';
        this.smsAuth = Buffer.from(`${smsLogin}:${smsPassword}`).toString('base64');
    }

    private formatPhoneNumber(phone: string | number): string {
        let cleanPhone = String(phone).trim().replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) return `+63${cleanPhone.substring(1)}`;
        if (cleanPhone.startsWith('9') && cleanPhone.length === 10) return `+63${cleanPhone}`;
        if (cleanPhone.startsWith('63') && cleanPhone.length === 12) return `+${cleanPhone}`;
        return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    }

    async sendSMS({ phoneNumber, message }: SMSOptions) {
        try {
            if (!this.deviceId) throw new Error("SMS Gateway Device ID not set");

            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            const url = 'https://api.sms-gate.app/3rdparty/v1/messages';

            const payload = {
                textMessage: { text: `[${this.SENDER_LABEL}]\n${message}` },
                phoneNumbers: [formattedPhone],
                deviceId: this.deviceId
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Basic ${this.smsAuth}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error(`[SMS Error] for ${phoneNumber}:`, error.message);
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