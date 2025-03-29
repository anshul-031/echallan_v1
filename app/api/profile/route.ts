import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type DocumentCounts = {
  expiring_count: number;
  expired_count: number;
};

// Helper function to calculate expiring/expired document counts
async function calculateDocumentCounts(userId: string): Promise<DocumentCounts> {
  try {
    // Get user's vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ownerId: userId
      }
    });
    
    let expiring_count = 0;
    let expired_count = 0;
    
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);
    
    vehicles.forEach(vehicle => {
      // Check each document date
      const documents = [
        { label: 'Road Tax', date: vehicle.roadTax },
        { label: 'Fitness', date: vehicle.fitness },
        { label: 'Insurance', date: vehicle.insurance },
        { label: 'Pollution', date: vehicle.pollution },
        { label: 'State Permit', date: vehicle.statePermit },
        { label: 'National Permit', date: vehicle.nationalPermit }
      ];
      
      documents.forEach(doc => {
        if (!doc.date) return;
        
        try {
          // Parse the date (assuming format is DD-MM-YYYY)
          const parts = doc.date.split('-');
          if (parts.length !== 3) return;
          
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
          const year = parseInt(parts[2], 10);
          
          const documentDate = new Date(year, month, day);
          
          // Skip invalid dates
          if (isNaN(documentDate.getTime())) return;
          
          // Check if expired
          if (documentDate < currentDate) {
            expired_count++;
          } 
          // Check if expiring soon
          else if (documentDate <= thirtyDaysFromNow) {
            expiring_count++;
          }
        } catch (err) {
          // Skip this document if date parsing fails
          console.error(`Error parsing date for ${doc.label}: ${doc.date}`);
        }
      });
    });
    
    return { expiring_count, expired_count };
  } catch (error) {
    console.error('Error calculating document counts:', error);
    return { expiring_count: 0, expired_count: 0 };
  }
}

type ProfileData = {
  id: string;
  email: string;
  name: string | null;
  role: string;
credits: number; // Add this field
  expiring_documents: number;
  expired_documents: number;
  joinDate: string;
};

// GET handler to fetch user profile data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: User not logged in' }, { status: 401 });
    }

    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized: Invalid user session' }, { status: 401 });
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail as string,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
credits: true, // Add this field
          created_at: true,
          updated_at: true,
        },
      });

      if (!user) {
        // If database user not found but session exists, return session data
        const fallbackData: ProfileData = {
          id: session.user.id || 'unknown',
          email: session.user.email,
          name: session.user.name || '',
          role: session.user.role || 'user',
credits: 0, // Add this field
          joinDate: 'Unknown',
          expiring_documents: 0,
          expired_documents: 0,
        };
        return NextResponse.json(fallbackData);
      }

      // Calculate document counts from vehicles
      const { expiring_count, expired_count } = await calculateDocumentCounts(user.id);

      // Format dates and prepare response
      const userData: ProfileData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
credits: user.credits, // Add this field
        expiring_documents: expiring_count,
        expired_documents: expired_count,
        joinDate: user.created_at?.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) || 'Unknown',
      };

      return NextResponse.json(userData);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Return session data as fallback
      const fallbackData: ProfileData = {
        id: session.user.id || 'unknown',
        email: session.user.email,
        name: session.user.name || '',
        role: session.user.role || 'user',
credits: 0, // Add this field
        joinDate: 'Unknown',
        expiring_documents: 0,
        expired_documents: 0,
      };
      return NextResponse.json(fallbackData);
    }
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH handler to update user profile
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userEmail = session.user.email;

    // Validate data
    if (data.email && data.email !== userEmail) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        email: userEmail as string,
      },
      data: {
        name: data.name,
        email: data.email,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Calculate document counts from vehicles
    const { expiring_count, expired_count } = await calculateDocumentCounts(updatedUser.id);

    const responseData: ProfileData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
credits: 0, // Add this field
      expiring_documents: expiring_count,
      expired_documents: expired_count,
      joinDate: updatedUser.created_at.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 
  