import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/db';
import Log from '@/models/Log';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session || !session.user?.email || session.user.email !== 'admin@admin.com') {
      console.log('Unauthorized: Invalid session or non-admin user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    await connectToDatabase();

    const query: any = {};
    if (search) {
      query.numberplate = { $regex: search, $options: 'i' };
    }

    console.log('Query:', query);

    const logs = await Log.find(query)
      .populate({ path: 'user', select: 'email name' })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Log.countDocuments(query);

    console.log('Logs fetched:', logs.length, 'Total:', total);

    return NextResponse.json({ logs, total, page });
  } catch (error: any) {
    console.error('Error fetching logs:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}