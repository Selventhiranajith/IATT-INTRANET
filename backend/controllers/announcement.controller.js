const Announcement = require('../models/announcement.model');

// Create a new Announcement
exports.create = async (req, res) => {
    try {
        // Check role
        if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied. Only Admins and Superadmins can create announcements.' });
        }

        const { title, content, priority, publish_at, expiry_at } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and Content are required.' });
        }

        const insertId = await Announcement.create({
            title,
            content,
            priority: priority || 'Normal',
            created_by: req.userId,
            publish_at: publish_at || null,
            expiry_at: expiry_at || null,
        });

        return res.status(201).json({ success: true, message: 'Announcement created successfully.', id: insertId });

    } catch (error) {
        console.error('Error creating announcement:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to create announcement.' });
    }
};

// Retrieve all Announcements
exports.findAll = async (req, res) => {
    try {
        const announcements = await Announcement.findAll();
        return res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch announcements.' });
    }
};

// Delete an Announcement
exports.delete = async (req, res) => {
    try {
        if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const deleted = await Announcement.remove(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: `Announcement with id ${req.params.id} not found.` });
        }

        return res.json({ success: true, message: 'Announcement deleted successfully.' });

    } catch (error) {
        console.error('Error deleting announcement:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to delete announcement.' });
    }
};
