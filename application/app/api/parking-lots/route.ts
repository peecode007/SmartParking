// app/api/parking-lots/route.ts
<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import ParkingLot from '@/models/ParkingLot';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
=======
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }

  try {
    await connectToDatabase();
    const parkingLots = await ParkingLot.find().lean();
<<<<<<< HEAD
    const parkingLotsWithAvailable = parkingLots.map(lot => ({
=======
    const parkingLotsWithAvailable = parkingLots.map((lot) => ({
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
      ...lot,
      availableSlots: lot.totalSlots - lot.occupiedSlots,
    }));
    return NextResponse.json(parkingLotsWithAvailable, { status: 200 });
  } catch (error) {
<<<<<<< HEAD
    console.error('Error fetching parking lots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
=======
    console.error("Error fetching parking lots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
<<<<<<< HEAD
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
=======
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }

  try {
    await connectToDatabase();
    const { name, totalSlots } = await request.json();

    if (!name || !totalSlots || totalSlots < 1) {
<<<<<<< HEAD
      return NextResponse.json({ error: 'Missing or invalid name or totalSlots' }, { status: 400 });
=======
      return NextResponse.json({ error: "Missing or invalid name or totalSlots" }, { status: 400 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    const existingLot = await ParkingLot.findOne({ name });
    if (existingLot) {
<<<<<<< HEAD
      return NextResponse.json({ error: 'Parking lot name already exists' }, { status: 400 });
=======
      return NextResponse.json({ error: "Parking lot name already exists" }, { status: 400 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    const parkingLot = new ParkingLot({ name, totalSlots, occupiedSlots: 0 });
    await parkingLot.save();

<<<<<<< HEAD
    return NextResponse.json({ message: 'Parking lot created', parkingLot }, { status: 201 });
  } catch (error) {
    console.error('Error creating parking lot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
=======
    return NextResponse.json({ message: "Parking lot created", parkingLot }, { status: 201 });
  } catch (error) {
    console.error("Error creating parking lot:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
