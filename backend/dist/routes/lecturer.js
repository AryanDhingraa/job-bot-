"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const lecturerController_1 = require("../controllers/lecturerController");
const router = (0, express_1.Router)();
// Middleware to ensure only lecturers can access these routes
const lecturerOnly = (req, res, next) => {
    if (req.user.role !== 'lecturer') {
        return res.status(403).json({ message: 'Access denied. Only lecturers can access this route.' });
    }
    next();
};
// All routes require authentication and lecturer role
router.use(auth_1.auth, lecturerOnly);
// Get all applications for courses taught by the lecturer
router.get('/applications', lecturerController_1.getMyCourseApplications);
// Get dashboard statistics
router.get('/stats', lecturerController_1.getLecturerDashboardStats);
// Approve an application
router.post('/applications/:id/accepted', (req, res) => {
    req.body.status = 'accepted';
    (0, lecturerController_1.updateApplicationStatus)(req, res);
});
// Reject an application
router.post('/applications/:id/rejected', (req, res) => {
    req.body.status = 'rejected';
    (0, lecturerController_1.updateApplicationStatus)(req, res);
});
exports.default = router;
