"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const candidateController_1 = require("../controllers/candidateController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.auth);
// Apply for a course
router.post('/apply-for-course', candidateController_1.applyForCourse);
// Get my applications
router.get('/applications', candidateController_1.getMyApplications);
exports.default = router;
