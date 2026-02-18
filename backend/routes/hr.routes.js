const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');
const { verifyToken, isAdminOrSuperAdmin } = require('../middleware/auth.middleware');

// Public route to view all policies
router.get('/', verifyToken, hrController.getAllPolicies);

// Public route to view a single policy
router.get('/:id', verifyToken, hrController.getPolicyById);

// Admin/SuperAdmin routes to manage policies
router.post('/create', [verifyToken, isAdminOrSuperAdmin], hrController.createPolicy);
router.put('/update/:id', [verifyToken, isAdminOrSuperAdmin], hrController.updatePolicy);
router.delete('/delete/:id', [verifyToken, isAdminOrSuperAdmin], hrController.deletePolicy);

module.exports = router;
