const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyResetOtp);
router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);
router.get('/birthdays', authMiddleware.verifyToken, authController.getBirthdays);
router.get('/recent-joined', authMiddleware.verifyToken, authController.getRecentJoined);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);

// Admin only routes
router.get('/admin/users', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.getAllUsers);
router.post('/admin/users', authMiddleware.verifyToken, authMiddleware.isAdmin, authController.register);

module.exports = router;
