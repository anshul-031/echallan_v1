import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET handler to fetch renewal services
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const vehicleId = searchParams.get("vehicleId");
    const status = searchParams.get("status");

    // Build filter conditions
    const filters: any = {};
    if (userId) filters.userId = userId;
    if (vehicleId) filters.vehicleId = parseInt(vehicleId);
    if (status) filters.status = status;

    const services = await prisma.renewalService.findMany({
      where: filters,
      include: {
        vehicle: 
        {
          select:
          {
            vrn: true
          }
        }
      }
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("Error fetching renewal services:", error);
    return NextResponse.json(
      { error: "Failed to fetch renewal services" },
      { status: 500 }
    );
  }
}

// POST handler to create a new renewal service
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received service creation request:", body);
    
    const {
      services,
      vehicle_no,
      vehicleId,
      userId,
      govFees,
      serviceCharge,
      price,
      govtFees,
      rtoApproval,
      inspection,
      certificate,
      documentDelivered,
      status,
      isAssignedService
    } = body;

    // Validate required fields and their types
    if (!vehicleId || typeof parseInt(vehicleId.toString()) !== 'number') {
      return NextResponse.json(
        { error: "Valid Vehicle ID is required" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      console.log("Invalid userId:", { userId, type: typeof userId });
      return NextResponse.json(
        { error: `Invalid User ID: received ${userId} (${typeof userId})` },
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

    try {
      // Create new renewal service
      const data = {
        services,
        vehicle_no,
        vehicleId: parseInt(vehicleId.toString()),
        userId,
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
    } catch (err) {
      console.error("Error in Prisma create:", err);
      throw err;
    }
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