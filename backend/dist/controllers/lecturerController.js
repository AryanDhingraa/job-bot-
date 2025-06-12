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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLecturerDashboardStats = exports.updateApplicationStatus = exports.getMyCourseApplications = void 0;
const data_source_1 = require("../data-source");
const Application_1 = require("../entity/Application");
const LecturerCourse_1 = require("../entity/LecturerCourse");
const Course_1 = require("../entity/Course");
const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
const lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
// Get all applications for courses taught by the lecturer
const getMyCourseApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lecturerId = req.user.id;
        // Find all courses taught by this lecturer
        const lecturerCourses = yield lecturerCourseRepository.find({
            where: { lecturer: { id: lecturerId } },
            relations: ['course'],
        });
        const courseIds = lecturerCourses.map(lc => lc.course.id);
        if (courseIds.length === 0) {
            return res.json([]);
        }
        // Find all applications for these courses
        const applications = yield applicationRepository.find({
            where: courseIds.map(id => ({ course: { id } })),
            relations: ['user', 'course'],
            order: { applied_at: 'DESC' }
        });
        res.json(applications);
    }
    catch (error) {
        console.error('Error fetching applications for lecturer:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});
exports.getMyCourseApplications = getMyCourseApplications;
// Approve or reject an application
const updateApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lecturerId = req.user.id;
        const applicationId = parseInt(req.params.id);
        const { status } = req.body;
        // Input validation for applicationId
        if (isNaN(applicationId) || applicationId <= 0) {
            return res.status(400).json({ message: 'Invalid Application ID.' });
        }
        // Input validation for status
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be \'accepted\' or \'rejected\'.' });
        }
        // Find the application
        const application = yield applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['course', 'user'], // Also load user relation for potential future use or stricter checks
        });
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        // Check if the lecturer teaches this course by verifying lecturer_id and course_id
        const lecturerCourse = yield lecturerCourseRepository.findOne({
            where: {
                lecturer: { id: lecturerId },
                course: { id: application.course.id }
            },
        });
        if (!lecturerCourse) {
            return res.status(403).json({ message: 'You do not teach this course or are not authorized to modify this application.' });
        }
        // Prevent updating if status is already accepted or rejected
        if (application.status !== 'pending') {
            return res.status(400).json({ message: `Application is already ${application.status}.` });
        }
        // Update status
        application.status = status;
        yield applicationRepository.save(application);
        res.json({ message: `Application ${status}`, application });
    }
    catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Error updating application status' });
    }
});
exports.updateApplicationStatus = updateApplicationStatus;
// Get dashboard statistics for the lecturer
const getLecturerDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lecturerId = req.user.id;
        // Find all courses taught by this lecturer
        const lecturerCourses = yield lecturerCourseRepository.find({
            where: { lecturer: { id: lecturerId } },
            relations: ['course'],
        });
        const courseIds = lecturerCourses.map(lc => lc.course.id);
        if (courseIds.length === 0) {
            return res.json({
                totalApplications: 0,
                pendingApplications: 0,
                acceptedApplications: 0,
                rejectedApplications: 0,
                applicationsByRole: [],
                applicationsByCourse: [],
            });
        }
        // Fetch all applications for these courses
        const applications = yield applicationRepository.find({
            where: courseIds.map(id => ({ course: { id } })),
            relations: ['user', 'course'],
        });
        // Aggregate statistics
        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => app.status === 'pending').length;
        const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
        const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
        const applicationsByRole = [];
        const roleCounts = {};
        applications.forEach(app => {
            roleCounts[app.role_applied] = (roleCounts[app.role_applied] || 0) + 1;
        });
        for (const role in roleCounts) {
            applicationsByRole.push({ name: role === 'tutor' ? 'Tutor' : 'Lab Assistant', count: roleCounts[role] });
        }
        const applicationsByCourse = [];
        const courseCounts = {};
        applications.forEach(app => {
            const courseName = app.course.name;
            courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
        });
        for (const courseName in courseCounts) {
            applicationsByCourse.push({ name: courseName, count: courseCounts[courseName] });
        }
        res.json({
            totalApplications,
            pendingApplications,
            acceptedApplications,
            rejectedApplications,
            applicationsByRole,
            applicationsByCourse,
        });
    }
    catch (error) {
        console.error('Error fetching lecturer dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});
exports.getLecturerDashboardStats = getLecturerDashboardStats;
