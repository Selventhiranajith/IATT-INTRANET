const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

// Verify JWT token
exports.verifyToken = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Access denied.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, authConfig.secret);

        // Attach user info to request
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        req.userBranch = decoded.branch;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        return res.status(403).json({
            success: false,
            message: 'Invalid token. Access denied.'
        });
    }
};

// Check if user is admin or superadmin
exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Check if user is manager or admin
exports.isManagerOrAdmin = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Manager or Admin privileges required.'
        });
    }
    next();
};

// Check if user is HR or admin
exports.isHROrAdmin = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'hr') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. HR or Admin privileges required.'
        });
    }
    next();
};

// Check specific roles
exports.hasRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

exports.isAdminOrSuperAdmin = exports.isAdmin;
