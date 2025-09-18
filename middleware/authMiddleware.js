const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (ctx, next) => {
    let token;

    if (ctx.request.headers.authorization && ctx.request.headers.authorization.startsWith('Bearer')) {
        token = ctx.request.headers.authorization.split(' ')[1];
    }

    if (!token) {
        ctx.status = 401;
        ctx.body = { error: 'Not authorized, no token' };
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx.state.user = await User.findById(decoded.user.id).select('-password');
        
        if (!ctx.state.user) {
            ctx.status = 401;
            ctx.body = { error: 'User not found' };
            return;
        }

        await next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        ctx.status = 401;
        ctx.body = { error: 'Token is not valid' };
    }
};

const adminMiddleware = async (ctx, next) => {
    if (!ctx.state.user || ctx.state.user.role !== 'admin') {
        ctx.status = 403;
        ctx.body = { error: 'Not authorized as admin' };
        return;
    }
    await next();
};

module.exports = { authMiddleware, adminMiddleware };