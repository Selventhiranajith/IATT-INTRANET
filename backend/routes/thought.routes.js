const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thought.controller');
const { verifyToken, isAdminOrSuperAdmin } = require('../middleware/auth.middleware');

// Public routes (authenticated users can view)
// Get all thoughts (all branches)
router.get('/all', verifyToken, thoughtController.getAllThoughtsPublic);

// Get random thought for a branch
router.get('/random/:branch', verifyToken, thoughtController.getRandomThought);

// Get all thoughts for a branch
router.get('/branch/:branch', verifyToken, thoughtController.getThoughtsByBranch);

// Admin/SuperAdmin only routes
// Get all thoughts (with filtering)
router.get('/', verifyToken, isAdminOrSuperAdmin, thoughtController.getAllThoughts);

// Create new thought
router.post('/', verifyToken, isAdminOrSuperAdmin, thoughtController.createThought);

// Update thought
router.put('/:id', verifyToken, isAdminOrSuperAdmin, thoughtController.updateThought);

// Delete thought
router.delete('/:id', verifyToken, isAdminOrSuperAdmin, thoughtController.deleteThought);

module.exports = router;
