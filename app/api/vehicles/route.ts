import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET handler to fetch vehicles (all for admin, user-specific for regular users)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin can see all vehicles
    if (session.user.role === 'admin') {
      const vehicles = await prisma.vehicle.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return NextResponse.json(vehicles, { status: 200 });
    }

    // Regular users can only see their vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    return NextResponse.json(vehicles, { status: 200 });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create a new vehicle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vrn,
      roadTax,
      fitness,
      insurance,
      pollution,
      statePermit,
      nationalPermit,
      lastUpdated,
      status,
      registeredAt,
      documents
    } = body;

    // Validate required fields
    if (!vrn || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vrn,
        roadTax: roadTax || '',
        fitness: fitness || '',
        insurance: insurance || '',
        pollution: pollution || '',
        statePermit: statePermit || '',
        nationalPermit: nationalPermit || '',
        lastUpdated: lastUpdated || new Date().toISOString(),
        status,
        registeredAt: registeredAt || new Date().toISOString(),
        documents: documents || 0,
        ownerId: session.user.id
      }
    });

    return NextResponse.json(vehicle, { status: 201 });

  } catch (error: any) {
    console.error('Creation error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Vehicle with this VRN already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update a vehicle
export async function PUT(request: Request,{ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log(session)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id; // Extract ID from the URL params
    const updateData = await request.json();
    
    console.log("ID from URL:", id);
    console.log("Update data:", updateData);

    console.log(id, updateData)

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Check if user has permission to update this vehicle
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) }
    });

  
    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (existingVehicle.ownerId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to update this vehicle' }, { status: 403 });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json(vehicle, { status: 200 });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  console.log("DELETE request received");

  try {
    const session = await getServerSession(authOptions);
    
    // Log the entire session object
    console.log("Full Session:", JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log("Unauthorized: No session user");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if session.user.id exists
    if (!session.user.id) {
      console.log("Session user ID is missing");
      return NextResponse.json({ error: 'Session user ID is missing' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log("Deleting vehicle with ID:", id);

    if (!id) {
      console.log("Vehicle ID is required");
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Check if user has permission to delete this vehicle
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: Number(id) },
    });

    if (!existingVehicle) {
      console.log("Vehicle not found");
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Log the entire vehicle object
    console.log("Existing Vehicle:", JSON.stringify(existingVehicle, null, 2));

    // Detailed logging of IDs and their types
    const userId = session.user.id;
    console.log("Session User ID:", session.user.id, "Type:", typeof session.user.id, "Length:", session.user.id.length);
    console.log("Vehicle Owner ID:", existingVehicle.ownerId, "Type:", typeof existingVehicle.ownerId, "Length:", existingVehicle.ownerId?.length || "N/A");

    // Log the comparison details
    console.log("Comparison (ownerId !== userId):", existingVehicle.ownerId !== userId);
    console.log("Is ownerId null?", existingVehicle.ownerId === null);
    console.log("Do IDs match exactly?", existingVehicle.ownerId === userId);

    // Handle null ownerId and compare IDs
    if (!existingVehicle.ownerId || existingVehicle.ownerId.trim() !== userId.trim()) {
      console.log("Unauthorized to delete this vehicle");
      return NextResponse.json({ error: 'Unauthorized to delete this vehicle' }, { status: 403 });
    }

    await prisma.vehicle.delete({
      where: { id: Number(id) },
    });

    console.log("Vehicle deleted successfully");
    return NextResponse.json({ message: 'Vehicle deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}