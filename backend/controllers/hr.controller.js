const HRPolicy = require('../models/hr.model');
const User = require('../models/user.model');

// Create new HR policy
exports.createPolicy = async (req, res) => {
    try {
        const { title, category, description, content, version, effective_date, status } = req.body;
        const created_by = req.userId;

        // Fetch user details to set prepared_by and approved_by
        const user = await User.findById(req.userId);
        const adminName = user ? `${user.first_name} ${user.last_name}` : 'Admin';

        if (!title || !category || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, and content are required'
            });
        }

        const policyId = await HRPolicy.create({
            title,
            category,
            description,
            content,
            version,
            effective_date,
            prepared_by: adminName,
            approved_by: adminName,
            status: status || 'Active',
            created_by
        });

        res.status(201).json({
            success: true,
            message: 'HR Policy created successfully',
            data: { id: policyId }
        });
    } catch (error) {
        console.error('Create policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating policy',
            error: error.message
        });
    }
};

// Get all HR policies
exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await HRPolicy.findAll();
        res.status(200).json({
            success: true,
            data: policies
        });
    } catch (error) {
        console.error('Get all policies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policies',
            error: error.message
        });
    }
};

// Get single HR policy
exports.getPolicyById = async (req, res) => {
    try {
        const { id } = req.params;
        const policy = await HRPolicy.findById(id);

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { policy: policy }
        });
    } catch (error) {
        console.error('Get policy by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching policy',
            error: error.message
        });
    }
};

// Update HR policy
exports.updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description, content, version, effective_date, status } = req.body;

        // Fetch user details to update prepared_by/approved_by? 
        // Or keep original? The request implies auto-getting admin name. 
        // If I update it, it reflects the latest editor.
        const user = await User.findById(req.userId);
        const adminName = user ? `${user.first_name} ${user.last_name}` : 'Admin';

        const success = await HRPolicy.update(id, {
            title,
            category,
            description,
            content,
            version,
            effective_date,
            prepared_by: adminName,
            approved_by: adminName,
            status
        });

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'HR Policy updated successfully'
        });
    } catch (error) {
        console.error('Update policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating policy',
            error: error.message
        });
    }
};

// Delete HR policy
exports.deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await HRPolicy.delete(id);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'HR Policy deleted successfully'
        });
    } catch (error) {
        console.error('Delete policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting policy',
            error: error.message
        });
    }
};
