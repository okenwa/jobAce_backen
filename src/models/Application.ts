import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    coverLetter: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application; 