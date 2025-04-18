import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all renewal services with related user and company info
    const renewalServices = await prisma.renewalService.findMany({
      include: {
        user: {
          select: {
            name: true,
            company: {
              select: {
                name: true
              }
            }
          },

        }
      }
    });

    return NextResponse.json(renewalServices);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId } = body;

    // Only allow updating isAssignedService from false to true
    const service = await prisma.renewalService.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.isAssignedService) {
      return NextResponse.json(
        { error: "Service is already assigned" },
        { status: 400 }
      );
    }

    const updatedService = await prisma.renewalService.update({
      where: { id: serviceId },
      data: { isAssignedService: true , status: 'pending' }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
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
      documents,
      ownerId,  // Use ownerId from form data
      roadTaxDoc,
      fitnessDoc,
      insuranceDoc,
      pollutionDoc,
      statePermitDoc,
      nationalPermitDoc,
    } = body;

    // Validate required fields
    if (!vrn || !status || !ownerId) {
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
        ownerId,  // Use ownerId from form data
        roadTaxDoc: roadTaxDoc || '',
        fitnessDoc: fitnessDoc || '',
        insuranceDoc: insuranceDoc || '',
        pollutionDoc: pollutionDoc || '',
        statePermitDoc: statePermitDoc || '',
        nationalPermitDoc: nationalPermitDoc || ''
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