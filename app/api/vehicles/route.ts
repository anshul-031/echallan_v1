// app/api/vehicles/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Initialize Prisma client
const prisma = new PrismaClient();
// const session = await getSession()

// GET handler to fetch all vehicles
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany();
    return NextResponse.json(vehicles, { status: 200 });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json([], { status: 500 });
  }
}