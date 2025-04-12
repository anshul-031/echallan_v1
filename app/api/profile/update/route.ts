import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

type ProfileUpdateInput = {
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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data: ProfileUpdateInput = await req.json();
    const validUpdateData: Prisma.UserUpdateInput = {};

    // Only include provided fields and handle date conversions
    if (data.name !== undefined) validUpdateData.name = data.name;
    if (data.phone !== undefined) validUpdateData.phone = data.phone;
    if (data.address !== undefined) validUpdateData.address = data.address;
    if (data.gender !== undefined) validUpdateData.gender = data.gender;
    if (data.location !== undefined) validUpdateData.location = data.location;
    
    // Handle date fields
    if (data.dob) validUpdateData.dob = new Date(data.dob);

    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: validUpdateData,
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        dob: true,
        gender: true,
        location: true,
        userType: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}