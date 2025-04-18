import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get user by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                vehicles: {
                    select: {
                        vrn: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// Update user
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const data = await request.json();

        // Remove empty string password
        if (data.password === '') {
            delete data.password;
        }

        // Clean up the data by removing empty strings
        const updateData: any = {
            name: data.name || null,
            email: data.email,
            phone: data.phone || null,
            address: data.address || null,
            gender: data.gender || null,
            image: data.image || null,
            location: data.location || null,
            userType: data.userType,
            credits: data.credits,
            status: data.status,
            companyId: data.companyId || null,
        };

        // Only include password if it's provided
        if (data.password) {
            updateData.password = data.password;
        }

        // Only include dob if it's a valid date string
        if (data.dob && data.dob.length > 0) {
            updateData.dob = new Date(data.dob);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}