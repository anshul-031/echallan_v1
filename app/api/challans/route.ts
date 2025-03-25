import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = session.user.id;
    const challans = await prisma.challan.findMany({
      where: {
        user_id: userId,
      },
    });

    return new NextResponse(JSON.stringify(challans), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching challans:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch challans' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = session.user.id;
    const { vehicleId } = await request.json();

    if (!vehicleId) {
      return new NextResponse(
        JSON.stringify({ error: 'Vehicle ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if the vehicle exists and is associated with the user
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
        ownerId: userId,
      },
    });

    if (!vehicle) {
      return new NextResponse(
        JSON.stringify({ error: 'Vehicle not found or unauthorized' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const challan = await prisma.challan.create({
      data: {
        rc_no: '', // Required string
        user_id: userId, // Required string, assuming you have a valid user ID
        vehicle_id: vehicleId, // Required int
        challan_no: Date.now().toString(), // Required unique string, using timestamp as a fallback
        challan_status: 'pending', // Required string
        amount_of_fine: new Decimal(0), // Required Decimal
        state_code: '', // Required string
        fine_imposed: new Decimal(0), // Required Decimal
        challan_date_time: new Date(), // Required DateTime
      }
    });

    return new NextResponse(JSON.stringify(challan), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating challan:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create challan' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
