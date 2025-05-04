// models/Numberplate.ts
import mongoose from 'mongoose';

const numberplateSchema = new mongoose.Schema({
  numberplate: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.models.Numberplate || mongoose.model('Numberplate', numberplateSchema);