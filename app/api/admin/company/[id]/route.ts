import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: params.id
      }
    });

    if (!company) {
      return new NextResponse('Company not found', { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    
    // Remove fields that shouldn't be updated
    const updateData = { 
      name: data.name,
      email: data.email,
      address: data.address,
      ownerName: data.ownerName,
      ownerPhone: data.ownerPhone,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      status: data.status,
      image: data.image,
      gstin: data.gstin,
      pan: data.pan,
      cin: data.cin,
    };

    const company = await prisma.company.update({
      where: {
        id: params.id
      },
      data: updateData
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error', 
      { status: 500 }
    );
  }
}