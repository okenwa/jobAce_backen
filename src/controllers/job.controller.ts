import { Request, Response } from 'express';
import Job from '../models/Job';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      budget,
      location,
      requiredSkills,
      deadline,
    } = req.body;

    const job = new Job({
      title,
      description,
      category,
      budget,
      location,
      requiredSkills,
      deadline,
      client: req.user?.userId,
    });

    await job.save();

    res.status(201).json(job);
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Error creating job' });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { category, skills, location } = req.query;
    let query: any = { status: 'open' };

    if (category) {
      query.category = category;
    }

    if (skills) {
      query.skills = { $in: (skills as string).split(',') };
    }

    if (location) {
      query.location = location;
    }

    const jobs = await Job.find(query)
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      message: 'Error fetching jobs',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name email')
      .populate('worker', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Error fetching job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      client: req.user?.userId,
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((update) => {
      if (update !== '_id' && update !== 'client') {
        (job as any)[update] = updates[update];
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      client: req.user?.userId,
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
};

export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer open' });
    }

    if (job.clientId.toString() === req.user?.userId) {
      return res.status(400).json({ message: 'You cannot apply to your own job' });
    }

    job.workerId = new Types.ObjectId(req.user?.userId);
    job.status = 'in_progress';
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Error applying for job' });
  }
}; 