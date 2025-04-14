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

    // Calculate stats directly
    const [totalUsers, totalCustomers, totalEmployees, totalVehicles] = await Promise.all([
      prisma.user.count({
        where: {
          NOT: {
            userType: {
              in: ['ADMIN', 'EMPLOYEE']
            }
          }
        }
      }),
      prisma.company.count(),
      prisma.employee.count(),
      prisma.vehicle.count()
    ]);

    return NextResponse.json({
      totalUsers,
      totalCustomers,
      totalEmployees,
      totalVehicles,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
