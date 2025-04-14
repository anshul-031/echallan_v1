import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const employees = await prisma.employee.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      include: {
        privileges: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create employee directly
    const employee = await prisma.employee.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        address: data.address,
        location: data.location,
        role: data.role,
        doj: new Date(data.doj),
        designation: data.designation,
        reportTo: data.reportTo,
        assignedUsers: data.assignedUsers || [],
        status: true,
        privileges: {
          create: {
            // Default privileges
            dashboard_view: data.privileges?.dashboard_view ?? true,
            dashboard_add: data.privileges?.dashboard_add ?? false,
            dashboard_edit: data.privileges?.dashboard_edit ?? false,
            
            customer_view: data.privileges?.customer_view ?? true,
            customer_add: data.privileges?.customer_add ?? false,
            customer_edit: data.privileges?.customer_edit ?? false,
            
            employee_view: data.privileges?.employee_view ?? false,
            employee_add: data.privileges?.employee_add ?? false,
            employee_edit: data.privileges?.employee_edit ?? false,
            
            user_view: data.privileges?.user_view ?? true,
            user_add: data.privileges?.user_add ?? false,
            user_edit: data.privileges?.user_edit ?? false,
            
            vehicle_view: data.privileges?.vehicle_view ?? true,
            vehicle_add: data.privileges?.vehicle_add ?? false,
            vehicle_edit: data.privileges?.vehicle_edit ?? false,
            
            administrator_view: data.privileges?.administrator_view ?? false,
            administrator_add: data.privileges?.administrator_add ?? false,
            administrator_edit: data.privileges?.administrator_edit ?? false,
            
            bulk_data_access: data.privileges?.bulk_data_access ?? false,
            other_options_access: data.privileges?.other_options_access ?? false
          }
        }
      },
      include: {
        privileges: true
      }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error instanceof Error) {
      if ('code' in error && (error as any).code === 'P2002') {
        return new NextResponse('Employee with this email already exists', { status: 400 });
      }
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}