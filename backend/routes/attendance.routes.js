const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect all routes with authentication middleware
router.use(verifyToken);

// Check In
router.post('/check-in', attendanceController.checkIn);

// Check Out
router.post('/check-out', attendanceController.checkOut);

// Get Today's Status & Logs
router.get('/today', attendanceController.getTodayStatus);

// Get All Logs (Admin)
const { isAdminOrSuperAdmin } = require('../middleware/auth.middleware');
router.get('/all', isAdminOrSuperAdmin, attendanceController.getAllLogs);

module.exports = router;
