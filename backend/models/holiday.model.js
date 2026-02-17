const db = require('../config/db.config');

class Holiday {
    // Create new holiday
    static async create(holidayData) {
        try {
            const { name, date, description, branch, created_by } = holidayData;

            const [result] = await db.query(
                `INSERT INTO holidays (name, date, description, branch, created_by) 
                 VALUES (?, ?, ?, ?, ?)`,
                [name, date, description, branch, created_by]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Find all holidays with creator information
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT 
                    h.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u.email as creator_email
                FROM holidays h
                LEFT JOIN users u ON h.created_by = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.branch) {
                query += ' AND h.branch = ?';
                params.push(filters.branch);
            }

            if (filters.year) {
                query += ' AND YEAR(h.date) = ?';
                params.push(filters.year);
            }

            query += ' ORDER BY h.date ASC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Find holiday by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT 
                    h.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name
                FROM holidays h
                LEFT JOIN users u ON h.created_by = u.id
                WHERE h.id = ? 
                LIMIT 1`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Update holiday
    static async update(id, holidayData) {
        try {
            const { name, date, description } = holidayData;

            await db.query(
                `UPDATE holidays 
                 SET name = ?, date = ?, description = ?
                 WHERE id = ?`,
                [name, date, description, id]
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Delete holiday
    static async delete(id) {
        try {
            await db.query('DELETE FROM holidays WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Holiday;
