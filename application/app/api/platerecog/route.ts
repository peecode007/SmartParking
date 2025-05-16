import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Numberplate from '@/models/Numberplate';
import User from '@/models/User';
import Log from '@/models/Log';
import ParkingLot from '@/models/ParkingLot';
import Camera from '@/models/Camera';

// Function to verify API key
async function verifyApiKey(apiKey: string | null) {
  if (!apiKey) {
    return null;
  }

  await connectToDatabase();
  const camera = await Camera.findOne({ token: apiKey }).populate('parkingLot');
  if (!camera || camera.status !== 'active') {
    return null;
  }

  return camera;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-KEY');
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
      console.error('PLATE_RECOGNIZER_API_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const formDataToSend = new FormData();
    formDataToSend.append('upload', imageFile);

    const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${plateRecognizerApiKey}`,
      },
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PlateRecognizer API error:', errorText);
      return NextResponse.json({ error: 'Failed to recognize license plate' }, { status: response.status });
    }

    const plateData = await response.json();

    if (!plateData.results || plateData.results.length === 0) {
      return NextResponse.json({ error: 'No license plate detected in the image' }, { status: 400 });
    }

    const numberplate = plateData.results[0].plate.toUpperCase();
    console.log('Detected numberplate:', numberplate);

    await connectToDatabase();
    const numberPlateRecord = await Numberplate.findOne({ numberplate });

    if (!numberPlateRecord) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'Numberplate not registered'
      }, { status: 200 });
    }

    const user = await User.findById(numberPlateRecord.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'User not found'
      }, { status: 200 });
    }

    const parkingFee = 50;
    if (user.balance < parkingFee) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'Insufficient balance'
      }, { status: 200 });
    }

    // Identify the parking lot
    let parkingLot;
    if (camera.parkingLot) {
      parkingLot = camera.parkingLot; // Already populated
    } else {
      parkingLot = await ParkingLot.findOne({ name: camera.location });
    }

    if (!parkingLot) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'Parking lot not found'
      }, { status: 200 });
    }

    // Check slot availability
    if (parkingLot.occupiedSlots >= parkingLot.totalSlots) {
      return NextResponse.json({
        success: false,
        plate_number: numberplate,
        message: 'No slots available'
      }, { status: 200 });
    }

    // Deduct payment and update slots
    user.balance -= parkingFee;
    await user.save();

    await ParkingLot.findOneAndUpdate(
      { _id: parkingLot._id },
      { $inc: { occupiedSlots: 1 } },
      { new: true }
    );

    // Log the entry
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
      parking_lot: parkingLot.name,
      plate_number: numberplate,
      message: 'Access granted. Barrier opened.',
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing plate recognition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}