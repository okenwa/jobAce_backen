import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import '../models/User';
import '../models/Job';
import '../models/Invoice';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_ace';

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@jobace.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
  },
  {
    name: 'John Client',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'client',
    status: 'active',
    createdAt: new Date(),
  },
  {
    name: 'Jane Worker',
    email: 'jane@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'worker',
    status: 'active',
    createdAt: new Date(),
  },
];

const sampleJobs = [
  {
    title: 'House Cleaning',
    description: 'Need someone to clean my house weekly',
    budget: 100,
    location: 'Toronto',
    category: 'Cleaning',
    skills: ['Cleaning', 'Organization'],
    status: 'open',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
  },
  {
    title: 'Website Development',
    description: 'Looking for a developer to create a small business website',
    budget: 500,
    location: 'Remote',
    category: 'Development',
    skills: ['Web Development', 'React', 'Node.js'],
    status: 'open',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    createdAt: new Date(),
  },
];

const sampleInvoices = [
  {
    jobId: null, // Will be updated after job creation
    clientId: null, // Will be updated after user creation
    workerId: null, // Will be updated after user creation
    amount: 100,
    status: 'pending',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
];

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      mongoose.model('User').deleteMany({}),
      mongoose.model('Job').deleteMany({}),
      mongoose.model('Invoice').deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const users = await mongoose.model('User').insertMany(sampleUsers);
    console.log('Created users');

    // Update job client IDs and create jobs
    const jobs = await mongoose.model('Job').insertMany(
      sampleJobs.map(job => ({
        ...job,
        clientId: users.find(u => u.role === 'client')._id,
      }))
    );
    console.log('Created jobs');

    // Update invoice IDs and create invoices
    await mongoose.model('Invoice').insertMany(
      sampleInvoices.map(invoice => ({
        ...invoice,
        jobId: jobs[0]._id,
        clientId: users.find(u => u.role === 'client')._id,
        workerId: users.find(u => u.role === 'worker')._id,
      }))
    );
    console.log('Created invoices');

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase(); 