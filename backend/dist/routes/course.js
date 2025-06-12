"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const courseController_1 = require("../controllers/courseController");
const router = (0, express_1.Router)();
// All routes require authentication (if desired, or make public)
router.use(auth_1.auth);
// Get all courses
router.get('/', courseController_1.getAllCourses);
exports.default = router;
