import express from 'express';
import { adminController } from '../controllers/admin.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// Get all users with pagination and search
router.get('/users', auth, adminController.getAllUsers);

// Get all jobs with pagination and search
router.get('/jobs', auth, adminController.getAllJobs);

// Get all applications with pagination and search
router.get('/applications', auth, adminController.getAllApplications);

// Delete a user
router.delete('/users/:id', auth, adminController.deleteUser);

// Delete a job
router.delete('/jobs/:id', auth, adminController.deleteJob);

// Delete an application
router.delete('/applications/:id', auth, adminController.deleteApplication);

export default router; 