"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.signIn = exports.signUp = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role } = req.body;
        // Check if user already exists
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const existingUser = yield userRepository.findOne({
            where: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or username already exists'
            });
        }
        // Hash password
        const salt = yield bcrypt_1.default.genSalt(10);
        const password_hash = yield bcrypt_1.default.hash(password, salt);
        // Create new user
        const user = userRepository.create({
            username,
            email,
            password_hash,
            role
        });
        yield userRepository.save(user);
        // Remove password from response
        const { password_hash: _ } = user, userWithoutPassword = __rest(user, ["password_hash"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check if user is blocked
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Account is blocked' });
        }
        // Verify password
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        // Remove password from response
        const { password_hash: _ } = user, userWithoutPassword = __rest(user, ["password_hash"]);
        const responsePayload = { user: userWithoutPassword, token };
        res.json(responsePayload);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.signIn = signIn;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOne({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Remove password from response
        const { password_hash: _ } = user, userWithoutPassword = __rest(user, ["password_hash"]);
        res.json(userWithoutPassword);
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getCurrentUser = getCurrentUser;
