// app/api/numberplate/route.ts
<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import Numberplate from '@/models/Numberplate';
=======
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db";
import Numberplate from "@/models/Numberplate";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
<<<<<<< HEAD
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
=======
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }

  try {
    await connectToDatabase();
<<<<<<< HEAD
    const numberplates = await Numberplate.find({ userId: session.user.id }).lean();
    return NextResponse.json(numberplates, { status: 200 });
  } catch (error) {
    console.error('Error fetching numberplates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
=======
    const numberplates = await Numberplate.find({
      userId: session.user.id,
    }).lean();
    return NextResponse.json(numberplates, { status: 200 });
  } catch (error) {
    console.error("Error fetching numberplates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
<<<<<<< HEAD
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
=======
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
  }

  try {
    await connectToDatabase();
    const { numberplate } = await request.json();

    if (!numberplate) {
<<<<<<< HEAD
      return NextResponse.json({ error: 'Missing numberplate' }, { status: 400 });
=======
      return NextResponse.json({ error: "Missing numberplate" }, { status: 400 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    const existingNumberplate = await Numberplate.findOne({ numberplate });
    if (existingNumberplate) {
<<<<<<< HEAD
      return NextResponse.json({ error: 'Numberplate already exists' }, { status: 400 });
=======
      return NextResponse.json({ error: "Numberplate already exists" }, { status: 400 });
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    }

    const newNumberplate = new Numberplate({
      numberplate,
      userId: session.user.id,
    });
    await newNumberplate.save();

<<<<<<< HEAD
    return NextResponse.json({ message: 'Numberplate added', numberplate: newNumberplate }, { status: 201 });
  } catch (error) {
    console.error('Error adding numberplate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
=======
    return NextResponse.json(
      { message: "Numberplate added", numberplate: newNumberplate },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding numberplate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
