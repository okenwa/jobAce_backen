import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Document } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id) as IUser;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id) as IUser & { _id: any };
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to update their own profile or admin to update any profile
    if (user._id.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((update) => {
      if (update !== '_id' && update !== 'password') {
        (user as any)[update] = updates[update];
      }
    });

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id) as IUser & { _id: any };
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to delete their own profile or admin to delete any profile
    if (user._id.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 