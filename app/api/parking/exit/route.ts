import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Camera from '@/models/Camera';
import Numberplate from '@/models/Numberplate';
import ParkingLot from '@/models/ParkingLot';
import Log from '@/models/Log';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    const { token, numberplate } = await request.json();
    console.log('POST /api/parking/exit received:', { token, numberplate });

    // Validate camera
    const camera = await Camera.findOne({ token }).populate('parkingLot');
    if (!camera || camera.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or inactive camera token' }, { status: 401 });
    }

    // Validate numberplate
    const numberPlateRecord = await Numberplate.findOne({ numberplate });
    if (!numberPlateRecord) {
      return NextResponse.json({ error: 'Numberplate not registered' }, { status: 404 });
    }

    // Determine parking lot
    const parkingLot = camera.parkingLot || await ParkingLot.findOne({ name: camera.location });
    if (!parkingLot) {
      return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });
    }

    // Prevent duplicate exit: Check if there's already an exit log in last 30 seconds
    const recentExit = await Log.findOne({
      numberplate,
      action: 'exit',
      timestamp: { $gte: new Date(Date.now() - 30 * 1000) }, // 30 seconds window
    });

    if (recentExit) {
      return NextResponse.json({
        error: 'Duplicate exit detected. Try again shortly.',
      }, { status: 429 });
    }

    // Atomically decrement slot only if occupiedSlots > 0
    const updatedLot = await ParkingLot.findOneAndUpdate(
      { _id: parkingLot._id, occupiedSlots: { $gt: 0 } },
      { $inc: { occupiedSlots: -1 } },
      { new: true }
    );

    if (!updatedLot) {
      return NextResponse.json({
        error: 'No occupied slots to exit.',
      }, { status: 400 });
    }

    // Create log
    const log = new Log({
      numberplate,
      camera_token: token,
      parkingLot: parkingLot.name,
      timestamp: new Date(),
      action: 'exit',
      user: user.id,
    });

    await log.save();

    console.log('Exit log created:', log);

    return NextResponse.json({
      message: 'Exit recorded successfully',
      log,
      info: `Processed at ${parkingLot.name} on ${log.timestamp}`,
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing exit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
