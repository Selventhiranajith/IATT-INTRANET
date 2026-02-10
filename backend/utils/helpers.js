// Success response helper
exports.successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

// Error response helper
exports.errorResponse = (res, statusCode, message, error = null) => {
    const response = {
        success: false,
        message
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

// Validate email format
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
exports.isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

// Sanitize user object (remove sensitive data)
exports.sanitizeUser = (user) => {
    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
};

// Generate random string
exports.generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Format date to MySQL datetime
exports.formatDateForMySQL = (date = new Date()) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};
