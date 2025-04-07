import express from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Create a new application (worker only)
router.post('/', authenticateToken, applicationController.createApplication);

// Get all applications for a specific job (client only)
router.get('/job/:jobId', authenticateToken, applicationController.getJobApplications);

// Get all applications by a worker (worker only)
router.get('/worker', authenticateToken, applicationController.getWorkerApplications);

// Update application status (client only)
router.patch('/:id/status', authenticateToken, applicationController.updateApplicationStatus);

// Delete an application (worker or client)
router.delete('/:id', authenticateToken, applicationController.deleteApplication);

export default router; 