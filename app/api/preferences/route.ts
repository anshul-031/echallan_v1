import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const userEmail = session?.user?.email;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail as string,
      },
      include: {
        preference: true,
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!user.preference) {
      return NextResponse.json({
        roadTaxVisibility: true,
        fitnessVisibility: true,
        insuranceVisibility: true,
        pollutionVisibility: true,
        statePermitVisibility: true,
        nationalPermitVisibility: true,
      });
    }

    return NextResponse.json(user.preference);
  } catch (error: any) {
    console.error("Error fetching preferences:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const userEmail = session?.user?.email;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail as string,
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const data = await request.json();

    const preference = await prisma.preference.upsert({
      where: {
        userId: user.id,
      },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    return NextResponse.json(preference);
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
