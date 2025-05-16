<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Camera from '@/models/Camera';
import Numberplate from '@/models/Numberplate';
import ParkingLot from '@/models/ParkingLot';
import Log from '@/models/Log';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
=======
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Camera from "@/models/Camera";
import Numberplate from "@/models/Numberplate";
import ParkingLot from "@/models/ParkingLot";
import Log from "@/models/Log";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
<<<<<<< HEAD
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
=======
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    const user = session.user;
    const { token, numberplate } = await request.json();
<<<<<<< HEAD
    console.log('POST /api/parking/exit received:', { token, numberplate });

    // Validate camera
    const camera = await Camera.findOne({ token }).populate('parkingLot');
    if (!camera || camera.status !== 'active') {
      return NextResponse.json({ error: 'Invalid or inactive camera token' }, { status: 401 });
=======
    console.log("POST /api/parking/exit received:", { token, numberplate });

    // Validate camera
    const camera = await Camera.findOne({ token }).populate("parkingLot");
    if (!camera || camera.status !== "active") {
      return NextResponse.json(
        { error: "Invalid or inactive camera token" },
        { status: 401 },
      );
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    // Validate numberplate
    const numberPlateRecord = await Numberplate.findOne({ numberplate });
    if (!numberPlateRecord) {
<<<<<<< HEAD
      return NextResponse.json({ error: 'Numberplate not registered' }, { status: 404 });
    }

    // Determine parking lot
    const parkingLot = camera.parkingLot || await ParkingLot.findOne({ name: camera.location });
    if (!parkingLot) {
      return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });
=======
      return NextResponse.json(
        { error: "Numberplate not registered" },
        { status: 404 },
      );
    }

    // Determine parking lot
    const parkingLot =
      camera.parkingLot ||
      (await ParkingLot.findOne({ name: camera.location }));
    if (!parkingLot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 },
      );
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    // Prevent duplicate exit: Check if there's already an exit log in last 30 seconds
    const recentExit = await Log.findOne({
      numberplate,
<<<<<<< HEAD
      action: 'exit',
=======
      action: "exit",
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
      timestamp: { $gte: new Date(Date.now() - 30 * 1000) }, // 30 seconds window
    });

    if (recentExit) {
<<<<<<< HEAD
      return NextResponse.json({
        error: 'Duplicate exit detected. Try again shortly.',
      }, { status: 429 });
=======
      return NextResponse.json(
        {
          error: "Duplicate exit detected. Try again shortly.",
        },
        { status: 429 },
      );
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    // Atomically decrement slot only if occupiedSlots > 0
    const updatedLot = await ParkingLot.findOneAndUpdate(
      { _id: parkingLot._id, occupiedSlots: { $gt: 0 } },
      { $inc: { occupiedSlots: -1 } },
<<<<<<< HEAD
      { new: true }
    );

    if (!updatedLot) {
      return NextResponse.json({
        error: 'No occupied slots to exit.',
      }, { status: 400 });
=======
      { new: true },
    );

    if (!updatedLot) {
      return NextResponse.json(
        {
          error: "No occupied slots to exit.",
        },
        { status: 400 },
      );
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    // Create log
    const log = new Log({
      numberplate,
      camera_token: token,
      parkingLot: parkingLot.name,
      timestamp: new Date(),
<<<<<<< HEAD
      action: 'exit',
=======
      action: "exit",
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
      user: user.id,
    });

    await log.save();

<<<<<<< HEAD
    console.log('Exit log created:', log);

    return NextResponse.json({
      message: 'Exit recorded successfully',
      log,
      info: `Processed at ${parkingLot.name} on ${log.timestamp}`,
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing exit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
=======
    console.log("Exit log created:", log);

    return NextResponse.json(
      {
        message: "Exit recorded successfully",
        log,
        info: `Processed at ${parkingLot.name} on ${log.timestamp}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing exit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }
}
