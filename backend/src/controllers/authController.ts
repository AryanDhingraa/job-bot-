import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create new user
    const user = userRepository.create({
      username,
      email,
      password_hash,
      role
    });

    await userRepository.save(user);

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is blocked
    if (user.is_blocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;
    const responsePayload = { user: userWithoutPassword, token };
    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
