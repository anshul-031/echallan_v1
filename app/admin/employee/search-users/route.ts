import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    // Get session to ensure request is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the search query and assigned users from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const assignedUsers = searchParams.get("assigned")?.split(",").filter(Boolean) || [];

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    // Search for users with email containing the query string
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            email: {
              contains: query,
              mode: "insensitive", // Case insensitive search
            }
          },
          {
            email: {
              notIn: assignedUsers // Exclude already assigned users
            }
          }
        ]
      },
      select: {
        email: true
      },
      take: 10 // Limit results to 10 users
    });

    return NextResponse.json({
      users: users.map((user) => user.email),
      hasResults: users.length > 0
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}