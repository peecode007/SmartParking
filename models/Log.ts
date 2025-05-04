import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  numberplate: { type: String, required: true },
  camera_token: { type: String, required: true },
  timestamp: { type: Date, required: true },
  location: { type: String },
  action: { type: String, enum: ['entry', 'exit'], default: 'entry' },
});

export default mongoose.models.Log || mongoose.model('Log', logSchema);