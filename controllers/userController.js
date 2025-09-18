// controllers/userController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (ctx) => {
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
        ctx.status = 400;
        ctx.body = { error: 'Please enter all fields' };
        return;
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            ctx.status = 400;
            ctx.body = { error: 'User already exists' };
            return;
        }

        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        ctx.body = { message: 'Registration successful', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
    } catch (err) {
        console.error(err);
        ctx.status = 500;
        ctx.body = { error: 'Server error' };
    }
};

exports.loginUser = async (ctx) => {
    const { email, password } = ctx.request.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid credentials' };
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid credentials' };
            return;
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        ctx.body = { message: 'Login successful', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
    } catch (err) {
        console.error(err);
        ctx.status = 500;
        ctx.body = { error: 'Server error' };
    }
};