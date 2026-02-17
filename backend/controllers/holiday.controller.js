const Holiday = require('../models/holiday.model');
const User = require('../models/user.model');

// Create new holiday (Admin/Superadmin only)
exports.createHoliday = async (req, res) => {
    try {
        const { name, date, description } = req.body;

        // Validate required fields
        if (!name || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide holiday name and date'
            });
        }

        // Get current user
        const currentUser = await User.findById(req.userId);

        // Determine branch
        let branch;
        if (currentUser.role === 'superadmin') {
            // Superadmin must specify branch or it applies to all
            branch = req.body.branch || 'All';
        } else if (currentUser.role === 'admin') {
            // Admin can only create for their branch
            if (!currentUser.branch) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin must have a valid branch assigned'
                });
            }
            branch = currentUser.branch;
        } else {
            return res.status(403).json({
                success: false,
                message: 'Only admins and superadmins can create holidays'
            });
        }

        // Create holiday
        const holidayId = await Holiday.create({
            name,
            date,
            description: description || null,
            branch,
            created_by: req.userId
        });

        // Get created holiday with creator info
        const holiday = await Holiday.findById(holidayId);

        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data: {
                holiday
            }
        });

    } catch (error) {
        console.error('Create holiday error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating holiday',
            error: error.message
        });
    }
};

// Get all holidays
exports.getAllHolidays = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        let filters = {};

        // No branch filtering - everyone sees all holidays

        // Optional year filter
        if (req.query.year) {
            filters.year = req.query.year;
        }

        const holidays = await Holiday.findAll(filters);

        // Remove creator info for non-admin users
        const sanitizedHolidays = holidays.map(holiday => {
            if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
                // Remove creator information for regular employees
                const { creator_first_name, creator_last_name, creator_email, created_by, ...rest } = holiday;
                return rest;
            }
            return holiday;
        });

        res.status(200).json({
            success: true,
            data: {
                holidays: sanitizedHolidays,
                isAdmin: currentUser.role === 'admin' || currentUser.role === 'superadmin'
            }
        });

    } catch (error) {
        console.error('Get holidays error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching holidays',
            error: error.message
        });
    }
};

// Update holiday (Admin/Superadmin only)
exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, description } = req.body;

        // Get current user
        const currentUser = await User.findById(req.userId);

        // Get holiday
        const holiday = await Holiday.findById(id);
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        // Check permissions
        if (currentUser.role === 'admin' && holiday.branch !== currentUser.branch) {
            return res.status(403).json({
                success: false,
                message: 'You can only update holidays in your branch'
            });
        }

        // Update holiday
        await Holiday.update(id, { name, date, description });

        // Get updated holiday
        const updatedHoliday = await Holiday.findById(id);

        res.status(200).json({
            success: true,
            message: 'Holiday updated successfully',
            data: {
                holiday: updatedHoliday
            }
        });

    } catch (error) {
        console.error('Update holiday error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating holiday',
            error: error.message
        });
    }
};

// Delete holiday (Admin/Superadmin only)
exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        // Get current user
        const currentUser = await User.findById(req.userId);

        // Get holiday
        const holiday = await Holiday.findById(id);
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        // Check permissions
        if (currentUser.role === 'admin' && holiday.branch !== currentUser.branch) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete holidays in your branch'
            });
        }

        await Holiday.delete(id);

        res.status(200).json({
            success: true,
            message: 'Holiday deleted successfully'
        });

    } catch (error) {
        console.error('Delete holiday error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting holiday',
            error: error.message
        });
    }
};
