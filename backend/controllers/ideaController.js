const Idea = require('../models/idea.model');

// Get all ideas
exports.getIdeas = async (req, res) => {
    try {
        const ideas = await Idea.findAll(req.userId);
        res.json({
            success: true,
            data: ideas
        });
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ideas'
        });
    }
};

// Get single idea
exports.getIdeaById = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id, req.userId);
        if (!idea) {
            return res.status(404).json({
                success: false,
                message: 'Idea not found'
            });
        }
        res.json({
            success: true,
            data: idea
        });
    } catch (error) {
        console.error('Error fetching idea:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching idea'
        });
    }
};

// Create idea
exports.createIdea = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const ideaId = await Idea.create({
            user_id: req.userId,
            title,
            content
        });

        res.status(201).json({
            success: true,
            message: 'Idea created successfully',
            data: { id: ideaId }
        });
    } catch (error) {
        console.error('Error creating idea:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating idea'
        });
    }
};

// Update idea
exports.updateIdea = async (req, res) => {
    try {
        const { title, content } = req.body;

        const success = await Idea.update(req.params.id, req.userId, { title, content });

        if (!success) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this idea or it does not exist'
            });
        }

        res.json({
            success: true,
            message: 'Idea updated successfully'
        });
    } catch (error) {
        console.error('Error updating idea:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating idea'
        });
    }
};

// Delete idea
exports.deleteIdea = async (req, res) => {
    try {
        const success = await Idea.delete(req.params.id, req.userId);

        if (!success) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this idea or it does not exist'
            });
        }

        res.json({
            success: true,
            message: 'Idea deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting idea:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting idea'
        });
    }
};

// Toggle like
exports.toggleLike = async (req, res) => {
    try {
        const result = await Idea.toggleLike(req.params.id, req.userId);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like'
        });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Comment is required'
            });
        }

        const newComment = await Idea.addComment(req.params.id, req.userId, comment);

        res.status(201).json({
            success: true,
            data: newComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const success = await Idea.deleteComment(req.params.commentId, req.userId);

        if (!success) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this comment or it does not exist'
            });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
};
