import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  balance: { type: Number, default: 50 }, // Default balance for testing
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  numberplates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Numberplate' }],

}, {versionKey: false, timestamps: true});

export default mongoose.models.User || mongoose.model('User', userSchema);