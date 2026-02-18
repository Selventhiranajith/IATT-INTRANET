const db = require('../config/db.config');

class Idea {
    // Get all ideas
    static async findAll(currentUserId) {
        try {
            const query = `
                SELECT i.*, u.first_name, u.last_name, u.position,
                (SELECT COUNT(*) FROM idea_likes WHERE idea_id = i.id) as likes_count,
                (SELECT COUNT(*) FROM idea_comments WHERE idea_id = i.id) as comments_count,
                (SELECT COUNT(*) FROM idea_likes WHERE idea_id = i.id AND user_id = ?) > 0 as is_liked
                FROM ideas i
                JOIN users u ON i.user_id = u.id
                ORDER BY i.created_at DESC
            `;
            const [rows] = await db.query(query, [currentUserId]);

            // Also fetch comments for each idea? Or fetch comments separately?
            // For now let's just return ideas. We can fetch comments on demand or in a separate call if needed.
            // But maybe displaying top 2 comments or something is good?
            // Let's stick to simple first.

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get single idea details including comments
    static async findById(id, currentUserId) {
        try {
            const query = `
                SELECT i.*, u.first_name, u.last_name, u.position,
                (SELECT COUNT(*) FROM idea_likes WHERE idea_id = i.id) as likes_count,
                (SELECT COUNT(*) FROM idea_comments WHERE idea_id = i.id) as comments_count,
                (SELECT COUNT(*) FROM idea_likes WHERE idea_id = i.id AND user_id = ?) > 0 as is_liked
                FROM ideas i
                JOIN users u ON i.user_id = u.id
                WHERE i.id = ?
            `;
            const [rows] = await db.query(query, [currentUserId, id]);
            if (!rows.length) return null;

            const idea = rows[0];

            // Fetch comments
            const commentsQuery = `
                SELECT c.*, u.first_name, u.last_name
                FROM idea_comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.idea_id = ?
                ORDER BY c.created_at ASC
            `;
            const [comments] = await db.query(commentsQuery, [id]);
            idea.comments = comments;

            return idea;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const { user_id, title, content } = data;
            const [result] = await db.query(
                `INSERT INTO ideas (user_id, title, content) VALUES (?, ?, ?)`,
                [user_id, title, content]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, userId, data) {
        try {
            const { title, content } = data;
            const [result] = await db.query(
                `UPDATE ideas SET title = ?, content = ? WHERE id = ? AND user_id = ?`,
                [title, content, id, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
            const [result] = await db.query(`DELETE FROM ideas WHERE id = ? AND user_id = ?`, [id, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async toggleLike(ideaId, userId) {
        try {
            // Check if liked
            const [rows] = await db.query(
                `SELECT id FROM idea_likes WHERE idea_id = ? AND user_id = ?`,
                [ideaId, userId]
            );

            if (rows.length > 0) {
                // Unlike
                await db.query(
                    `DELETE FROM idea_likes WHERE idea_id = ? AND user_id = ?`,
                    [ideaId, userId]
                );
                return { liked: false };
            } else {
                // Like
                await db.query(
                    `INSERT INTO idea_likes (idea_id, user_id) VALUES (?, ?)`,
                    [ideaId, userId]
                );
                return { liked: true };
            }
        } catch (error) {
            throw error;
        }
    }

    static async addComment(ideaId, userId, comment) {
        try {
            const [result] = await db.query(
                `INSERT INTO idea_comments (idea_id, user_id, comment) VALUES (?, ?, ?)`,
                [ideaId, userId, comment]
            );

            // Return the new comment with user details
            const [rows] = await db.query(`
                SELECT c.*, u.first_name, u.last_name
                FROM idea_comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = ?
            `, [result.insertId]);

            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deleteComment(commentId, userId) {
        try {
            const [result] = await db.query(`DELETE FROM idea_comments WHERE id = ? AND user_id = ?`, [commentId, userId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Idea;
