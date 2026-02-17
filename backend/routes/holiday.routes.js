const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holiday.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.get('/', authMiddleware.verifyToken, holidayController.getAllHolidays);

// Admin/Superadmin only routes
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, holidayController.createHoliday);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, holidayController.updateHoliday);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, holidayController.deleteHoliday);

module.exports = router;
