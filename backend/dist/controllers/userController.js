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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { bio, skills, current_level, gpa } = req.body;
        const user = yield userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update fields if they are provided in the request body
        if (bio !== undefined) {
            user.bio = bio;
        }
        if (skills !== undefined) {
            // Ensure skills is an array of strings if provided
            if (!Array.isArray(skills) || !skills.every(s => typeof s === 'string')) {
                return res.status(400).json({ message: 'Skills must be an array of strings.' });
            }
            user.skills = skills;
        }
        if (current_level !== undefined) {
            user.current_level = current_level;
        }
        if (gpa !== undefined) {
            // Basic GPA format validation (e.g., allow numbers or number strings)
            if (gpa !== null && typeof gpa !== 'string' && typeof gpa !== 'number') {
                return res.status(400).json({ message: 'GPA must be a string or number.' });
            }
            user.gpa = String(gpa);
        }
        yield userRepository.save(user);
        const { password_hash } = user, userWithoutPassword = __rest(user, ["password_hash"]);
        res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});
exports.updateProfile = updateProfile;
