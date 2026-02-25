import { Request, Response } from 'express';
import pool from '../database/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

class EventController {
    public async getAllEvents(req: Request, res: Response): Promise<Response> {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM events ORDER BY event_date ASC, event_time ASC'
            );

            return res.status(200).json(rows);
        } catch (error) {
            console.error("Fetch Events Error:", error);
            return res.status(500).json({ message: "Failed to retrieve events." });
        }
    }

    public async createEvent(req: Request, res: Response): Promise<Response> {
        const {
            title,
            type,
            date,
            time,
            location,
            attendees,
            description
        } = req.body;

        try {
            // Validation for required fields
            if (!title || !type || !date || !time || !location) {
                return res.status(400).json({ message: "Missing required fields." });
            }

            // Ensure attendees matches the allowed values (SC, PWD, BOTH)
            // If the frontend sends something else, we default to 'BOTH'
            const validAttendees = ['SC', 'PWD', 'BOTH'].includes(attendees)
                ? attendees
                : 'BOTH';

            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO events (
                    title, 
                    type, 
                    event_date, 
                    event_time, 
                    location, 
                    attendees, 
                    description
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    type,
                    date,
                    time,
                    location,
                    validAttendees,
                    description || null
                ]
            );

            return res.status(201).json({
                message: "Event created successfully",
                eventId: result.insertId
            });
        } catch (error) {
            console.error("Create Event Error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    }
    public async getAllBirthdays(req: Request, res: Response): Promise<Response> {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(
                `SELECT id, firstname, lastname, birthday 
             FROM users 
             WHERE birthday IS NOT NULL`
            );

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
                    description: `Happy Birthday to ${user.firstname}!`
                };
            });

            return res.status(200).json(birthdayEvents);
        } catch (error) {
            console.error("Birthday Fetch Error:", error);
            return res.status(500).json({ message: "Error fetching birthdays." });
        }
    }
}

export default new EventController();