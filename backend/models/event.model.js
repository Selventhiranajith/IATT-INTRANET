const db = require('../config/db.config');

class Event {
    // Create new event
    static async create(eventData) {
        try {
            const { title, description, event_date, event_time, location, image_url, created_by } = eventData;

            const [result] = await db.query(
                `INSERT INTO events (title, description, event_date, event_time, location, image_url, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, description, event_date, event_time, location, image_url, created_by]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Add images to event
    static async addImages(eventId, imageUrls) {
        try {
            if (!imageUrls || imageUrls.length === 0) return;

            const values = imageUrls.map(url => [eventId, url]);
            await db.query(
                `INSERT INTO event_images (event_id, image_url) VALUES ?`,
                [values]
            );
        } catch (error) {
            throw error;
        }
    }

    // Get all events (ordered by date) with images
    static async findAll() {
        try {
            // Increase group_concat limit
            await db.query('SET SESSION group_concat_max_len = 10000');

            const [rows] = await db.query(`
                SELECT e.*, u.first_name, u.last_name,
                GROUP_CONCAT(ei.image_url) as all_images
                FROM events e
                LEFT JOIN users u ON e.created_by = u.id
                LEFT JOIN event_images ei ON e.id = ei.event_id
                GROUP BY e.id
                ORDER BY e.event_date ASC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Delete event
    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Update event
    static async update(id, eventData) {
        try {
            const { title, description, event_date, event_time, location, image_url } = eventData;
            let query = `UPDATE events SET title = ?, description = ?, event_date = ?, event_time = ?, location = ?`;
            let params = [title, description, event_date, event_time, location];

            if (image_url) {
                query += `, image_url = ?`;
                params.push(image_url);
            }

            query += ` WHERE id = ?`;
            params.push(id);

            const [result] = await db.query(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get single event by id
    static async findById(id) {
        try {
            await db.query('SET SESSION group_concat_max_len = 10000');
            const [rows] = await db.query(`
                SELECT e.*, u.first_name, u.last_name,
                GROUP_CONCAT(ei.image_url) as all_images
                FROM events e
                LEFT JOIN users u ON e.created_by = u.id
                LEFT JOIN event_images ei ON e.id = ei.event_id
                WHERE e.id = ?
                GROUP BY e.id
            `, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Event;
