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
exports.ApplicationResolver = void 0;
const type_graphql_1 = require("type-graphql");
const data_source_1 = require("../../data-source");
const Application_1 = require("../../entity/Application");
const User_1 = require("../../entity/User");
const Course_1 = require("../../entity/Course");
// Define the payload type for the candidate availability subscription
let CandidateAvailabilityPayload = class CandidateAvailabilityPayload {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], CandidateAvailabilityPayload.prototype, "candidateId", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CandidateAvailabilityPayload.prototype, "candidateUsername", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CandidateAvailabilityPayload.prototype, "isAvailable", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CandidateAvailabilityPayload.prototype, "message", void 0);
CandidateAvailabilityPayload = __decorate([
    (0, type_graphql_1.ObjectType)()
], CandidateAvailabilityPayload);
let ApplicationResolver = class ApplicationResolver {
    constructor() {
        this.applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    applications() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applicationRepository.find({ relations: ['user', 'course'] });
        });
    }
    updateApplicationStatusGraphQL(applicationId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.applicationRepository.findOne({ where: { id: applicationId } });
            if (!application) {
                throw new Error('Application not found!');
            }
            if (!['pending', 'accepted', 'rejected', 'approved'].includes(status)) {
                throw new Error('Invalid status provided.');
            }
            application.status = status;
            yield this.applicationRepository.save(application);
            return application;
        });
    }
    markCandidateAsUnavailable(candidateId_1, isAvailable_1, message_1, _a) {
        return __awaiter(this, arguments, void 0, function* (candidateId, isAvailable, message, { pubSub }) {
            const candidate = yield this.userRepository.findOne({ where: { id: candidateId, role: 'candidate' } });
            if (!candidate) {
                throw new Error('Candidate not found or not a candidate user!');
            }
            // Assuming you have a field like isAvailableForHiring on the User entity
            // You might need to add this field to your User entity (backend/src/entity/User.ts)
            candidate.isAvailableForHiring = isAvailable;
            yield this.userRepository.save(candidate);
            // Publish the event
            yield pubSub.publish('CANDIDATE_AVAILABILITY_CHANGED', {
                candidateAvailabilityChanged: {
                    candidateId: candidate.id,
                    candidateUsername: candidate.username,
                    isAvailable: candidate.isAvailableForHiring,
                    message,
                },
            });
            return true;
        });
    }
    candidateAvailabilityChanged(payload) {
        return payload;
    }
    approvedApplicationsByCourse() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applicationRepository.find({
                where: { status: 'approved' },
                relations: ['user', 'course'],
                order: {
                    course: { name: 'ASC' },
                    user: { username: 'ASC' },
                },
            });
        });
    }
};
exports.ApplicationResolver = ApplicationResolver;
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Query)(() => [Application_1.Application]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplicationResolver.prototype, "applications", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Mutation)(() => Application_1.Application),
    __param(0, (0, type_graphql_1.Arg)('applicationId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('status', () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ApplicationResolver.prototype, "updateApplicationStatusGraphQL", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('candidateId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('isAvailable', () => Boolean)),
    __param(2, (0, type_graphql_1.Arg)('message', { nullable: true })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationResolver.prototype, "markCandidateAsUnavailable", null);
__decorate([
    (0, type_graphql_1.Subscription)(() => CandidateAvailabilityPayload, {
        topics: 'CANDIDATE_AVAILABILITY_CHANGED',
    }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CandidateAvailabilityPayload]),
    __metadata("design:returntype", CandidateAvailabilityPayload)
], ApplicationResolver.prototype, "candidateAvailabilityChanged", null);
__decorate([
    (0, type_graphql_1.Authorized)('admin'),
    (0, type_graphql_1.Query)(() => [Application_1.Application]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplicationResolver.prototype, "approvedApplicationsByCourse", null);
exports.ApplicationResolver = ApplicationResolver = __decorate([
    (0, type_graphql_1.Resolver)(Application_1.Application)
], ApplicationResolver);
