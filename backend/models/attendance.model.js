const db = require('../config/db.config');

class Attendance {
    // Check In (Create new session)
    static async checkIn(userId, date, checkInTime, remarks) {
        try {
            // Check if there is already an active session
            const [activeSessions] = await db.query(
                `SELECT * FROM attendance_logs WHERE user_id = ? AND date = ? AND status = 'active'`,
                [userId, date]
            );

            if (activeSessions.length > 0) {
                throw new Error('You already have an active session. Please check out first.');
            }

            const [result] = await db.query(
                `INSERT INTO attendance_logs (user_id, date, check_in, check_in_remarks, status) 
                 VALUES (?, ?, ?, ?, 'active')`,
                [userId, date, checkInTime, remarks]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Check Out (End active session)
    static async checkOut(userId, date, checkOutTime, remarks) {
        try {
            // Find active session
            const [activeSessions] = await db.query(
                `SELECT * FROM attendance_logs WHERE user_id = ? AND date = ? AND status = 'active' ORDER BY check_in DESC LIMIT 1`,
                [userId, date]
            );

            if (activeSessions.length === 0) {
                throw new Error('No active session found to check out from.');
            }

            const session = activeSessions[0];

            // Calculate duration
            const checkIn = new Date(session.check_in);
            const checkOut = new Date(checkOutTime);
            const durationMs = checkOut - checkIn;
            const durationMinutes = Math.floor(durationMs / 60000); // milliseconds to minutes

            await db.query(
                `UPDATE attendance_logs 
                 SET check_out = ?, check_out_remarks = ?, status = 'completed', duration_minutes = ? 
                 WHERE id = ?`,
                [checkOutTime, remarks, durationMinutes, session.id]
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get today's logs for user
    static async getTodayLogs(userId, date) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM attendance_logs WHERE user_id = ? AND date = ? ORDER BY check_in ASC`,
                [userId, date]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get active session
    static async getActiveSession(userId, date) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM attendance_logs WHERE user_id = ? AND date = ? AND status = 'active' LIMIT 1`,
                [userId, date]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get all logs for admin (with filters)
    static async findAll(filters) {
        try {
            let query = `
                SELECT a.*, u.first_name, u.last_name, u.employee_id 
                FROM attendance_logs a
                JOIN users u ON a.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.branch) {
                query += ' AND u.branch = ?';
                params.push(filters.branch);
            }

            if (filters.date) {
                query += ' AND a.date = ?';
                params.push(filters.date);
            }

            if (filters.employee_id) {
                query += ' AND u.employee_id = ?';
                params.push(filters.employee_id);
            }

            if (filters.name) {
                query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ?)';
                params.push(`%${filters.name}%`, `%${filters.name}%`);
            }

            query += ' ORDER BY a.date DESC, a.check_in DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Attendance;
