import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/', auth, getUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

export default router; 