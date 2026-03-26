import pool from '../database/db.js';
import NotificationService from '../services/NotificationService.js';
class EventController {
    async getAllEvents(req, res) {
        try {
            const [rows] = await pool.execute('SELECT id, title, type, event_date, event_time, location, attendees, description, TO_BASE64(event_bg) as event_bg FROM events ORDER BY event_date ASC, event_time ASC');
            const eventsWithImages = rows.map(event => {
                let formattedBg = null;
                if (event.event_bg) {
                    const b64 = event.event_bg;
                    let mimeType = 'image/jpeg';
                    if (b64.startsWith('iVBORw0KGgo')) {
                        mimeType = 'image/png';
                    }
                    else if (b64.startsWith('R0lGOD')) {
                        mimeType = 'image/gif';
                    }
                    else if (b64.startsWith('UklGR')) {
                        mimeType = 'image/webp';
                    }
                    formattedBg = `data:${mimeType};base64,${b64}`;
                }
                return {
                    ...event,
                    event_bg: formattedBg
                };
            });
            return res.status(200).json(eventsWithImages);
        }
        catch (error) {
            console.error("Fetch Events Error:", error);
            return res.status(500).json({ message: "Failed to retrieve events." });
        }
    }
    async createEvent(req, res) {
        const { title, type, date, time, location, attendees, description } = req.body;
        const eventBg = req.file ? req.file.buffer : null;
        try {
            if (!title || !type || !date || !time || !location) {
                return res.status(400).json({ message: "Missing required fields." });
            }
            const validAttendees = ['SC', 'PWD', 'BOTH'].includes(attendees)
                ? attendees
                : 'BOTH';
            const [result] = await pool.execute(`INSERT INTO events (
                    title, 
                    type, 
                    event_date, 
                    event_time, 
                    location, 
                    attendees, 
                    description,
                    event_bg
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                title,
                type,
                date,
                time,
                location,
                validAttendees,
                description || null,
                eventBg
            ]);
            NotificationService.notifyTargetGroup(validAttendees, `New Event: ${title}`, `A new ${type} event has been scheduled on ${date} at ${location}. We hope to see you there!`);
            return res.status(201).json({
                message: "Event created successfully",
                eventId: result.insertId
            });
        }
        catch (error) {
            console.error("Create Event Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
    async getAllBirthdays(req, res) {
        try {
            const [rows] = await pool.execute(`SELECT id, firstname, lastname, birthday 
             FROM users 
             WHERE birthday IS NOT NULL`);
            const currentYear = new Date().getFullYear();
            const birthdayEvents = rows.map(user => {
                const bday = new Date(user.birthday);
                const month = String(bday.getMonth() + 1).padStart(2, '0');
                const day = String(bday.getDate()).padStart(2, '0');
                return {
                    id: `bday-${user.id}`,
                    title: `${user.firstname} ${user.lastname}`,
                    type: 'Birthday',
                    event_date: `${currentYear}-${month}-${day}`,
                    event_time: '00:00:00',
                    location: 'Community',
                    attendees: 'All',
                    description: `Happy Birthday to ${user.firstname}!`,
                    event_bg: null
                };
            });
            return res.status(200).json(birthdayEvents);
        }
        catch (error) {
            console.error("Birthday Fetch Error:", error);
            return res.status(500).json({ message: "Error fetching birthdays." });
        }
    }
    async updateEvent(req, res) {
        const { id } = req.params;
        const { title, type, date, time, location, attendees, description } = req.body;
        const eventBg = req.file ? req.file.buffer : null;
        try {
            const [exists] = await pool.execute('SELECT id FROM events WHERE id = ?', [id]);
            if (exists.length === 0) {
                return res.status(404).json({ message: "Event not found." });
            }
            let query = `
                UPDATE events 
                SET title = ?, type = ?, event_date = ?, event_time = ?, 
                    location = ?, attendees = ?, description = ?
            `;
            const params = [title, type, date, time, location, attendees, description || null];
            if (eventBg) {
                query += `, event_bg = ? `;
                params.push(eventBg);
            }
            query += ` WHERE id = ?`;
            params.push(id);
            await pool.execute(query, params);
            NotificationService.notifyTargetGroup(attendees, `Event Updated: ${title}`, `The event "${title}" has been updated. Please check the portal for new details regarding the date, time, or location.`);
            return res.status(200).json({ message: "Event updated successfully." });
        }
        catch (error) {
            console.error("Update Event Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
    async deleteEvent(req, res) {
        const { id } = req.params;
        try {
            const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Event not found." });
            }
            return res.status(200).json({ message: "Event deleted successfully." });
        }
        catch (error) {
            console.error("Delete Event Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
}
export default new EventController();
//# sourceMappingURL=EventsController.js.map