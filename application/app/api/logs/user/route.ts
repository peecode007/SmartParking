import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/db';
import Log from '@/models/Log';import { authOptions } from '@/lib/authOptions';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2), `Time: ${Date.now() - startTime}ms`);
    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user ID', `Time: ${Date.now() - startTime}ms`);
      return NextResponse.json({ error: 'Unauthorized', details: 'Missing session or user ID' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'desc';

    await connectToDatabase();

    const query: any = { user: session.user.id };
    if (search) {
      query.numberplate = { $regex: search, $options: 'i' };
    }

    console.log('Query:', JSON.stringify(query, null, 2), `Time: ${Date.now() - startTime}ms`);

    const logs = await Log.find(query)
      .sort({ timestamp: sort === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    const total = await Log.countDocuments(query);

    console.log('Logs fetched:', logs.length, `Total: ${total}`, `Query time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user logs:', {
      message: error.message,
      stack: error.stack,
      time: `${Date.now() - startTime}ms`,
    });
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}