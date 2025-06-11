import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Application } from '../entity/Application';
import { LecturerCourse } from '../entity/LecturerCourse';
import { Course } from '../entity/Course';

const applicationRepository = AppDataSource.getRepository(Application);
const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
const courseRepository = AppDataSource.getRepository(Course);

// Get all applications for courses taught by the lecturer
export const getMyCourseApplications = async (req: Request, res: Response) => {
  try {
    const lecturerId = (req as any).user.id;
    // Find all courses taught by this lecturer
    const lecturerCourses = await lecturerCourseRepository.find({
      where: { lecturer: { id: lecturerId } },
      relations: ['course'],
    });
    const courseIds = lecturerCourses.map(lc => lc.course.id);
    if (courseIds.length === 0) {
      return res.json([]);
    }
    // Find all applications for these courses
    const applications = await applicationRepository.find({
      where: courseIds.map(id => ({ course: { id } })),
      relations: ['user', 'course'],
      order: { applied_at: 'DESC' }
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications for lecturer:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

// Approve or reject an application
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const lecturerId = (req as any).user.id;
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
    const application = await applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['course', 'user'], // Also load user relation for potential future use or stricter checks
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Check if the lecturer teaches this course by verifying lecturer_id and course_id
    const lecturerCourse = await lecturerCourseRepository.findOne({
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
    await applicationRepository.save(application);

    res.json({ message: `Application ${status}`, application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

// Get dashboard statistics for the lecturer
export const getLecturerDashboardStats = async (req: Request, res: Response) => {
  try {
    const lecturerId = (req as any).user.id;

    // Find all courses taught by this lecturer
    const lecturerCourses = await lecturerCourseRepository.find({
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
    const applications = await applicationRepository.find({
      where: courseIds.map(id => ({ course: { id } })),
      relations: ['user', 'course'],
    });

    // Aggregate statistics
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

    const applicationsByRole: { name: string; count: number }[] = [];
    const roleCounts: { [key: string]: number } = {};
    applications.forEach(app => {
      roleCounts[app.role_applied] = (roleCounts[app.role_applied] || 0) + 1;
    });
    for (const role in roleCounts) {
      applicationsByRole.push({ name: role === 'tutor' ? 'Tutor' : 'Lab Assistant', count: roleCounts[role] });
    }

    const applicationsByCourse: { name: string; count: number }[] = [];
    const courseCounts: { [key: string]: number } = {};
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

  } catch (error) {
    console.error('Error fetching lecturer dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
}; 