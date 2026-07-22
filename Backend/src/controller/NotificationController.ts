import { Request, Response } from 'express';
import db from '../database/db.js';
import NotificationService from '../services/NotificationService.js';

export class NotificationController {
    async sendNotification(req: Request, res: Response) {
        try {
            const { title, message, target_groups, channels, sender_id } = req.body;

            // Ensure groupsArray contains cleaned, trimmed strings
            const rawGroups = Array.isArray(target_groups)
                ? target_groups
                : (target_groups ? target_groups.split(',') : []);

            const groupsArray = rawGroups.map((g: string) => g.trim().toLowerCase());

            let userSql = "SELECT email, contact_number, CONCAT(firstname, ' ', lastname) as full_name FROM users WHERE 1=0";
            let userParams: any[] = [];

            groupsArray.forEach((group: string) => {
                if (group === 'all') {
                    userSql += " OR 1=1";
                } else if (group === 'pwd') {
                    userSql += " OR LOWER(type) = 'pwd'";
                } else if (group === 'sc') {
                    userSql += " OR LOWER(type) = 'sc'";
                } else if (group === 'flood_prone') {
                    userSql += " OR is_flood_prone = 1";
                } else {
                    userSql += " OR LOWER(type) = LOWER(?)";
                    userParams.push(group);
                }
            });

            const [users]: any = await db.query(userSql, userParams);
            if (!users || users.length === 0) {
                return res.status(404).json({ error: "No recipients found for the selected groups" });
            }

            const channelOptions = ['Email', 'SMS', 'Web'];
            const bits = channelOptions.map(ch => (channels && channels.includes(ch)) ? "1" : "0");
            const bitmaskString = bits.join(",");

            const [result]: any = await db.query(
                `INSERT INTO notifications (sender_id, target_groups, channels_bitmask, title, message, recipient_count) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [sender_id, groupsArray.join(','), bitmaskString, title, message, users.length]
            );

            // Channel 0: Email
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

            // Channel 1: SMS
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

            // Channel 2: Web
            if (bits[2] === "1") {
                console.log("[Web Alert] Notification pushed to web dashboard");
            }

            return res.status(201).json({
                success: true,
                message: `Alert sent via: ${channels ? channels.join(' & ') : 'None'}`,
                recipient_count: users.length
            });

        } catch (error) {
            console.error("Broadcast Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async getNotificationsByUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            // 1. Fetch user attributes first to accurately check targeting
            const [userRows]: any = await db.query(
                "SELECT LOWER(type) as type, is_flood_prone FROM users WHERE id = ?",
                [id]
            );

            if (!userRows || userRows.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const currentUser = userRows[0];
            const userType = currentUser.type || '';
            const isFloodProne = currentUser.is_flood_prone == 1;

            // 2. Query notifications using proper string matching conditions
            const sql = `
                SELECT 
                    n.id,
                    n.title,
                    n.message as \`desc\`,
                    n.created_at as date,
                    n.target_groups,
                    n.channels_bitmask,
                    CASE WHEN nr.read_at IS NULL THEN 'unread' ELSE 'read' END as status
                FROM notifications n
                LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
                LEFT JOIN hidden_notifications hn ON n.id = hn.notification_id AND hn.user_id = ?
                WHERE hn.id IS NULL
                  AND (
                     LOWER(n.target_groups) LIKE '%all%'
                     OR (? != '' AND FIND_IN_SET(?, LOWER(n.target_groups)) > 0)
                     OR (? != '' AND LOWER(n.target_groups) LIKE CONCAT('%', ?, '%'))
                     OR (? = 1 AND LOWER(n.target_groups) LIKE '%flood_prone%')
                  )
                ORDER BY n.created_at DESC
                LIMIT 50
            `;

            const [rows]: any = await db.query(sql, [
                id,
                id,
                userType,
                userType,
                userType,
                userType,
                isFloodProne ? 1 : 0
            ]);

            const channelMap = ['Email', 'SMS', 'Web'];

            const formattedNotifications = rows.map((row: any) => {
                // Parse channels bitmask if available (e.g., "1,0,1" -> ['Email', 'Web'])
                let activeChannels: string[] = ['Web', 'SMS'];
                if (row.channels_bitmask) {
                    const bits = row.channels_bitmask.split(',');
                    const mapped = channelMap.filter((_, idx) => bits[idx] === '1');
                    if (mapped.length > 0) activeChannels = mapped;
                }

                return {
                    id: row.id,
                    title: row.title,
                    message: row.desc,
                    date: row.date,
                    status: row.status,
                    channels: activeChannels
                };
            });

            return res.status(200).json(formattedNotifications);
        } catch (error) {
            console.error("Error fetching user notifications:", error);
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


    async sendSupportRequest(req: Request, res: Response) {
        try {
            const { user_id, message, channel } = req.body;

            const [residentRows]: any = await db.query(
                "SELECT CONCAT(firstname, ' ', lastname) as full_name FROM users WHERE id = ?",
                [user_id]
            );

            if (residentRows.length === 0) {
                return res.status(404).json({ error: "Sender not found in database." });
            }

            const residentName = residentRows[0].full_name;

            await db.query(
                `INSERT INTO support_tickets (user_id, message, channel) VALUES (?, ?, ?)`,
                [user_id, message, channel]
            );

            const [admins]: any = await db.query(
                "SELECT email, contact_number, firstname FROM users WHERE role = 1"
            );

            if (admins.length === 0) {
                return res.status(404).json({ error: "No administrators found." });
            }

            for (const admin of admins) {
                if (channel === 'Email' && admin.email) {
                    await NotificationService.sendBroadcastNotification({
                        recipientEmail: admin.email,
                        recipientName: admin.firstname,
                        title: "New Support Request",
                        message: `Resident ${residentName} (ID #${user_id}) sent a message: ${message}`
                    });
                } else if (channel === 'SMS' && admin.contact_number) {
                    await NotificationService.sendSMS({
                        phoneNumber: admin.contact_number,
                        message: `Support Req from ${residentName}: ${message}`
                    });
                }
            }

            return res.status(200).json({ success: true, message: "Support request sent to Admin." });
        } catch (error) {
            console.error("Support Request Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async hideNotif(req: Request, res: Response) {
        const { user_id, notification_id } = req.body;
        try {
            await db.query(
                'INSERT IGNORE INTO hidden_notifications (user_id, notification_id) VALUES (?, ?)',
                [user_id, notification_id]
            );
            return res.status(200).json({ message: "Notification hidden for user" });
        } catch (error) {
            console.error("Hide Error:", error);
            return res.status(500).json({ error: "Failed to hide notification" });
        }
    }
    public async getSupportTicketsByUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const sql = `
                SELECT 
                    id, 
                    message, 
                    channel, 
                    created_at as date 
                FROM support_tickets 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            `;
            const [rows]: any = await db.query(sql, [id]);
            return res.status(200).json(rows);
        } catch (error) {
            console.error("Error fetching user support tickets:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    public async markAllRead(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id } = req.body;

            if (!user_id) {
                return res.status(400).json({ error: "Missing user_id" });
            }

            // This query inserts a 'read' record for every notification targeting this user 
            // (either 'all' or their specific type) that they haven't read yet.
            const sql = `
            INSERT IGNORE INTO notification_reads (notification_id, user_id)
            SELECT n.id, ? 
            FROM notifications n
            WHERE (n.target_groups LIKE '%all%' 
               OR n.target_groups LIKE (SELECT CONCAT('%', type, '%') FROM users WHERE id = ?))
            AND n.id NOT IN (
                SELECT notification_id FROM notification_reads WHERE user_id = ?
            )
        `;

            await db.query(sql, [user_id, user_id, user_id]);

            return res.status(200).json({
                success: true,
                message: "All notifications marked as read"
            });
        } catch (error) {
            console.error("Error marking all as read:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
export default new NotificationController();