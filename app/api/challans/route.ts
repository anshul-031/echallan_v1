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
    const { vehicleId, data: challanData } = await request.json();

    console.log("Received vehicleId:", vehicleId);
    console.log("Raw challanData:", JSON.stringify(challanData, null, 2));

    if (!vehicleId) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId, ownerId: userId },
    });

    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parseDate = (dateStr: string) => {
      const [date, time] = dateStr.split(' ');
      const [day, month, year] = date.split('-');
      return new Date(`${year}-${month}-${day}T${time}Z`);
    };

    const processChallans = async (challanDataArray: any[], status: string) => {
      if (challanDataArray && challanDataArray.length > 0) {
        const challansToCreate = challanDataArray.map((challanItem: any) => {
          console.log(`Processing ${status} challan:`, challanItem);
          return {
            rc_no: vehicle.vrn,
            user_id: userId,
            vehicle_id: vehicleId,
            challan_no: challanItem.challan_no,
            challan_status: challanItem.challan_status,
            amount_of_fine: new Decimal(challanItem.fine_imposed || 0),
            state_code: challanItem.state_code,
            fine_imposed: new Decimal(challanItem.fine_imposed || 0),
            challan_date_time: parseDate(challanItem.challan_date_time),
            sent_to_reg_court : challanItem.sent_to_reg_court,
            sent_to_virtual_court : challanItem.sent_to_virtual_court,
          };
        });

        console.log(`${status} challans to create:`, challansToCreate);
        await prisma.challan.createMany({
          data: challansToCreate,
          skipDuplicates: true,
        });
      } else {
        console.log(`No ${status} challan data found`);
      }
    };

    if (challanData?.data && typeof challanData.data === 'object' && Object.keys(challanData.data).length === 0) {
      // Create an empty challan object
      const emptyChallanInstance = [{
        rc_no: vehicle.vrn,
        user_id: userId,
        vehicle_id: vehicleId,
        challan_no: "",
        challan_status: "",
        amount_of_fine: new Decimal(0),
        state_code: "",
        fine_imposed: new Decimal(0),
        challan_date_time: new Date().toISOString(),
        sent_to_reg_court : "",
        sent_to_virtual_court : "",
      }];

      console.log(`Creating default challan:`, emptyChallanInstance);
      await prisma.challan.createMany({
        data: emptyChallanInstance,
        skipDuplicates: true,
      });
    } else {
      await processChallans(challanData?.data?.Disposed_data, "disposed");
      await processChallans(challanData?.data?.Pending_data, "pending");
    }

    return new NextResponse(JSON.stringify({ message: "Challans created successfully" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error('Error creating challan:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create challan', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
