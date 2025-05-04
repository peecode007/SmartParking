import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  parkingLot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Camera || mongoose.model('Camera', cameraSchema);