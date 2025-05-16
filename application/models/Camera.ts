<<<<<<< HEAD
import mongoose from 'mongoose';
=======
import mongoose from "mongoose";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9

const cameraSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  location: { type: String, required: true },
<<<<<<< HEAD
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  parkingLot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Camera || mongoose.model('Camera', cameraSchema);
=======
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  parkingLot: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Camera || mongoose.model("Camera", cameraSchema);

>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
