import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const vehicle = await prisma.vehicle.findFirst({
            where: { id: id }
        });

        if (!vehicle) {
            return NextResponse.json(
                { error: 'Vehicle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vehicle' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const data = await request.json();

        const updatedVehicle = await prisma.vehicle.update({
            where: { id: id },
            data: {
                roadTax: data.roadTax,
                roadTaxDoc: data.roadTaxDoc,
                fitness: data.fitness,
                fitnessDoc: data.fitnessDoc,
                insurance: data.insurance,
                insuranceDoc: data.insuranceDoc,
                pollution: data.pollution,
                pollutionDoc: data.pollutionDoc,
                statePermit: data.statePermit,
                statePermitDoc: data.statePermitDoc,
                nationalPermit: data.nationalPermit,
                nationalPermitDoc: data.nationalPermitDoc,
                status: data.status,
                lastUpdated: new Date().toISOString()
            }
        });

        return NextResponse.json(updatedVehicle);
    } catch (error) {
        console.error('Error updating vehicle:', error);
        return NextResponse.json(
            { error: 'Failed to update vehicle' },
            { status: 500 }
        );
    }
}