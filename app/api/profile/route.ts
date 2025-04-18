import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

type ProfileUpdateData = {
  name?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  doj?: string;
  designation?: string;
  reportTo?: string;
  location?: string;
  image?: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is an employee
    if (session.user.isEmployee) {
      const employee = await prisma.employee.findUnique({
        where: {
          email: session.user.email,
        }
      });

      if (!employee) {
        return new NextResponse("Employee not found", { status: 404 });
      }

      const profileData = {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        doj: employee.doj,
        reportTo: employee.reportTo,
        image: employee.image,
        status: employee.status
      };

      return NextResponse.json(profileData);
    } else {
      // Handle regular user profile
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        }
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      const profileData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        gender: user.gender,
        location: user.location,
        userType: user.userType,
        image: user.image
      };

      return NextResponse.json(profileData);
    }
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

    // Handle employee profile update
    if (session.user.isEmployee) {
      const employee = await prisma.employee.findUnique({
        where: { email: session.user.email }
      });

      if (!employee) {
        return new NextResponse("Employee not found", { status: 404 });
      }

      // Create update data with proper Prisma types
      const employeeUpdateData: Prisma.EmployeeUpdateInput = {};

      if (updateData.name) {
        employeeUpdateData.name = updateData.name;
      }
      if (updateData.phone) {
        employeeUpdateData.phone = updateData.phone;
      }
      if (updateData.designation) {
        employeeUpdateData.designation = updateData.designation;
      }
      if (updateData.doj) {
        employeeUpdateData.doj = new Date(updateData.doj);
      }
      if (updateData.reportTo !== undefined) {
        employeeUpdateData.reportTo = updateData.reportTo;
      }
      if (updateData.image !== undefined) {
        employeeUpdateData.image = updateData.image;
      }

      const updatedEmployee = await prisma.employee.update({
        where: { email: session.user.email },
        data: employeeUpdateData
      });

      const profileData = {
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        designation: updatedEmployee.designation,
        doj: updatedEmployee.doj,
        reportTo: updatedEmployee.reportTo,
        image: updatedEmployee.image,
        status: updatedEmployee.status
      };

      return NextResponse.json(profileData);
    } else {
      // Handle regular user profile update
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Create update data with proper Prisma types
      const userUpdateData: Prisma.UserUpdateInput = {};

      if (updateData.name) {
        userUpdateData.name = updateData.name;
      }
      if (updateData.phone) {
        userUpdateData.phone = updateData.phone;
      }
      if (updateData.address) {
        userUpdateData.address = updateData.address;
      }
      if (updateData.gender) {
        userUpdateData.gender = updateData.gender;
      }
      if (updateData.location) {
        userUpdateData.location = updateData.location;
      }
      if (updateData.dob) {
        userUpdateData.dob = new Date(updateData.dob);
      }
      if (updateData.image !== undefined) {
        userUpdateData.image = updateData.image;
      }

      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: userUpdateData
      });

      const profileData = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        location: updatedUser.location,
        userType: updatedUser.userType,
        image: updatedUser.image
      };

      return NextResponse.json(profileData);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
