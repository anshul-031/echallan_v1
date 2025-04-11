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
      doj: user.doj,
      designation: user.designation,
      reportTo: user.reportTo,
      location: user.location,
      userType: user.userType,
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
    const validUpdateData: Prisma.UserUpdateInput = {};

    // Only include provided fields and handle date conversions
    if (updateData.name !== undefined) validUpdateData.name = updateData.name;
    if (updateData.phone !== undefined) validUpdateData.phone = updateData.phone;
    if (updateData.address !== undefined) validUpdateData.address = updateData.address;
    if (updateData.gender !== undefined) validUpdateData.gender = updateData.gender;
    if (updateData.designation !== undefined) validUpdateData.designation = updateData.designation;
    if (updateData.reportTo !== undefined) validUpdateData.reportTo = updateData.reportTo;
    if (updateData.location !== undefined) validUpdateData.location = updateData.location;
    
    // Handle date fields
    if (updateData.dob) validUpdateData.dob = new Date(updateData.dob);
    if (updateData.doj) validUpdateData.doj = new Date(updateData.doj);

    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: validUpdateData,
    });

    const profileData = {
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      dob: updatedUser.dob,
      gender: updatedUser.gender,
      doj: updatedUser.doj,
      designation: updatedUser.designation,
      reportTo: updatedUser.reportTo,
      location: updatedUser.location,
      userType: updatedUser.userType,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
