const db = require('../config/db.config');

class Thought {
    // Get all thoughts for a specific branch
    static async findByBranch(branch) {
        try {
            const [rows] = await db.query(
                `SELECT t.*, u.first_name, u.last_name 
                 FROM thoughts t 
                 LEFT JOIN users u ON t.created_by = u.id 
                 WHERE t.branch = ? AND t.is_active = TRUE 
                 ORDER BY t.created_at DESC`,
                [branch]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get a random thought for a specific branch
    static async getRandomByBranch(branch) {
        try {
            const [rows] = await db.query(
                `SELECT t.*, u.first_name, u.last_name 
                 FROM thoughts t 
                 LEFT JOIN users u ON t.created_by = u.id 
                 WHERE t.branch = ? AND t.is_active = TRUE 
                 ORDER BY RAND() 
                 LIMIT 1`,
                [branch]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get thought by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT t.*, u.first_name, u.last_name 
                 FROM thoughts t 
                 LEFT JOIN users u ON t.created_by = u.id 
                 WHERE t.id = ? LIMIT 1`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Create new thought
    static async create(thoughtData) {
        try {
            const { content, author, branch, created_by } = thoughtData;

            const [result] = await db.query(
                `INSERT INTO thoughts (content, author, branch, created_by, is_active) 
                 VALUES (?, ?, ?, ?, TRUE)`,
                [content, author, branch, created_by]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Update thought
    static async update(id, thoughtData) {
        try {
            const { content, author } = thoughtData;

            await db.query(
                `UPDATE thoughts 
                 SET content = ?, author = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [content, author, id]
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Delete thought (soft delete)
    static async delete(id) {
        try {
            await db.query(
                'UPDATE thoughts SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get all thoughts (admin only)
    static async findAll(filters = {}) {
        try {
            let query = `SELECT t.*, u.first_name, u.last_name 
                        FROM thoughts t 
                        LEFT JOIN users u ON t.created_by = u.id 
                        WHERE t.is_active = TRUE`;
            const params = [];

            if (filters.branch) {
                query += ' AND t.branch = ?';
                params.push(filters.branch);
            }

            query += ' ORDER BY t.created_at DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Thought;
