import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalSlots: { type: Number, required: true, min: 1 },
  occupiedSlots: { type: Number, default: 0, min: 0 },
});

export default mongoose.models.ParkingLot || mongoose.model('ParkingLot', parkingLotSchema);