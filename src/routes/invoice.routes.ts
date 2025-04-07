import { Router } from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from '../controllers/invoice.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.post('/', auth, createInvoice);
router.get('/', auth, getInvoices);
router.get('/:id', auth, getInvoiceById);
router.patch('/:id/status', auth, updateInvoiceStatus);

export default router; 