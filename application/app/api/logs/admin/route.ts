<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/db';
import Log from '@/models/Log';
import User from '@/models/User';
import { authOptions } from '@/lib/authOptions';
=======
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import Log from "@/models/Log";
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
<<<<<<< HEAD
    console.log('Session:', session);
    if (!session || !session.user?.email || session.user.email !== 'admin@admin.com') {
      console.log('Unauthorized: Invalid session or non-admin user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
=======
    console.log("Session:", session);
    if (!session || !session.user?.email || session.user.email !== "admin@admin.com") {
      console.log("Unauthorized: Invalid session or non-admin user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9

    await connectToDatabase();

    const query: any = {};
    if (search) {
<<<<<<< HEAD
      query.numberplate = { $regex: search, $options: 'i' };
    }

    console.log('Query:', query);

    const logs = await Log.find(query)
      .populate({ path: 'user', select: 'email name' })
=======
      query.numberplate = { $regex: search, $options: "i" };
    }

    console.log("Query:", query);

    const logs = await Log.find(query)
      .populate({ path: "user", select: "email name" })
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Log.countDocuments(query);

<<<<<<< HEAD
    console.log('Logs fetched:', logs.length, 'Total:', total);

    return NextResponse.json({ logs, total, page });
  } catch (error: any) {
    console.error('Error fetching logs:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
=======
    console.log("Logs fetched:", logs.length, "Total:", total);

    return NextResponse.json({ logs, total, page });
  } catch (error: any) {
    console.error("Error fetching logs:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
