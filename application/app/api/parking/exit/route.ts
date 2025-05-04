import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Camera from '@/models/Camera';
import Numberplate from '@/models/Numberplate';
import ParkingLot from '@/models/ParkingLot';
import Log from '@/models/Log';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { token, numberplate } = await request.json();
    console.log('POST /api/parking/exit received:', { token, numberplate });

    // Validate camera token
    const camera = await Camera.findOne({ token }).populate('parkingLot');
    if (!camera || camera.status !== 'active') {
      console.log('Invalid camera token:', token);
      return NextResponse.json({ error: 'Invalid or inactive camera token' }, { status: 401 });
    }
    // console.log('Camera found:', camera);

    // Validate numberplate
    const numberPlateRecord = await Numberplate.findOne({ numberplate });
    if (!numberPlateRecord) {
      console.log('Numberplate not found:', numberplate);
      return NextResponse.json({ error: 'Numberplate not registered' }, { status: 404 });
    }
    // console.log('Numberplate found:', numberPlateRecord);

    // Find ParkingLot
    let parkingLot;
    if (camera.parkingLot) {
      parkingLot = camera.parkingLot;
    } else {
      parkingLot = await ParkingLot.findOne({ name: camera.location });
    }
    if (!parkingLot) {
      console.log('Parking lot not found for location:', camera.location);
      return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });
    }
    // console.log('Parking lot found:', parkingLot);

    // Check if there are occupied slots to exit
    if (parkingLot.occupiedSlots <= 0) {
      console.log('No occupied slots in parking lot:', parkingLot.name);
      return NextResponse.json({ error: 'No occupied slots to exit' }, { status: 400 });
    }

    // Update parking lot slots
    const updatedLot = await ParkingLot.findOneAndUpdate(
      { _id: parkingLot._id },
      { $inc: { occupiedSlots: -1 } },
      { new: true }
    );
    // console.log('Parking lot updated:', updatedLot);

    // Log the exit
    const log = new Log({
      numberplate,
      camera_token: token,
      parkingLot: parkingLot.name,
      timestamp: new Date(),
      action: 'exit',
    });
    await log.save();
    console.log('Exit log created:', log);

    return NextResponse.json({
      message: 'Exit recorded',
      log,
      info: `Processed at ${parkingLot.name} on ${log.timestamp}`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing exit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}