import { Request, Response } from 'express';
import db from '../database/db.js';
import NotificationService from '../services/NotificationService.js';

export class NotificationController {
    async sendNotification(req: Request, res: Response) {
        try {
            const { title, message, target_groups, channels, sender_id } = req.body;

            const groupsArray = Array.isArray(target_groups) ? target_groups : target_groups.split(',');
            let userSql = "SELECT email, contact_number, CONCAT(firstname, ' ', lastname) as full_name FROM users WHERE 1=0";
            let userParams: any[] = [];

            groupsArray.forEach((group: string) => {
                if (group === 'all') userSql += " OR 1=1";
                else if (group === 'pwd') userSql += " OR type = 'PWD'";
                else if (group === 'sc') userSql += " OR type = 'SC'";
                else if (group === 'flood_prone') userSql += " OR is_flood_prone = 1";
                else {
                    userSql += " OR type = ?";
                    userParams.push(group);
                }
            });

            const [users]: any = await db.query(userSql, userParams);
            if (users.length === 0) {
                return res.status(404).json({ error: "No recipients found for the selected groups" });
            }

            const channelOptions = ['Email', 'SMS', 'Web'];
            const bits = channelOptions.map(ch => channels.includes(ch) ? "1" : "0");
            const bitmaskString = bits.join(",");

            const [result]: any = await db.query(
                `INSERT INTO notifications (sender_id, target_groups, channels_bitmask, title, message, recipient_count) 
             VALUES (?, ?, ?, ?, ?, ?)`,
                [sender_id, groupsArray.join(','), bitmaskString, title, message, users.length]
            );

            if (bits[0] === "1") {
                users.forEach((user: any) => {
                    if (user.email) {
                        NotificationService.sendBroadcastNotification({
                            recipientEmail: user.email,
                            recipientName: user.full_name,
                            title,
                            message
                        }).catch(e => console.error("Email Broadcast Error:", e));
                    }
                });
            }

            if (bits[1] === "1") {
                users.forEach((user: any) => {
                    if (user.contact_number) {
                        NotificationService.sendSMS({
                            phoneNumber: user.contact_number,
                            message: `${title}: ${message}`
                        }).catch(e => console.error("SMS Broadcast Error:", e));
                    }
                });
            }

            if (bits[2] === "1") {

                console.log("[Web Alert] Notification pushed to web dashboard");
            }

            return res.status(201).json({
                success: true,
                message: `Alert sent via: ${channels.join(' & ')}`,
                recipient_count: users.length
            });

        } catch (error) {
            console.error("Broadcast Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getHistory(req: Request, res: Response) {
        try {
            const sql = `
                SELECT 
                    id, 
                    title, 
                    message AS \`desc\`, 
                    recipient_count AS recipients, 
                    DATE_FORMAT(created_at, '%Y-%m-%d %h:%i %p') AS date,
                    target_groups as target_group,
                    channels_bitmask
                FROM notifications
                ORDER BY created_at DESC
            `;
            const [rows]: any = await db.query(sql);

            const channelMap = ['Email', 'SMS', 'Web'];
            const formattedRows = rows.map((row: any) => {
                const bits = row.channels_bitmask ? row.channels_bitmask.split(',') : ["0", "0", "0"];
                return {
                    ...row,
                    target_group: row.target_group ? row.target_group.split(',') : [],
                    channels: channelMap.filter((_, i) => bits[i] === "1")
                };
            });

            return res.status(200).json(formattedRows);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch history" });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const sql = `
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE role = 2) as totalRecipients,
                    (SELECT COUNT(*) FROM users WHERE is_flood_prone = 1) as floodProne,
                    (SELECT COUNT(*) FROM users WHERE disability IS NOT NULL AND disability != '') as highVulnerability,
                    (SELECT COUNT(*) FROM notifications WHERE DATE(created_at) = CURDATE()) as alertsSentToday
            `;

            const [results]: any = await db.query(sql);

            // Ensure we have results, otherwise default to 0
            const stats = results[0] || {
                totalRecipients: 0,
                floodProne: 0,
                highVulnerability: 0,
                alertsSentToday: 0
            };

            return res.status(200).json({
                totalRecipients: stats.totalRecipients,
                floodProneAreas: stats.floodProne,
                highVulnerability: stats.highVulnerability,
                alertsSentToday: stats.alertsSentToday
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            return res.status(500).json({ error: "Failed to fetch stats from the database" });
        }
    }

    async deleteNotification(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await db.query(`DELETE FROM notifications WHERE id = ?`, [id]);
            return res.status(200).json({ success: true, message: "Log removed" });
        } catch (error) {
            return res.status(500).json({ error: "Delete failed" });
        }
    }


    public async markAsRead(req: Request, res: Response): Promise<Response> {
        try {
            const { notification_id, user_id } = req.body;

            if (!notification_id || !user_id) {
                return res.status(400).json({ error: "Missing notification_id or user_id" });
            }

            const sql = `
            INSERT IGNORE INTO notification_reads (notification_id, user_id) 
            VALUES (?, ?)
        `;

            await db.query(sql, [notification_id, user_id]);

            return res.status(200).json({ message: "Notification marked as read" });
        } catch (error) {
            console.error("Error marking as read:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async getNotificationsByUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            // We use a LEFT JOIN to see if a record exists in notification_reads for this user.
            // If nr.read_at is NULL, it means the user hasn't read it yet.
            const sql = `
            SELECT 
                n.id,
                n.title,
                n.message as \`desc\`,
                n.created_at as date,
                n.target_groups,
                CASE WHEN nr.read_at IS NULL THEN 'unread' ELSE 'read' END as status
            FROM notifications n
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
            WHERE n.target_groups LIKE '%all%' 
               OR n.target_groups LIKE (SELECT CONCAT('%', type, '%') FROM users WHERE id = ?)
            ORDER BY n.created_at DESC
            LIMIT 50
        `;

            const [rows]: any = await db.query(sql, [id, id]);

            const formattedNotifications = rows.map((row: any) => ({
                id: row.id,
                title: row.title,
                message: row.desc,
                date: row.date,
                status: row.status,
                channels: ['Web', 'SMS']
            }));

            return res.status(200).json(formattedNotifications);
        } catch (error) {
            console.error("Error fetching user notifications:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default new NotificationController();