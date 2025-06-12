"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.CourseResolver = void 0;
const type_graphql_1 = require("type-graphql");
const data_source_1 = require("../../data-source");
const Course_1 = require("../../entity/Course");
const User_1 = require("../../entity/User");
const LecturerCourse_1 = require("../../entity/LecturerCourse");
let CourseResolver = class CourseResolver {
    constructor() {
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.lecturerCourseRepository = data_source_1.AppDataSource.getRepository(LecturerCourse_1.LecturerCourse);
    }
    courses() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.courseRepository.find();
        });
    }
    createCourse(code, name, semester, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCourse = yield this.courseRepository.findOne({ where: { code } });
            if (existingCourse) {
                throw new Error('Course with this code already exists!');
            }
            const course = this.courseRepository.create({ code, name, semester, description });
            yield this.courseRepository.save(course);
            return course;
        });
    }
    updateCourse(id, code, name, semester, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield this.courseRepository.findOne({ where: { id } });
            if (!course) {
                throw new Error('Course not found!');
            }
            if (code !== undefined)
                course.code = code;
            if (name !== undefined)
                course.name = name;
            if (semester !== undefined)
                course.semester = semester;
            if (description !== undefined)
                course.description = description;
            yield this.courseRepository.save(course);
            return course;
        });
    }
    deleteCourse(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.courseRepository.delete(id);
            return !!result.affected && result.affected > 0;
        });
    }
    assignLecturerToCourse(courseId, lecturerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the course
            const course = yield this.courseRepository.findOne({ where: { id: courseId } });
            if (!course)
                throw new Error('Course not found!');
            // Find the lecturer
            const lecturer = yield this.userRepository.findOne({ where: { id: lecturerId, role: 'lecturer' } });
            if (!lecturer)
                throw new Error('Lecturer not found or user is not a lecturer!');
            // Check if assignment already exists
            const existingAssignment = yield this.lecturerCourseRepository.findOne({
                where: { course: { id: courseId }, lecturer: { id: lecturerId } }
            });
            if (existingAssignment)
                throw new Error('This lecturer is already assigned to this course!');
            // Create new assignment
            const lecturerCourse = this.lecturerCourseRepository.create({ course, lecturer });
            yield this.lecturerCourseRepository.save(lecturerCourse);
            // Return the updated course
            return this.courseRepository.findOne({
                where: { id: courseId },
                relations: ['lecturer_courses', 'lecturer_courses.lecturer']
            });
        });
    }
};
exports.CourseResolver = CourseResolver;
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Query)(() => [Course_1.Course]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "courses", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    __param(0, (0, type_graphql_1.Arg)('code')),
    __param(1, (0, type_graphql_1.Arg)('name')),
    __param(2, (0, type_graphql_1.Arg)('semester')),
    __param(3, (0, type_graphql_1.Arg)('description', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "createCourse", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('code', { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)('name', { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)('semester', { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)('description', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "updateCourse", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "deleteCourse", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    __param(0, (0, type_graphql_1.Arg)('courseId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('lecturerId', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "assignLecturerToCourse", null);
exports.CourseResolver = CourseResolver = __decorate([
    (0, type_graphql_1.Resolver)(Course_1.Course)
], CourseResolver);
