import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET handler to fetch renewal services and stats for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user with renewal services and stats
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status')?.toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        renewalServices: {
          where: status ? {
            status: status as 'pending' | 'processing' | 'completed' | 'cancelled'
          } : undefined
        },
        renewalStats: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      services: user.renewalServices,
      stats: user.renewalStats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching renewal services and stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch renewal data" },
      { status: 500 }
    );
  }
}

// POST handler to create a new renewal service
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received service creation request:", body);
    
    const {
      services,
      vehicle_no,
      vehicleId,
      govFees,
      serviceCharge,
      price,
      isAssignedService
    } = body;

    // Validate vehicleId format
    if (!vehicleId || typeof vehicleId !== 'string') {
      return NextResponse.json(
        { error: "Vehicle ID must be a string" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(vehicleId)) {
      return NextResponse.json(
        { error: "Invalid MongoDB ObjectId format" },
        { status: 400 }
      );
    }

    if (!services || !vehicle_no) {
      const missingFields = [];
      if (!services) missingFields.push('services');
      if (!vehicle_no) missingFields.push('vehicle_no');
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create new renewal service with authenticated user's ID
    const data = {
      services,
      vehicle_no,
      vehicleId, // Already validated as string ObjectId
      userId: session.user.id,
      govFees: govFees ? parseFloat(govFees.toString()) : null,
      serviceCharge: serviceCharge ? parseFloat(serviceCharge.toString()) : null,
      price: price ? parseFloat(price.toString()) : null,
      isAssignedService: isAssignedService
    };

    console.log("Creating renewal service with data:", data);

    const newService = await prisma.renewalService.create({
      data,
      include: {
        vehicle: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log("Service created successfully:", newService);
    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    console.error("Error creating renewal service:", error);
    
    // Handle Prisma-specific errors
    if (error.code) {
      switch (error.code) {
        case 'P2002':
          return NextResponse.json(
            { error: "A service with these details already exists" },
            { status: 400 }
          );
        case 'P2003':
          return NextResponse.json(
            { error: "Referenced vehicle or user does not exist" },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { error: `Database error: ${error.message}` },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      { error: error.message || "Failed to create renewal service" },
      { status: 500 }
    );
  }
}