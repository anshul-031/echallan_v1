import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const vehicles = await request.json();
    
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return NextResponse.json({ error: 'Invalid data format. Expected an array of vehicles.' }, { status: 400 });
    }
    
    // Process each vehicle
    const results = await Promise.all(
      vehicles.map(async (vehicle) => {
        try {
          // Extract vehicle data
          const {
            vrn,
            roadTax,
            fitness,
            insurance, 
            pollution,
            statePermit,
            nationalPermit,
            status,
            registeredAt,
          } = vehicle;
          
          // Validate required fields
          if (!vrn) {
            return { 
              success: false, 
              vrn: vehicle.vrn || 'Unknown',
              error: 'Missing VRN (Vehicle Registration Number)' 
            };
          }
          
          // Check if vehicle with this VRN already exists
          const existingVehicle = await prisma.vehicle.findFirst({
            where: { vrn }
          });
          
          if (existingVehicle) {
            return { 
              success: false, 
              vrn,
              error: 'Vehicle with this VRN already exists' 
            };
          }
          
          // Create the vehicle
          const createdVehicle = await prisma.vehicle.create({
            data: {
              vrn,
              roadTax: roadTax || '',
              fitness: fitness || '',
              insurance: insurance || '',
              pollution: pollution || '',
              statePermit: statePermit || '',
              nationalPermit: nationalPermit || '',
              lastUpdated: new Date().toLocaleDateString('en-CA'),
              status: status || 'Active',
              registeredAt: registeredAt || new Date().toISOString(),
              documents: 0,
              ownerId: session.user.id
            }
          });
          
          return { 
            success: true, 
            vrn,
            id: createdVehicle.id 
          };
        } catch (error: any) {
          console.error('Error creating vehicle:', error);
          return { 
            success: false, 
            vrn: vehicle.vrn || 'Unknown',
            error: error.message || 'Failed to create vehicle' 
          };
        }
      })
    );
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return NextResponse.json({ 
      message: `Processed ${results.length} vehicles: ${successCount} added, ${failureCount} failed`,
      results
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process bulk upload',
      details: error.message 
    }, { status: 500 });
  }
}

 
 
