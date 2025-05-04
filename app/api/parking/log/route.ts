// app/api/parking/log/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Camera from '@/models/Camera';
import Numberplate from '@/models/Numberplate';
import User from '@/models/User';
import Log from '@/models/Log';
import ParkingLot from '@/models/ParkingLot';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { token, numberplate } = await request.json();

    // Validate camera token
    const camera = await Camera.findOne({ token }).populate('parkingLot');
    if (!camera || camera.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or inactive camera token' }, { status: 401 });
    }

    // Validate numberplate
    const numberPlateRecord = await Numberplate.findOne({ numberplate });
    if (!numberPlateRecord) {
      return NextResponse.json({ error: 'Numberplate not registered' }, { status: 404 });
    }

    // Validate user balance
    const user = await User.findById(numberPlateRecord.userId);
    if (!user || user.balance < 5) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Find ParkingLot
    let parkingLot;
    if (camera.parkingLot) {
      parkingLot = camera.parkingLot; // Populated
    } else {
      parkingLot = await ParkingLot.findOne({ name: camera.location });
    }
    if (!parkingLot) {
      return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });
    }

    // Check slot availability
    if (parkingLot.occupiedSlots >= parkingLot.totalSlots) {
      return NextResponse.json({ error: 'No slots available' }, { status: 400 });
    }

    // Deduct payment and update slots
    user.balance -= 50;
    await user.save();

    await ParkingLot.findOneAndUpdate(
      { _id: parkingLot._id },
      { $inc: { occupiedSlots: 1 } },
      { new: true }
    );

    // Log the entry
    const log = new Log({
      numberplate,
      camera_token: token,
      user : user._id,
      parkingLot: parkingLot.name,
      timestamp: new Date(),
    });
    await log.save();

    return NextResponse.json({
      message: 'Access granted',
      info: `Processed at ${parkingLot.name} on ${log.timestamp}`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing parking log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}