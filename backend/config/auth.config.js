require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
    jwtExpiration: process.env.JWT_EXPIRE || '24h',
    jwtRefreshExpiration: '7d',

    // Bcrypt salt rounds
    saltRounds: 10,

    // Token types
    tokenTypes: {
        ACCESS: 'access',
        REFRESH: 'refresh',
        RESET_PASSWORD: 'resetPassword'
    }
};
