import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rc_no = searchParams.get('rc_no');

    if (!rc_no) {
      return NextResponse.json(
        { error: 'RC number is required' },
        { status: 400 }
      );
    }

    const challans = await prisma.challan.findMany({
      where: {
        rc_no: rc_no,
        challan_status: 'Pending'
      },
      select: {
        id: true,
        challan_no: true,
        challan_status: true,
        fine_imposed: true,
        state_code: true,
        challan_date_time: true,
        sent_to_reg_court: true,
        amount_of_fine: true
      }
    });

    return NextResponse.json(challans);

  } catch (error) {
    console.error('Error fetching challans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challans' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { rc_no: string } }
) {
  try {
    await prisma.challan.deleteMany({
      where: {
        rc_no: params.rc_no
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting challans:', error);
    return NextResponse.json(
      { error: 'Failed to delete challans' },
      { status: 500 }
    );
  }
}