import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                vehicles: {
                    select: {
                        id: true,
                        vrn: true,
                        roadTax: true,
                        fitness: true,
                        insurance: true,
                        pollution: true,
                        statePermit: true,
                        nationalPermit: true,
                        status: true,
                        registeredAt: true,
                        lastUpdated: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user.vehicles);
    } catch (error) {
        console.error('Error fetching user vehicles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user vehicles' },
            { status: 500 }
        );
    }
}