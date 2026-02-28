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
    private readonly SENDER_NAME = "BARANGAY 183 NOTIFICATION CENTER";

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

        if (cleanPhone.startsWith('0')) {
            return `+63${cleanPhone.substring(1)}`;
        } else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
            return `+63${cleanPhone}`;
        } else if (cleanPhone.startsWith('63') && cleanPhone.length === 12) {
            return `+${cleanPhone}`;
        } else if (cleanPhone.startsWith('+')) {
            return cleanPhone;
        }

        return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    }

    async sendSMS({ phoneNumber, message }: SMSOptions) {
        /*
            if (user.contact_number) {
                notificationService.sendSMS({
                    phoneNumber: user.contact_number,
                    message: `Security Alert: Admin login detected for account ${user.email} at ${new Date().toLocaleTimeString()}.`
                }).catch(err => console.error("SMS Background Error:", err));
            }
        */
        try {
            if (!this.deviceId) {
                throw new Error("SMS_GATEWAY_DEVICE_ID is not configured.");
            }

            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            const officialMessage = `${this.SENDER_NAME}\n\n${message}`;
            const url = 'https://api.sms-gate.app/3rdparty/v1/messages';

            const payload = {
                textMessage: {
                    text: officialMessage
                },
                phoneNumbers: [formattedPhone],
                deviceId: this.deviceId
            };

            console.log(`[SMS DEBUG] Sending to: ${formattedPhone}`);

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Basic ${this.smsAuth}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`[SMS] Successfully sent to Cloud Relay for ${formattedPhone}.`);
            return response.data;
        } catch (error: any) {
            const status = error.response?.status;
            const data = error.response?.data;
            console.error(`[SMS Error] Status: ${status} | Details:`, data || error.message);
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
                    </div>
                `
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`[Email] Registration sent to ${userEmail}`);
        } catch (error) {
            console.error("[Email Error] Failed:", error);
        }
    }

    async sendBroadcastNotification({ recipientEmail, recipientName, title, message }: BulkNotifyOptions) {
        try {
            const mailOptions = {
                from: `"Barangay 183 Alerts" <${process.env.EMAIL_USER}>`,
                to: recipientEmail,
                subject: `📢 ${title}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <h2 style="color: #111827;">${title}</h2>
                        <p>Hello ${recipientName},</p>
                        <p>${message}</p>
                    </div>
                `
            };
            return await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error(`[Email Error] Broadcast failed to ${recipientEmail}:`, error);
            return null;
        }
    }
}

export default new NotificationService();