import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await prisma.renewalService.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            company: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { field } = body;

    // Get current service state
    const currentService = await prisma.renewalService.findUnique({
      where: { id: params.id }
    });

    if (!currentService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Special handling for document received (status change)
    if (field === 'status') {
      const updatedService = await prisma.renewalService.update({
        where: { id: params.id },
        data: {
          status: 'processing',
          documentRecieved: true,
          documentRecievedUpdate: new Date()
        }
      });
      return NextResponse.json(updatedService);
    }

    // Special handling for document delivered (complete service)
    if (field === 'documentDelivered') {
      const newValue = !currentService.documentDelivered;
      const updatedService = await prisma.renewalService.update({
        where: { id: params.id },
        data: { 
          documentDelivered: newValue,
          documentDeliveryUpdate: newValue ? new Date() : null,
          status: newValue ? 'completed' : currentService.status
        }
      });
      return NextResponse.json(updatedService);
    }

    // Handle other field updates with their timestamps
    const currentValue = currentService[field as keyof typeof currentService] as boolean;
    const updateData = {
      [field]: !currentValue,
      [`${field}Update`]: !currentValue ? new Date() : null // Set timestamp when true, null when false
    };

    const updatedService = await prisma.renewalService.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );  
  }
}
