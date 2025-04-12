import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const companies = await prisma.company.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { ownerName: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const company = await prisma.company.create({
      data: {
        ...data,
        status: true
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    if (error instanceof Error) {
      if ('code' in error && error.code === 'P2002') {
        return new NextResponse('Company with this email already exists', { status: 400 });
      }
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}