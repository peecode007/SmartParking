import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  numberplate: { type: String, required: true },
  camera_token: { type: String, required: true },
  parkingLot: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, required: true },
  location: { type: String },
  action: { type: String, enum: ['entry', 'exit'], default: 'entry' },
}, {versionKey: false});

export default mongoose.models.Log || mongoose.model('Log', logSchema);