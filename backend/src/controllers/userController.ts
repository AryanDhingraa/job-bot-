import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

const userRepository = AppDataSource.getRepository(User);

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bio, skills, current_level, gpa } = req.body;

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided in the request body
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (skills !== undefined) {
      // Ensure skills is an array of strings if provided
      if (!Array.isArray(skills) || !skills.every(s => typeof s === 'string')) {
        return res.status(400).json({ message: 'Skills must be an array of strings.' });
      }
      user.skills = skills;
    }
    if (current_level !== undefined) {
      user.current_level = current_level;
    }
    if (gpa !== undefined) {
      // Basic GPA format validation (e.g., allow numbers or number strings)
      if (gpa !== null && typeof gpa !== 'string' && typeof gpa !== 'number') {
        return res.status(400).json({ message: 'GPA must be a string or number.' });
      }
      user.gpa = String(gpa);
    }

    await userRepository.save(user);

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}; 