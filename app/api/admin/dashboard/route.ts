import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get admin stats
    let adminStats = await prisma.adminStats.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!adminStats) {
      // Calculate stats
      const [totalUsers, totalCustomers, totalEmployees, totalVehicles] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { userType: 'EMPLOYEE' }
        }),
        prisma.user.count({
          where: { userType: 'EMPLOYEE' }
        }),
        prisma.vehicle.count()
      ]);

      // Create new stats
      adminStats = await prisma.adminStats.create({
        data: {
          totalUsers,
          totalCustomers,
          totalEmployees,
          totalVehicles
        }
      });
    }

    return NextResponse.json(adminStats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Update stats periodically
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Calculate new stats
    const [totalUsers, totalCustomers, totalEmployees, totalVehicles] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { userType: 'EMPLOYEE' }
      }),
      prisma.user.count({
        where: { userType: 'EMPLOYEE' }
      }),
      prisma.vehicle.count()
    ]);

    // Update stats
    const updatedStats = await prisma.adminStats.create({
      data: {
        totalUsers,
        totalCustomers,
        totalEmployees,
        totalVehicles
      }
    });

    return NextResponse.json(updatedStats);
  } catch (error) {
    console.error("Error updating admin stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}