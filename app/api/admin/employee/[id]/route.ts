import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();
    console.log('Received data:', data);

    // Get the existing employee
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: params.id }
    });

    if (!existingEmployee) {
      return new NextResponse('Employee not found', { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      location: data.location,
      role: data.role,
      designation: data.designation,
      doj: data.doj ? new Date(data.doj) : undefined,
      reportTo: data.reportTo,
      assignedUsers: data.assignedUsers,
      status: data.status,
      image: data.image
    };
    console.log('Update data being sent to Prisma:', updateData);

    // Only update password if provided
    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update employee data
    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...updateData,
        privileges: {
          update: {
            dashboard_view: data.privileges.dashboard_view,
            dashboard_add: data.privileges.dashboard_add,
            dashboard_edit: data.privileges.dashboard_edit,
            
            customer_view: data.privileges.customer_view,
            customer_add: data.privileges.customer_add,
            customer_edit: data.privileges.customer_edit,
            
            employee_view: data.privileges.employee_view,
            employee_add: data.privileges.employee_add,
            employee_edit: data.privileges.employee_edit,
            
            user_view: data.privileges.user_view,
            user_add: data.privileges.user_add,
            user_edit: data.privileges.user_edit,
            
            vehicle_view: data.privileges.vehicle_view,
            vehicle_add: data.privileges.vehicle_add,
            vehicle_edit: data.privileges.vehicle_edit,
            
            administrator_view: data.privileges.administrator_view,
            administrator_add: data.privileges.administrator_add,
            administrator_edit: data.privileges.administrator_edit,
            
            bulk_data_access: data.privileges.bulk_data_access,
            other_options_access: data.privileges.other_options_access
          }
        }
      },
      include: {
        privileges: true
      }
    });

    console.log('Updated employee:', employee);
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error instanceof Error) {
      if ('code' in error && (error as any).code === 'P2002') {
        return new NextResponse('Employee with this email already exists', { status: 400 });
      }
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        privileges: true
      }
    });

    if (!employee) {
      return new NextResponse('Employee not found', { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!['ADMIN', 'EMPLOYEE'].includes(session.user.userType)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const employee = await prisma.employee.delete({
      where: { id: params.id }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error deleting employee:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}