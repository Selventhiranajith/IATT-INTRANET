const db = require('../config/db.config');

class Announcement {
    // Get all announcements
    static async findAll() {
        const [rows] = await db.query(`
            SELECT a.*, u.first_name, u.last_name
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            ORDER BY a.created_at DESC
        `);
        return rows;
    }

    // Create a new announcement
    static async create(data) {
        const { title, content, priority, created_by, publish_at, expiry_at } = data;
        const [result] = await db.query(
            `INSERT INTO announcements (title, content, priority, created_by, publish_at, expiry_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [title, content, priority || 'Normal', created_by, publish_at || null, expiry_at || null]
        );
        return result.insertId;
    }

    // Delete an announcement
    static async remove(id) {
        const [result] = await db.query(`DELETE FROM announcements WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Announcement;
