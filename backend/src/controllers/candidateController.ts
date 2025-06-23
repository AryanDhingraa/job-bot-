import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Application } from '../entity/Application';
import { Course } from '../entity/Course';
import { User } from '../entity/User';

const applicationRepository = AppDataSource.getRepository(Application);
const courseRepository = AppDataSource.getRepository(Course);
const userRepository = AppDataSource.getRepository(User);

export const applyForCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
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
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
    }

    // Check if user has already applied for this role in this course
    const existingApplication = await applicationRepository.findOne({
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

    await applicationRepository.save(application);

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    console.error('Error applying for course:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const applications = await applicationRepository.find({
      where: { user: { id: userId } },
      relations: ['course'], // Load related course data
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}; 