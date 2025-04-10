import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {  getExpirationColor } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const vrn = searchParams.get('vrn');
    const expiringDoc = searchParams.get('expiring_doc');
    const expiredDoc = searchParams.get('expired_doc');
    const renewals = searchParams.get('renewals') === 'true';

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session?.user?.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail as string },
      include: {
        preferences: true,
        vehicle_stats: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = user.preferences || {
      roadTaxVisibility: true,
      fitnessVisibility: true,
      insuranceVisibility: true,
      pollutionVisibility: true,
      statePermitVisibility: true,
      nationalPermitVisibility: true,
    };

    // Fetch all vehicles for the user
    let whereClause: any = { ownerId: session.user.id };
    if (vrn) {
      whereClause.vrn = { contains: vrn, mode: 'insensitive' };
    }

    const allVehicles = await prisma.vehicle.findMany({
      where: whereClause,
      select: {
        id: true,
        vrn: true,
        roadTax: preferences.roadTaxVisibility,
        fitness: preferences.fitnessVisibility,
        insurance: preferences.insuranceVisibility,
        pollution: preferences.pollutionVisibility,
        statePermit: preferences.statePermitVisibility,
        nationalPermit: preferences.nationalPermitVisibility,
        lastUpdated: true,
        status: true,
        registeredAt: true,
        documents: true,
        ownerId: true,
        roadTaxDoc: true,
        fitnessDoc: true,
        insuranceDoc: true,
        pollutionDoc: true,
        statePermitDoc: true,
        nationalPermitDoc: true,
        ...(renewals && {
          renewalServices: {
            select: {
              services: true,
            }
          }
        })
      },
    });

    // Filter vehicles based on expiring_doc and expired_doc
    let filteredVehicles = allVehicles;

    if (expiringDoc) {
      filteredVehicles = allVehicles.filter((vehicle) => {
        const date = vehicle[expiringDoc as keyof typeof vehicle] as string;
        return getExpirationColor(date) === "text-yellow-500";
      });
    } else if (expiredDoc) {
      filteredVehicles = allVehicles.filter((vehicle) => {
        const date = vehicle[expiredDoc as keyof typeof vehicle] as string;
        return getExpirationColor(date) === "text-red-500";
      });
    }
    const emptyVehicleStates = {
      total_vehicles: 0,
      expiring_count: 0,
      expired_count: 0,
      expiring_roadTax: 0,
      expiring_fitness: 0,
      expiring_insurance: 0,
      expiring_pollution: 0,
      expiring_statePermit: 0,
      expiring_nationalPermit: 0,
      expired_roadTax: 0,
      expired_fitness: 0,
      expired_insurance: 0,
      expired_pollution: 0,
      expired_statePermit: 0,
      expired_nationalPermit: 0,
      expiring_3m_count: 0,
      expiring_3m_roadTax: 0,
      expiring_3m_fitness: 0,
      expiring_3m_insurance: 0,
      expiring_3m_pollution: 0,
      expiring_3m_statePermit: 0,
      expiring_3m_nationalPermit: 0,
      expiring_6m_count: 0,
      expiring_6m_roadTax: 0,
      expiring_6m_fitness: 0,
      expiring_6m_insurance: 0,
      expiring_6m_pollution: 0,
      expiring_6m_statePermit: 0,
      expiring_6m_nationalPermit: 0,
      expiring_1y_count: 0,
      expiring_1y_roadTax: 0,
      expiring_1y_fitness: 0,
      expiring_1y_insurance: 0,
      expiring_1y_pollution: 0,
      expiring_1y_statePermit: 0,
      expiring_1y_nationalPermit: 0,
    };

    // Compute vehicle stats
    const vehicleStats = user.vehicle_stats ? user.vehicle_stats : emptyVehicleStates;

    return NextResponse.json({
      vehicles: filteredVehicles,
      vehicleStats,
    }, { status: 200 });

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

// PUT handler to update an existing vehicle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updateData = await request.json();
    
    console.log("ID from URL:", id);
    console.log("Update data:", updateData);
    
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Check if user has permission to update this vehicle
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: id }
    });
    
    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
  
    if (existingVehicle.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this vehicle' }, { status: 403 });
    }
  
    // Filter out fields that shouldn't be updated
    const {
      id: _id,
      createdAt,
      updatedAt,
      owner,
      ...validUpdateData
    } = updateData;

    const vehicle = await prisma.vehicle.update({
      where: { id: id },
      data: validUpdateData
    });
  
    return NextResponse.json(vehicle, { status: 200 });
  
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler to remove a vehicle
export async function DELETE(request: Request) {
  console.log("DELETE request received");

  try {
    const session = await getServerSession(authOptions);
    
    console.log("Full Session:", JSON.stringify(session, null, 2));

    if (!session?.user) {
      console.log("Unauthorized: No session user");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: id },
    });

    if (!existingVehicle) {
      console.log("Vehicle not found");
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    console.log("Existing Vehicle:", JSON.stringify(existingVehicle, null, 2));

    const userId = session.user.id;
    console.log("Session User ID:", session.user.id, "Type:", typeof session.user.id, "Length:", session.user.id.length);
    console.log("Vehicle Owner ID:", existingVehicle.ownerId, "Type:", typeof existingVehicle.ownerId, "Length:", existingVehicle.ownerId?.length || "N/A");

    console.log("Comparison (ownerId !== userId):", existingVehicle.ownerId !== userId);
    console.log("Is ownerId null?", existingVehicle.ownerId === null);
    console.log("Do IDs match exactly?", existingVehicle.ownerId === userId);

    if (!existingVehicle.ownerId || existingVehicle.ownerId.trim() !== userId.trim()) {
      console.log("Unauthorized to delete this vehicle");
      return NextResponse.json({ error: 'Unauthorized to delete this vehicle' }, { status: 403 });
    }

    await prisma.vehicle.delete({
      where: { id: id },
    });

    console.log("Vehicle deleted successfully");
    return NextResponse.json({ message: 'Vehicle deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
