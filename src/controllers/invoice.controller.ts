import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, amount, description, dueDate } = req.body;

    // Validate required fields
    if (!jobId || !amount || !description || !dueDate) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['jobId', 'amount', 'description', 'dueDate']
      });
    }

    // Get the job to verify worker and client
    const job = await mongoose.model('Job').findById(jobId)
      .populate('clientId workerId');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify that the current user is the worker assigned to the job
    if (job.workerId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Only the assigned worker can create invoices for this job' });
    }

    const invoice = new Invoice({
      jobId,
      clientId: job.clientId,
      workerId: req.user.userId,
      amount,
      description,
      dueDate: new Date(dueDate),
      status: 'pending'
    });

    await invoice.save();

    // Populate the invoice with user and job details
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('jobId', 'title')
      .populate('clientId', 'name email')
      .populate('workerId', 'name email');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ 
      message: 'Error creating invoice',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    let query: any = {};

    if (status) {
      query.status = status;
    }

    // If user is not admin, only show their invoices
    if (req.user?.role !== 'admin') {
      query.$or = [
        { clientId: req.user?.userId },
        { workerId: req.user?.userId }
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('jobId', 'title')
      .populate('clientId', 'name email')
      .populate('workerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      message: 'Error fetching invoices',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('jobId', 'title')
      .populate('clientId', 'name email')
      .populate('workerId', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user has access to this invoice
    if (req.user?.role !== 'admin' && 
        invoice.clientId.toString() !== req.user?.userId && 
        invoice.workerId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ 
      message: 'Error fetching invoice',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Only client or admin can update invoice status
    if (req.user?.role !== 'admin' && invoice.clientId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to update this invoice' });
    }

    invoice.status = status;
    await invoice.save();

    // Return populated invoice
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('jobId', 'title')
      .populate('clientId', 'name email')
      .populate('workerId', 'name email');

    res.json(populatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ 
      message: 'Error updating invoice',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}; 