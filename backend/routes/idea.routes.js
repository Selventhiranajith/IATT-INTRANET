const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all ideas
router.get('/', verifyToken, ideaController.getIdeas);

// Get single idea
router.get('/:id', verifyToken, ideaController.getIdeaById);

// Create new idea
router.post('/', verifyToken, ideaController.createIdea);

// Update idea (Owner only)
router.put('/:id', verifyToken, ideaController.updateIdea);

// Delete idea (Owner only)
router.delete('/:id', verifyToken, ideaController.deleteIdea);

// Toggle like
router.post('/:id/like', verifyToken, ideaController.toggleLike);

// Add comment
router.post('/:id/comments', verifyToken, ideaController.addComment);

// Delete comment (Owner only)
router.delete('/comments/:commentId', verifyToken, ideaController.deleteComment);

module.exports = router;
