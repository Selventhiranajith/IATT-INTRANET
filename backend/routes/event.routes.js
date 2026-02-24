const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken, isAdminOrSuperAdmin } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

// Routes
// 1. Get all events
router.get('/', verifyToken, eventController.getAllEvents);

// 1.1 Get event by id
router.get('/:id', verifyToken, eventController.getEventById);

// 2. Create event (Admin/SuperAdmin only) - supports multiple images
router.post('/', verifyToken, isAdminOrSuperAdmin, upload.array('images', 10), eventController.createEvent);

// 3. Update event (Admin/SuperAdmin only) - supports adding more images
router.put('/:id', verifyToken, isAdminOrSuperAdmin, upload.array('images', 10), eventController.updateEvent);

// 4. Delete event (Admin/SuperAdmin only)
router.delete('/:id', verifyToken, isAdminOrSuperAdmin, eventController.deleteEvent);

module.exports = router;
