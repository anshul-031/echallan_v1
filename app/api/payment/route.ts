import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challans, rc_no, total_amount } = await req.json();

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get user
      const user = await tx.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          credits: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.credits < total_amount) {
        throw new Error('Insufficient credits');
      }

      // Update user credits
      await tx.user.update({
        where: { id: user.id },
        data: { 
          credits: user.credits - total_amount
        }
      });

      // Update challans status and create preceding challans
      for (const challan of challans) {
        // Update challan status
        await tx.challan.update({
          where: { challan_no: challan.challan_no },
          data: { challan_status: 'Ongoing' }
        });

        // Get original challan data
        const originalChallan = await tx.challan.findUnique({
          where: { challan_no: challan.challan_no }
        });

        if (!originalChallan) {
          throw new Error(`Challan ${challan.challan_no} not found`);
        }

        // Create preceding challan record
        await tx.precedingChallan.create({
          data: {
            challan_id: originalChallan.id,
            rc_no: rc_no,
            user_id: user.id,
            challan_no: originalChallan.challan_no,
            challan_status: 'Ongoing',
            sent_to_reg_court: originalChallan.sent_to_reg_court,
            sent_to_virtual_court: originalChallan.sent_to_virtual_court,
            amount_of_fine: originalChallan.amount_of_fine,
            fine_imposed: originalChallan.fine_imposed,
            vehicle_id: originalChallan.vehicle_id
          }
        });
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Payment failed',
        success: false 
      }, 
      { status: 500 }
    );
  }
}