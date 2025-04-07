import { Request, Response } from 'express';
import Application from '../models/Application';
import { IApplication } from '../models/Application';
import Job from '../models/Job';

export const applicationController = {
  // Create a new application
  async createApplication(req: Request, res: Response) {
    try {
      const { jobId, coverLetter } = req.body;
      const workerId = req.user.id;

      // Check if user is a worker
      if (req.user.role !== 'worker') {
        return res.status(403).json({ error: 'Only workers can apply for jobs' });
      }

      // Check if job exists and is open
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      if (job.status !== 'open') {
        return res.status(400).json({ error: 'Job is not open for applications' });
      }

      // Check if worker has already applied
      const existingApplication = await Application.findOne({ jobId, workerId });
      if (existingApplication) {
        return res.status(400).json({ error: 'You have already applied for this job' });
      }

      const application = new Application({
        jobId,
        workerId,
        coverLetter,
        status: 'pending'
      });

      await application.save();
      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all applications for a job (for client)
  async getJobApplications(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const applications = await Application.find({ jobId })
        .populate('workerId', 'name email skills')
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all applications by a worker
  async getWorkerApplications(req: Request, res: Response) {
    try {
      const workerId = req.user.id;
      const applications = await Application.find({ workerId })
        .populate('jobId', 'title description budget status')
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error('Error fetching worker applications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update application status (for client)
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      const application = await Application.findById(id).populate('jobId');
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check if user is the client who posted the job
      if (application.jobId.clientId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this application' });
      }

      application.status = status;
      await application.save();

      // If application is accepted, update job status
      if (status === 'accepted') {
        await Job.findByIdAndUpdate(application.jobId, {
          status: 'in_progress',
          selectedWorker: application.workerId
        });
      }

      res.json(application);
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete an application
  async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const application = await Application.findById(id).populate('jobId');
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check if user is the applicant or the client who posted the job
      if (application.workerId.toString() !== userId && 
          application.jobId.clientId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this application' });
      }

      await application.deleteOne();
      res.json({ message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}; 