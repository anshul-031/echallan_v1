import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Vehicle } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rc_no, challans } = await request.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create vehicle with proper error handling
    let vehicle = await prisma.vehicle.findFirst({
      where: { vrn: rc_no }
    });

    // Store vehicle in a separate variable after confirming it exists
    let confirmedVehicle: Vehicle;

    if (!vehicle) {
      try {
        confirmedVehicle = await prisma.vehicle.create({
          data: {
            vrn: rc_no,
            roadTax: 'Unknown',
            fitness: 'Unknown',
            insurance: 'Unknown',
            pollution: 'Unknown',
            statePermit: 'Unknown',
            nationalPermit: 'Unknown',
            lastUpdated: new Date().toISOString(),
            status: 'Active',
            registeredAt: new Date().toISOString(),
            documents: 0,
            owner: {
              connect: { id: user.id }
            }
          }
        });
      } catch (error) {
        console.error('Error creating vehicle:', error);
        return NextResponse.json(
          { error: 'Failed to create vehicle', success: false },
          { status: 500 }
        );
      }
    } else {
      confirmedVehicle = vehicle;
    }

    // Process challans with confirmed vehicle
    await prisma.$transaction(async (tx) => {
      for (const challan of challans) {
        const defaultDate = new Date('2001-01-01');
        
        await tx.challan.upsert({
          where: { challan_no: challan.challan_no },
          update: {
            challan_status: challan.challan_status,
            sent_to_reg_court: challan.sent_to_reg_court,
            sent_to_virtual_court: challan.sent_to_virtual_court,
            fine_imposed: challan.fine_imposed,
            amount_of_fine: challan.amount_of_fine,
            state_code: challan.state_code,
            challan_date_time: challan.challan_date_time || defaultDate,
            remark: challan.remark || 'NA',
            receipt_no: challan.receipt_no,
            last_update: new Date(),
          },
          create: {
            rc_no: challan.rc_no,
            challan_no: challan.challan_no,
            challan_status: challan.challan_status,
            sent_to_reg_court: challan.sent_to_reg_court,
            sent_to_virtual_court: challan.sent_to_virtual_court,
            fine_imposed: challan.fine_imposed,
            amount_of_fine: challan.amount_of_fine,
            state_code: challan.state_code,
            challan_date_time: challan.challan_date_time || defaultDate,
            remark: challan.remark || 'NA',
            receipt_no: challan.receipt_no,
            last_update: new Date(),
            user: {
              connect: { id: user.id }
            },
            vehicle: {
              connect: { id: confirmedVehicle.id }
            }
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing challans:', error);
    return NextResponse.json(
      { error: 'Failed to sync challans', success: false },
      { status: 500 }
    );
  }
}