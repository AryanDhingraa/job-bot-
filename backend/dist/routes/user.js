"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// All user-related routes require authentication
router.use(auth_1.auth);
// Update user profile
router.put('/profile', userController_1.updateProfile);
exports.default = router;
