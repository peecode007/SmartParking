// app/api/cameras/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Camera from '@/models/Camera';
import ParkingLot from '@/models/ParkingLot';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const cameras = await Camera.find().lean();
    return NextResponse.json(cameras, { status: 200 });
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { token, location, parkingLotId } = await request.json();

    if (!token || !location) {
      return NextResponse.json({ error: 'Missing token or location' }, { status: 400 });
    }

    const parkingLot = await ParkingLot.findOne({ name: location });
    if (!parkingLot) {
      return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });
    }

    if (parkingLotId) {
      const parkingLotById = await ParkingLot.findById(parkingLotId);
      if (!parkingLotById || parkingLotById.name !== location) {
        return NextResponse.json({ error: 'Invalid parking lot ID' }, { status: 400 });
      }
    }

    const existingCamera = await Camera.findOne({ token });
    if (existingCamera) {
      return NextResponse.json({ error: 'Token already exists' }, { status: 400 });
    }

    const camera = new Camera({
      token,
      location,
      parkingLot: parkingLotId || parkingLot._id,
      status: 'active',
    });
    await camera.save();

    return NextResponse.json({ message: 'Camera token created', camera }, { status: 201 });
  } catch (error) {
    console.error('Error creating camera token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}