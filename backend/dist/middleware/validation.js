"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignin = exports.validateSignup = void 0;
const validateSignup = (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;
    // Check if all required fields are present
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 12 characters long and contain uppercase, lowercase, number and special character'
        });
    }
    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    next();
};
exports.validateSignup = validateSignup;
const validateSignin = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    next();
};
exports.validateSignin = validateSignin;
