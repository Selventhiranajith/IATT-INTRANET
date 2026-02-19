const db = require('../config/db.config');

class PasswordReset {
    // Create new password reset token (OTP)
    static async create(userId, token, expiresAt) {
        try {
            // First delete any existing tokens for this user
            await this.deleteByUserId(userId);

            const [result] = await db.query(
                'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
                [userId, token, expiresAt]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Find valid token by user_id and token
    static async verify(userId, token) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM password_resets 
                 WHERE user_id = ? 
                 AND token = ? 
                 AND expires_at > NOW() 
                 AND used = FALSE`,
                [userId, token]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Mark token as used
    static async markAsUsed(id) {
        try {
            const [result] = await db.query(
                'UPDATE password_resets SET used = TRUE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete all tokens for a user
    static async deleteByUserId(userId) {
        try {
            const [result] = await db.query(
                'DELETE FROM password_resets WHERE user_id = ?',
                [userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PasswordReset;
