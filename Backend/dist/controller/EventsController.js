import pool from '../database/db.js';
class EventController {
    async getAllEvents(req, res) {
        try {
            // We fetch the base64 string directly from MySQL
            const [rows] = await pool.execute('SELECT id, title, type, event_date, event_time, location, attendees, description, TO_BASE64(event_bg) as event_bg FROM events ORDER BY event_date ASC, event_time ASC');
            const eventsWithImages = rows.map(event => {
                let formattedBg = null;
                if (event.event_bg) {
                    const b64 = event.event_bg;
                    // Detect the format by checking the start of the base64 string
                    // iVBORw0KGgo = PNG
                    // /9j/ = JPEG
                    // R0lGOD = GIF
                    // UklGR = WebP
                    let mimeType = 'image/jpeg'; // Default fallback
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
        // multer adds the file to req.file
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
                    event_bg: null // Birthdays usually don't have custom backgrounds
                };
            });
            return res.status(200).json(birthdayEvents);
        }
        catch (error) {
            console.error("Birthday Fetch Error:", error);
            return res.status(500).json({ message: "Error fetching birthdays." });
        }
    }
}
export default new EventController();
//# sourceMappingURL=EventsController.js.map