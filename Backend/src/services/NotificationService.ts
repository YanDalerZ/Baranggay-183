import axios from 'axios';
import { RowDataPacket } from 'mysql2';
import pool from '../database/db.js';

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

interface TargetUser extends RowDataPacket {
    email: string;
    firstname: string;
    lastname: string;
    contact_number: string;
}

interface ConfigurationRow extends RowDataPacket {
    key: string;
    value: string;
}

class NotificationService {
    private readonly SENDER_LABEL = "This is a message from Villamor Town Hall.";
    private readonly UNISMS_API_URL = 'https://unismsapi.com/api/sms';
    private readonly EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

    private configCache: Map<string, string> | null = null;

    constructor() { }

    private async getConfigValue(key: string): Promise<string> {
        if (!this.configCache) {
            this.configCache = new Map<string, string>();
            try {
                const [rows] = await pool.query<ConfigurationRow[]>('SELECT `key`, `value` FROM global_configurations');
                for (const row of rows) {
                    if (row.key) {
                        const normalizedKey = row.key.toLowerCase().replace(/_/g, '');
                        this.configCache.set(normalizedKey, String(row.value ?? ''));
                    }
                }
            } catch (err) {
                console.error('[Notification Config Error] Failed to initialize DB configuration values:', err);
            }
        }

        const lookupKey = key.toLowerCase().replace(/_/g, '');
        return this.configCache.get(lookupKey) || '';
    }

    private formatPhoneNumber(phone: string | number): string {
        let cleanPhone = String(phone).trim().replace(/\D/g, '');

        if (cleanPhone.startsWith('0')) {
            cleanPhone = '63' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
            cleanPhone = '63' + cleanPhone;
        }

        return '+' + cleanPhone;
    }

    public async notifyTargetGroup(attendeeType: 'SC' | 'PWD' | 'BOTH', title: string, message: string) {
        try {
            let query = 'SELECT email, firstname, lastname, contact_number FROM users WHERE status = "active"';
            const params: any[] = [];

            if (attendeeType !== 'BOTH') {
                query += ' AND type = ?';
                params.push(attendeeType);
            }

            const [users] = await pool.execute<TargetUser[]>(query, params);

            this.configCache = null;
            await this.getConfigValue('smsApiKey');

            const notificationPromises = users.map(async (user) => {
                const fullName = `${user.firstname} ${user.lastname}`;

                await this.sendBroadcastNotification({
                    recipientEmail: user.email,
                    recipientName: fullName,
                    title: title,
                    message: message
                });

                if (user.contact_number) {
                    await this.sendSMS({
                        phoneNumber: user.contact_number,
                        message: `${title}: ${message}`
                    });
                }
            });

            await Promise.allSettled(notificationPromises);
            console.log(`[Notification] Broadcast completed for ${users.length} users.`);
        } catch (error) {
            console.error("[Notification Error] Bulk notify failed:", error);
        }
    }

    private async sendViaEmailJS(toEmail: string, subject: string, htmlContent: string) {
        const serviceId = await this.getConfigValue('emailJsServiceId');
        const templateId = await this.getConfigValue('emailJsTemplateId');
        const publicKey = await this.getConfigValue('emailJsPublicKey');

        const payload = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                to_email: toEmail,
                subject: subject,
                html_content: htmlContent,
                to_name: '',
            },
        };

        return await axios.post(this.EMAILJS_API_URL, payload);
    }

    // UPDATED: Fetches sender_id dynamically from global_configurations table
    async sendSMS({ phoneNumber, message }: SMSOptions) {
        try {
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            const smsApiToken = await this.getConfigValue('smsApiKey');
            const smsSenderId = await this.getConfigValue('smsSenderId');

            // Fallback default value to "UniSMS" if database configuration returns empty string
            const finalSenderId = smsSenderId || "UniSMS";

            const payload = {
                recipient: formattedPhone,
                content: `[${this.SENDER_LABEL}]\n${message}`,
                sender_id: finalSenderId
            };

            const tokenBase64 = Buffer.from(`${smsApiToken}:`).toString('base64');

            const response = await axios.post(this.UNISMS_API_URL, payload, {
                headers: {
                    'Authorization': `Basic ${tokenBase64}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`[SMS Success] sent via UniSMS to ${formattedPhone}:`, response.data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.error(`[SMS Error] UniSMS status: ${error.response.status}`);
                console.error(`[SMS Error] UniSMS response data:`, error.response.data);
            } else {
                console.error(`[SMS Error] Network/Configuration message: ${error.message}`);
            }
            return null;
        }
    }

    async sendRegistrationEmail(userEmail: string, fullName: string, systemId: string, rawPassword: string) {
        try {
            const subject = "Account Created - Barangay 183 System";
            const html = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Welcome to Barangay 183</h2>
                    <p>Hello <strong>${fullName}</strong>,</p>
                    <p>Your account has been set up. Credentials:</p>
                    <p><strong>Email:</strong> ${userEmail}</p>
                    <p><strong>Password:</strong> ${rawPassword}</p>
                    <p><strong>System ID:</strong> ${systemId}</p>
                    <p style="margin-top:20px; font-size:12px; color:gray;">Please change your password after your first login.</p>
                </div>
            `;

            await this.sendViaEmailJS(userEmail, subject, html);
            console.log(`[Email] Registration sent to ${userEmail}`);
        } catch (error) {
            console.error("[Email Error] Registration Email Failed:", error);
        }
    }

    async sendExpiryWarningEmail(userEmail: string, fullName: string, timeLeft: string, expiryDate: string) {
        try {
            const subject = "⚠️ Action Required: ID Expiry Warning - Barangay 183";
            const html = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fbbf24; border-radius: 10px;">
                    <h2 style="color: #d97706;">ID Expiry Notice</h2>
                    <p>Hello <strong>${fullName}</strong>,</p>
                    <p>This is a friendly reminder that your registered ID in our system is approaching its expiration date.</p>
                    
                    <div style="background:#fff7ed; padding:15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                        <p style="margin:0;"><strong>Status:</strong> Expiring in ${timeLeft}</p>
                        <p style="margin:5px 0 0 0;"><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
                    </div>

                    <p>Please ensure you renew your documentation and update your profile to maintain uninterrupted access to barangay services.</p>
                    <p style="margin-top:20px; font-size:12px; color:gray;">If you have already renewed your ID, please ignore this email.</p>
                </div>
            `;

            await this.sendViaEmailJS(userEmail, subject, html);
            console.log(`[Email] Expiry warning sent to ${userEmail}`);
        } catch (error) {
            console.error("[Email Error] Expiry Warning Failed:", error);
        }
    }

    async sendBroadcastNotification({ recipientEmail, recipientName, title, message }: BulkNotifyOptions) {
        try {
            const subject = `📢 ${title}`;
            const html = `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px;">
                    <h2 style="color: #b91c1c; margin-top:0;">${title}</h2>
                    <p>Attention ${recipientName},</p>
                    <div style="background:#fef2f2; padding:15px; border-radius:8px; color:#991b1b; font-weight:bold;">
                        ${message}
                    </div>
                    <p style="font-size: 11px; color: #6b7280; margin-top: 20px;">
                        This is an official emergency broadcast from the Barangay 183 Command Center.
                    </p>
                </div>
            `;

            const response = await this.sendViaEmailJS(recipientEmail, subject, html);
            return response.data;
        } catch (error) {
            console.error(`[Email Error] Broadcast failed to ${recipientEmail}`);
            return null;
        }
    }

    async sendPasswordResetEmail(userEmail: string, fullName: string, resetToken: string) {
        try {
            const frontendUrl = await this.getConfigValue('frontendUrl');
            const baseUrl = frontendUrl || 'http://localhost:5173/';
            const resetLink = `${baseUrl}/reset-password/${resetToken}`;

            const subject = "Password Reset Request - Barangay 183";
            const html = `
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
            `;

            await this.sendViaEmailJS(userEmail, subject, html);
            console.log(`[Email] Reset link sent to ${userEmail}`);
            return true;
        } catch (error) {
            console.error("[Email Error] Password Reset Email Failed:", error);
            return false;
        }
    }
}

export default new NotificationService();