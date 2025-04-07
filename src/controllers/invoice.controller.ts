import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, clientId, workerId, amount, dueDate } = req.body;

    const invoice = new Invoice({
      jobId,
      clientId,
      workerId,
      amount,
      dueDate,
      status: 'pending'
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Error creating invoice' });
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
    res.status(500).json({ message: 'Error fetching invoices' });
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
    res.status(500).json({ message: 'Error fetching invoice' });
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

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Error updating invoice' });
  }
}; 