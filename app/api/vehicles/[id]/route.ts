import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


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
  
      // Filter out fields that shouldn't be updated
    const {
        id: _id,                 // Remove id
        createdAt,               // Remove createdAt
        updatedAt,               // Remove updatedAt
        owner,                   // Remove nested owner object
        ...validUpdateData       // Keep only valid fields for update
      } = updateData;
  

      const vehicle = await prisma.vehicle.update({
        where: { id: Number(id) },
        data: validUpdateData
      });
  
      return NextResponse.json(vehicle, { status: 200 });
  
    } catch (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }