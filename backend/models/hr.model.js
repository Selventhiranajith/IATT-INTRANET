const db = require('../config/db.config');

class HRPolicy {
    // Create Policy
    static async create(policyData) {
        try {
            const { title, category, description, content, version, effective_date, prepared_by, approved_by, status, created_by } = policyData;
            const [result] = await db.query(
                `INSERT INTO hr_policies (title, category, description, content, version, effective_date, prepared_by, approved_by, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, category, description, content, version, effective_date, prepared_by, approved_by, status, created_by]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Get All Policies
    static async findAll() {
        try {
            const [rows] = await db.query(
                `SELECT p.*, p.createdAt AS created_at, p.updatedAt AS updated_at, u.first_name, u.last_name 
         FROM hr_policies p 
         LEFT JOIN users u ON p.created_by = u.id 
         ORDER BY p.effective_date DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get Policy by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT p.*, p.createdAt AS created_at, p.updatedAt AS updated_at, u.first_name, u.last_name 
         FROM hr_policies p 
         LEFT JOIN users u ON p.created_by = u.id 
         WHERE p.id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Update Policy
    static async update(id, policyData) {
        try {
            const { title, category, description, content, version, effective_date, prepared_by, approved_by, status } = policyData;

            const [result] = await db.query(
                `UPDATE hr_policies 
         SET title = ?, category = ?, description = ?, content = ?, version = ?, effective_date = ?, prepared_by = ?, approved_by = ?, status = ?
         WHERE id = ?`,
                [title, category, description, content, version, effective_date, prepared_by, approved_by, status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete Policy
    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM hr_policies WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = HRPolicy;
