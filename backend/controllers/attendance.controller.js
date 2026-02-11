const Attendance = require('../models/attendance.model');

// Check In
exports.checkIn = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { remarks } = req.body;
        const date = new Date().toISOString().split('T')[0];
        const checkInTime = new Date();

        // Check if user already has an active session
        const activeSession = await Attendance.getActiveSession(userId, date);
        if (activeSession) {
            return res.status(400).json({
                success: false,
                message: 'You are already checked in.'
            });
        }

        await Attendance.checkIn(userId, date, checkInTime, remarks);

        res.status(200).json({
            success: true,
            message: 'Checked in successfully',
            data: {
                checkInTime,
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Error handling check-in',
            error: error.message
        });
    }
};

// Check Out
exports.checkOut = async (req, res) => {
    try {
        const userId = req.userId;
        const { remarks } = req.body;
        const date = new Date().toISOString().split('T')[0];
        const checkOutTime = new Date(); // Use server time

        // Check active session
        const activeSession = await Attendance.getActiveSession(userId, date);
        if (!activeSession) {
            return res.status(400).json({
                success: false,
                message: 'No active session found. Please check in first.'
            });
        }

        // Perform checkout
        const result = await Attendance.checkOut(userId, date, checkOutTime, remarks);

        res.status(200).json({
            success: true,
            message: 'Checked out successfully',
            data: {
                checkOutTime,
                status: 'completed'
            }
        });

    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({
            success: false,
            message: 'Error handling check-out',
            error: error.message
        });
    }
};

// Get Today's Status & Logs
exports.getTodayStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const date = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

        // Get all logs for today
        const logs = await Attendance.getTodayLogs(userId, date);

        // Check if currently active
        const activeSession = logs.find(log => log.status === 'active');

        // Calculate total hours
        let totalMinutes = 0;
        logs.forEach(log => {
            if (log.status === 'completed') {
                totalMinutes += parseFloat(log.duration_minutes || 0);
            } else if (log.status === 'active') {
                // Determine current duration for active session
                const checkIn = new Date(log.check_in);
                const now = new Date();
                const durationMs = now - checkIn;
                totalMinutes += Math.floor(durationMs / 60000);
            }
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = Math.floor(totalMinutes % 60);
        const formattedTotal = `${totalHours}h ${remainingMinutes}m`;

        res.status(200).json({
            success: true,
            data: {
                status: activeSession ? 'active' : 'inactive',
                activeSession,
                logs,
                totalMinutes,
                formattedTotal
            }
        });

    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance status',
            error: error.message
        });
    }
};

// Get All Logs (Admin View)
exports.getAllLogs = async (req, res) => {
    try {
        const { branch, date, search, employee_id } = req.query;
        const userId = req.userId; // Assuming req.user is populated by auth middleware
        const User = require('../models/user.model');
        const user = await User.findById(userId);

        const filters = {
            date,
            name: search,
            employee_id
        };

        // If user is Admin, force their branch
        if (user.role === 'admin' && user.branch) {
            filters.branch = user.branch;
        } else if (branch) {
            // Superadmin can filter by any branch
            filters.branch = branch;
        }

        const logs = await Attendance.findAll(filters);

        res.status(200).json({
            success: true,
            data: logs
        });

    } catch (error) {
        console.error('Get all logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance logs',
            error: error.message
        });
    }
};
