// app/api/numberplate/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import Numberplate from '@/models/Numberplate';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const numberplates = await Numberplate.find({ userId: session.user.id }).lean();
    return NextResponse.json(numberplates, { status: 200 });
  } catch (error) {
    console.error('Error fetching numberplates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { numberplate } = await request.json();

    if (!numberplate) {
      return NextResponse.json({ error: 'Missing numberplate' }, { status: 400 });
    }

    const existingNumberplate = await Numberplate.findOne({ numberplate });
    if (existingNumberplate) {
      return NextResponse.json({ error: 'Numberplate already exists' }, { status: 400 });
    }

    const newNumberplate = new Numberplate({
      numberplate,
      userId: session.user.id,
    });
    await newNumberplate.save();

    return NextResponse.json({ message: 'Numberplate added', numberplate: newNumberplate }, { status: 201 });
  } catch (error) {
    console.error('Error adding numberplate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}