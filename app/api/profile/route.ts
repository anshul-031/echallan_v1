import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

type ProfileUpdateData = {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  dob?: string | null;
  gender?: string | null;
  doj?: string | null;
  designation?: string | null;
  reportTo?: string | null;
  location?: string | null;
  image?: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        employeeProfile: true,
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Only return the safe fields
    const profileData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      location: user.location,
      userType: user.userType,
      image: user.image,
      // Include employee fields if they exist
      doj: user.employeeProfile?.doj,
      designation: user.employeeProfile?.designation,
      reportTo: user.employeeProfile?.reportTo,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updateData: ProfileUpdateData = await req.json();
    
    // Get user with employee profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Separate user and employee data
    // Update user data first
    const userUpdateData: Prisma.UserUpdateInput = {
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.phone !== undefined && { phone: updateData.phone }),
      ...(updateData.address !== undefined && { address: updateData.address }),
      ...(updateData.gender !== undefined && { gender: updateData.gender }),
      ...(updateData.location !== undefined && { location: updateData.location }),
      ...(updateData.dob && { dob: new Date(updateData.dob) }),
      ...(updateData.image !== undefined && { image: updateData.image })
    };

    // Prepare employee data if needed
    const employeeData: Prisma.EmployeeUncheckedCreateInput = {
      userId: user.id,
      designation: updateData.designation || 'Employee',
      doj: updateData.doj ? new Date(updateData.doj) : new Date(),
      reportTo: updateData.reportTo || null
    };

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: userUpdateData,
      include: { employeeProfile: true }
    });

    // Handle employee data if any employee fields are provided
    const hasEmployeeData = updateData.designation || updateData.doj || updateData.reportTo;
    
    if (hasEmployeeData) {
      if (user.employeeProfile) {
        // Update existing employee profile
        await prisma.employee.update({
          where: { userId: user.id },
          data: {
            ...(updateData.designation && { designation: updateData.designation }),
            ...(updateData.doj && { doj: new Date(updateData.doj) }),
            ...(updateData.reportTo !== undefined && { reportTo: updateData.reportTo })
          }
        });
      } else {
        // Create new employee profile if designation is provided
        if (updateData.designation) {
          await prisma.employee.create({
            data: employeeData
          });
        }
      }
    }

    // Fetch updated user data with employee profile
    const finalUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employeeProfile: true }
    });

    if (!finalUser) {
      return new NextResponse("Error retrieving updated profile", { status: 500 });
    }

    const profileData = {
      name: finalUser.name,
      email: finalUser.email,
      phone: finalUser.phone,
      address: finalUser.address,
      dob: finalUser.dob,
      gender: finalUser.gender,
      location: finalUser.location,
      userType: finalUser.userType,
      image: finalUser.image,
      doj: finalUser.employeeProfile?.doj,
      designation: finalUser.employeeProfile?.designation,
      reportTo: finalUser.employeeProfile?.reportTo,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
