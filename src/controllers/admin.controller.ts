import { Request, Response } from 'express';
import { IUser } from '../models/user.model';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';

export const adminController = {
  async getAllUsers(req: Request, res: Response) {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        User.countDocuments(query),
      ]);

      res.json({
        items: users,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  async getAllJobs(req: Request, res: Response) {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query = search
        ? {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const [jobs, total] = await Promise.all([
        Job.find(query)
          .populate('clientId', 'name')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Job.countDocuments(query),
      ]);

      res.json({
        items: jobs,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching jobs' });
    }
  },

  async getAllApplications(req: Request, res: Response) {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query = search
        ? {
            $or: [
              { 'job.title': { $regex: search, $options: 'i' } },
              { 'worker.name': { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const [applications, total] = await Promise.all([
        Application.find(query)
          .populate('jobId')
          .populate('workerId', 'name')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Application.countDocuments(query),
      ]);

      res.json({
        items: applications,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  async deleteJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Job.findByIdAndDelete(id);
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting job' });
    }
  },

  async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Application.findByIdAndDelete(id);
      res.json({ message: 'Application deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting application' });
    }
  },
}; 