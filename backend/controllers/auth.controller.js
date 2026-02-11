const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authConfig = require('../config/auth.config');

// Register new user
exports.register = async (req, res) => {
    try {
        const { employee_id, email, password, first_name, last_name, role, branch, department, position, birth_date, phone } = req.body;

        // Validate required fields
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Determine Creator Role & Branch Logic
        let assignedBranch = branch;
        let assignedRole = role || 'employee';

        // If request is authenticated (Admin creating a user)
        if (req.userId) {
            const creator = await User.findById(req.userId);

            if (creator.role === 'admin') {
                // Admin can only create users for their own branch
                if (!creator.branch) {
                    return res.status(403).json({
                        success: false,
                        message: 'Admin must have a valid branch assigned to create users.'
                    });
                }
                assignedBranch = creator.branch;

                // Optional: Force role to employee if admin shouldn't create other admins
                // assignedRole = 'employee'; 
            } else if (creator.role === 'superadmin') {
                // Superadmin can assign any branch
                assignedBranch = branch;
            }
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if employee ID already exists
        if (employee_id) {
            const existingEmployeeId = await User.findByEmployeeId(employee_id);
            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID already exists'
                });
            }
        }

        // Hash password
        // Store password directly as plain text (Requested by User)
        const hashedPassword = password;

        // Create user
        const userId = await User.create({
            employee_id,
            email,
            password: hashedPassword,
            first_name,
            last_name,
            role: assignedRole,
            branch: assignedBranch,
            department,
            position,
            birth_date,
            phone
        });

        // Get created user (without password)
        const newUser = await User.findById(userId);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: newUser
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, branch } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is not active. Please contact administrator.'
            });
        }

        // Verify Branch Access
        // If user has a specific branch assigned (Admin/Employee), they must select that branch
        // If user is Superadmin (branch is NULL), they can log in to any branch context
        if (user.branch && branch && user.branch !== branch) {
            return res.status(403).json({
                success: false,
                message: `Access denied. You belong to the ${user.branch} branch.`
            });
        }

        // If user is regular employee/admin and didn't select a branch (if optional), or if frontend always sends it.
        // We enforce branch match if user.branch exists.

        // Verify password
        // Verify password (plain text comparison as requested)
        const isPasswordValid = (password === user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await User.updateLastLogin(user.id);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            authConfig.secret,
            {
                expiresIn: authConfig.jwtExpiration
            }
        );

        // Remove password from user object
        delete user.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

// Logout user (client-side token removal, optional server-side session cleanup)
exports.logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token. However, you can implement token blacklisting
        // or session management here if needed.

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        // Get user with password
        const user = await User.findByEmail((await User.findById(userId)).email);

        // Verify current password (plain text)
        const isPasswordValid = (currentPassword === user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Store new password as plain text
        const hashedPassword = newPassword;

        // Update password in database
        const db = require('../config/db.config'); // Ensure db is available
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        let filters = {};

        // If admin (not superadmin), filter by their branch
        if (currentUser.role === 'admin' && currentUser.branch) {
            filters.branch = currentUser.branch;
        }

        const users = await User.findAll(filters);

        res.status(200).json({
            success: true,
            data: {
                users
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};
