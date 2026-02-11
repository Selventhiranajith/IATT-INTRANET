const db = require('../config/db.config');

class User {
    // Find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE email = ? LIMIT 1',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT id, employee_id, email, first_name, last_name, role, branch, department, position, phone, status, last_login, created_at FROM users WHERE id = ? LIMIT 1',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Find user by employee ID
    static async findByEmployeeId(employeeId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE employee_id = ? LIMIT 1',
                [employeeId]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Create new user
    static async create(userData) {
        try {
            const { employee_id, email, password, first_name, last_name, role, branch, department, position, birth_date, phone } = userData;

            const [result] = await db.query(
                `INSERT INTO users (employee_id, email, password, first_name, last_name, role, branch, department, position, birth_date, phone, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                [employee_id, email, password, first_name, last_name, role || 'employee', branch, department, position, birth_date, phone]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Update last login timestamp
    static async updateLastLogin(userId) {
        try {
            await db.query(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Update user status
    static async updateStatus(userId, status) {
        try {
            await db.query(
                'UPDATE users SET status = ? WHERE id = ?',
                [status, userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get all users (for admin)
    static async findAll(filters = {}) {
        try {
            let query = 'SELECT id, employee_id, email, first_name, last_name, role, branch, department, position, birth_date, phone, status, last_login, created_at FROM users WHERE 1=1';
            const params = [];

            if (filters.role) {
                query += ' AND role = ?';
                params.push(filters.role);
            }

            if (filters.branch) {
                query += ' AND branch = ?';
                params.push(filters.branch);
            }

            if (filters.status) {
                query += ' AND status = ?';
                params.push(filters.status);
            }

            if (filters.department) {
                query += ' AND department = ?';
                params.push(filters.department);
            }

            query += ' ORDER BY created_at DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Delete user
    static async delete(userId) {
        try {
            await db.query('DELETE FROM users WHERE id = ?', [userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
