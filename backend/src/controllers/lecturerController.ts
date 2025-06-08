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
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    // Find the application
    const application = await applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['course'],
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    // Check if the lecturer teaches this course
    const lecturerCourse = await lecturerCourseRepository.findOne({
      where: {
        lecturer: { id: lecturerId },
        course: { id: application.course.id }
      },
    });
    if (!lecturerCourse) {
      return res.status(403).json({ message: 'You do not teach this course' });
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