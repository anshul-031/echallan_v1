import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id) {
      return new NextResponse('Company ID is required', { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company status:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}