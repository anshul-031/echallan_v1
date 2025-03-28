import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET handler to fetch user's vehicles
export async function GET() {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }

    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized: No user in session' }, { status: 401 });
    }

    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized: User ID missing from session',
        sessionInfo: {
          hasUser: !!session.user,
          userKeys: Object.keys(session.user)
        }
      }, { status: 401 });
    }

    // Fetch vehicles belonging to the user
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          ownerId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json(vehicles);
    } catch (dbError: any) {
      console.error('Database error fetching vehicles:', dbError);
      return NextResponse.json({ 
        error: 'Database error fetching vehicles', 
        details: dbError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error fetching user vehicles:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message
    }, { status: 500 });
  }
} 