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
exports.getMyApplications = exports.applyForCourse = void 0;
const data_source_1 = require("../data-source");
const Application_1 = require("../entity/Application");
const Course_1 = require("../entity/Course");
const User_1 = require("../entity/User");
const applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
const courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const applyForCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        let { courseId, role, availability, relevant_skills } = req.body;
        // Explicitly parse courseId to number
        courseId = Number(courseId);
        // Input validation
        if (!courseId || !role || !availability) {
            return res.status(400).json({ message: 'Course ID, role, and availability are required.' });
        }
        if (typeof courseId !== 'number' || isNaN(courseId) || courseId <= 0) {
            return res.status(400).json({ message: 'Invalid Course ID format or value.' });
        }
        if (!['tutor', 'lab_assistant'].includes(role)) {
            return res.status(400).json({ message: `Invalid role specified: ${role}. Must be 'tutor' or 'lab_assistant'.` });
        }
        if (!['full_time', 'part_time'].includes(availability)) {
            return res.status(400).json({ message: `Invalid availability specified: ${availability}. Must be 'full_time' or 'part_time'.` });
        }
        if (relevant_skills && (!Array.isArray(relevant_skills) || !relevant_skills.every(skill => typeof skill === 'string'))) {
            return res.status(400).json({ message: 'Relevant skills must be an array of strings.' });
        }
        // Check if course exists
        const course = yield courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
        }
        // Check if user has already applied for this role in this course
        const existingApplication = yield applicationRepository.findOne({
            where: {
                user: { id: userId },
                course: { id: courseId },
                role_applied: role
            }
        });
        if (existingApplication) {
            return res.status(400).json({
                message: 'You have already applied for this role in this course'
            });
        }
        // Create new application
        const application = applicationRepository.create({
            user: { id: userId },
            course: { id: courseId },
            role_applied: role,
            status: 'pending',
            availability: availability,
            relevant_skills: relevant_skills || [],
        });
        yield applicationRepository.save(application);
        res.status(201).json({ message: 'Application submitted successfully!', application });
    }
    catch (error) {
        console.error('Error applying for course:', error);
        res.status(500).json({ message: 'Failed to submit application' });
    }
});
exports.applyForCourse = applyForCourse;
const getMyApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const applications = yield applicationRepository.find({
            where: { user: { id: userId } },
            relations: ['course'], // Load related course data
        });
        res.json(applications);
    }
    catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
});
exports.getMyApplications = getMyApplications;
