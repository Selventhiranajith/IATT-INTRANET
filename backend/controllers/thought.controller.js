const Thought = require('../models/thought.model');
const User = require('../models/user.model');

// Get all thoughts for a branch
exports.getThoughtsByBranch = async (req, res) => {
    try {
        const { branch } = req.params;

        if (!branch) {
            return res.status(400).json({
                success: false,
                message: 'Branch parameter is required'
            });
        }

        const thoughts = await Thought.findByBranch(branch);

        res.status(200).json({
            success: true,
            data: {
                thoughts
            }
        });

    } catch (error) {
        console.error('Get thoughts by branch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching thoughts',
            error: error.message
        });
    }
};

// Get random thought for a branch (for display)
exports.getRandomThought = async (req, res) => {
    try {
        const { branch } = req.params;

        if (!branch) {
            return res.status(400).json({
                success: false,
                message: 'Branch parameter is required'
            });
        }

        const thought = await Thought.getRandomByBranch(branch);

        if (!thought) {
            return res.status(404).json({
                success: false,
                message: 'No thoughts found for this branch'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                thought
            }
        });

    } catch (error) {
        console.error('Get random thought error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching thought',
            error: error.message
        });
    }
};

// Get all thoughts from all branches (public for all users)
exports.getAllThoughtsPublic = async (req, res) => {
    try {
        const thoughts = await Thought.findAll();

        res.status(200).json({
            success: true,
            data: {
                thoughts
            }
        });

    } catch (error) {
        console.error('Get all thoughts public error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching thoughts',
            error: error.message
        });
    }
};

// Create new thought (Admin/SuperAdmin only)
exports.createThought = async (req, res) => {
    try {
        const { content, author } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!content || !author) {
            return res.status(400).json({
                success: false,
                message: 'Content and author are required'
            });
        }

        // Get user to determine branch
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Determine branch
        let branch = user.branch;

        // If superadmin without branch, they can optionally specify branch in request
        if (!branch && user.role === 'superadmin' && req.body.branch) {
            branch = req.body.branch;
        }

        if (!branch) {
            return res.status(400).json({
                success: false,
                message: 'Branch is required. Please specify a branch.'
            });
        }

        // Create thought
        const thoughtId = await Thought.create({
            content,
            author,
            branch,
            created_by: userId
        });

        // Get created thought
        const newThought = await Thought.findById(thoughtId);

        res.status(201).json({
            success: true,
            message: 'Thought created successfully',
            data: {
                thought: newThought
            }
        });

    } catch (error) {
        console.error('Create thought error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating thought',
            error: error.message
        });
    }
};

// Update thought (Admin/SuperAdmin only)
exports.updateThought = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, author } = req.body;

        if (!content || !author) {
            return res.status(400).json({
                success: false,
                message: 'Content and author are required'
            });
        }

        // Check if thought exists
        const existingThought = await Thought.findById(id);
        if (!existingThought) {
            return res.status(404).json({
                success: false,
                message: 'Thought not found'
            });
        }

        // Update thought
        await Thought.update(id, { content, author });

        // Get updated thought
        const updatedThought = await Thought.findById(id);

        res.status(200).json({
            success: true,
            message: 'Thought updated successfully',
            data: {
                thought: updatedThought
            }
        });

    } catch (error) {
        console.error('Update thought error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating thought',
            error: error.message
        });
    }
};

// Delete thought (Admin/SuperAdmin only)
exports.deleteThought = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if thought exists
        const existingThought = await Thought.findById(id);
        if (!existingThought) {
            return res.status(404).json({
                success: false,
                message: 'Thought not found'
            });
        }

        // Soft delete
        await Thought.delete(id);

        res.status(200).json({
            success: true,
            message: 'Thought deleted successfully'
        });

    } catch (error) {
        console.error('Delete thought error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting thought',
            error: error.message
        });
    }
};

// Get all thoughts (Admin/SuperAdmin only)
exports.getAllThoughts = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        let filters = {};

        // If admin (not superadmin), filter by their branch
        if (currentUser.role === 'admin' && currentUser.branch) {
            filters.branch = currentUser.branch;
        }

        const thoughts = await Thought.findAll(filters);

        res.status(200).json({
            success: true,
            data: {
                thoughts
            }
        });

    } catch (error) {
        console.error('Get all thoughts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching thoughts',
            error: error.message
        });
    }
};
