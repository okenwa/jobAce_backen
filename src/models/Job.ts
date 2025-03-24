import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  skills: [{ type: String }],
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deadline: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Job', jobSchema); 