const express = require('express');
const router = express.Router();
const { Job } = require('../models/Job');
const { IUser } = require('../models/user.model');
const { authenticateToken } = require('../middleware/auth');

// Get a single job by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('applicants', 'name email');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Transform the job to include client information
    const transformedJob = {
      id: job._id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      deadline: job.deadline,
      status: job.status,
      client: {
        name: job.clientId.name,
        email: job.clientId.email
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };

    res.json(transformedJob);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available jobs for workers
router.get('/available', authenticateToken, async (req, res) => {
  try {
    // Check if user is a worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Only workers can view available jobs' });
    }

    // Find all open jobs that the worker hasn't applied to
    const jobs = await Job.find({
      status: 'open',
      applicants: { $ne: req.user.id }
    }).populate('clientId', 'name email');

    // Transform the jobs to include client information
    const transformedJobs = jobs.map(job => ({
      id: job._id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      deadline: job.deadline,
      status: job.status,
      client: {
        name: job.clientId.name,
        email: job.clientId.email
      }
    }));

    res.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching available jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply for a job
router.post('/:jobId/apply', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const workerId = req.user.id;

    // Check if user is a worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Only workers can apply for jobs' });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is open
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Job is not open for applications' });
    }

    // Check if worker has already applied
    if (job.applicants.includes(workerId)) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Add worker to applicants
    job.applicants.push(workerId);
    await job.save();

    res.json({ message: 'Successfully applied for the job' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 