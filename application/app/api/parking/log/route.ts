// app/api/platerecog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Numberplate from '@/models/Numberplate';
import User from '@/models/User';
import Log from '@/models/Log';
import ParkingLot from '@/models/ParkingLot';
import Camera from '@/models/Camera';

async function verifyApiKey(apiKey: string | null) {
  if (!apiKey) return null;
  await connectToDatabase();
  const camera = await Camera.findOne({ token: apiKey }).populate('parkingLot');
  if (!camera || camera.status !== 'active') return null;
  return camera;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-KEY');

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    const camera = await verifyApiKey(apiKey);
    if (!camera) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const plateRecognizerApiKey = process.env.PLATE_RECOGNIZER_API_KEY;
    if (!plateRecognizerApiKey) {
      return NextResponse.json({ error: 'Plate recognizer API key not set' }, { status: 500 });
    }

    // Send image to PlateRecognizer
    const plateFormData = new FormData();
    plateFormData.append('upload', imageFile);

    const plateResponse = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${plateRecognizerApiKey}`,
      },
      body: plateFormData,
    });

    if (!plateResponse.ok) {
      const errorText = await plateResponse.text();
      console.error('PlateRecognizer error:', errorText);
      return NextResponse.json({ error: 'Failed to recognize plate' }, { status: plateResponse.status });
    }

    const plateData = await plateResponse.json();

    if (!plateData.results || plateData.results.length === 0) {
      return NextResponse.json({ error: 'No license plate detected' }, { status: 400 });
    }

    const numberplate = plateData.results[0].plate.toUpperCase();
    console.log('Detected numberplate:', numberplate);

    // Check if numberplate is registered
    await connectToDatabase();
    const numberPlateRecord = await Numberplate.findOne({ numberplate });

    if (!numberPlateRecord) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'Numberplate not registered',
      }, { status: 200 });
    }

    const user = await User.findById(numberPlateRecord.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'User not found',
      }, { status: 200 });
    }

    const parkingFee = 50;
    if (user.balance < parkingFee) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'Insufficient balance',
      }, { status: 200 });
    }

    // Get parking lot info
    const parkingLot = camera.parkingLot || await ParkingLot.findOne({ name: camera.location });
    if (!parkingLot) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'Parking lot not found',
      }, { status: 200 });
    }

    if (parkingLot.occupiedSlots >= parkingLot.totalSlots) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'No slots available',
      }, { status: 200 });
    }

    // Deduct fee and update slots
    user.balance -= parkingFee;
    await user.save();

    await ParkingLot.findByIdAndUpdate(parkingLot._id, { $inc: { occupiedSlots: 1 } });

    // Log entry
    const log = new Log({
      numberplate,
      camera_token: apiKey,
      user: user._id,
      parkingLot: parkingLot.name,
      timestamp: new Date(),
      action: 'entry',
    });
    await log.save();

    return NextResponse.json({
      success: true,
      plate_number: numberplate,
      log,
      message: 'Access granted. Barrier opened.',
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
