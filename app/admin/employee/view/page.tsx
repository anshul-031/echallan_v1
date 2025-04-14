'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Employee, defaultPrivileges } from '../types';

const PrivilegeIndicator = ({
    label,
    enabled
}: {
    label: string;
    enabled: boolean;
}) => (
    <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-700">{label}</span>
    </div>
);

export default function ViewEmployee() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        if (id) {
            fetchEmployee(id);
        }
    }, [id]);

    const fetchEmployee = async (employeeId: string) => {
        try {
            const response = await fetch(`/api/admin/employee/${employeeId}`);
            if (!response.ok) throw new Error('Failed to fetch employee');
            const data = await response.json();
            setEmployee(data);
        } catch (error) {
            toast.error('Failed to load employee');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderPrivilegeSection = (title: string, privileges: {
        view: keyof typeof defaultPrivileges;
        add: keyof typeof defaultPrivileges;
        edit: keyof typeof defaultPrivileges;
    }) => (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <div className="space-y-2">
                <PrivilegeIndicator
                    label="View"
                    enabled={employee?.privileges[privileges.view] || false}
                />
                <PrivilegeIndicator
                    label="Add"
                    enabled={employee?.privileges[privileges.add] || false}
                />
                <PrivilegeIndicator
                    label="Edit"
                    enabled={employee?.privileges[privileges.edit] || false}
                />
            </div>
        </div>
    );

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!employee) {
        return <div className="p-6">Employee not found</div>;
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">View Employee</h1>
                    <button
                        onClick={() => router.push(`/admin/employee/edit?id=${id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Edit Employee
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-6 space-y-8">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                            {employee.image ? (
                                <Image
                                    src={employee.image}
                                    alt={employee.name}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-16 w-16 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                            <p className="mt-1 text-base text-gray-900">{employee.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-base text-gray-900">{employee.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                            <p className="mt-1 text-base text-gray-900">{employee.phone}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Designation</label>
                            <p className="mt-1 text-base text-gray-900">{employee.designation}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date of Joining</label>
                            <p className="mt-1 text-base text-gray-900">
                                {new Date(employee.doj).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Reports To</label>
                            <p className="mt-1 text-base text-gray-900">{employee.reportTo || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1 text-base text-gray-900">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {employee.status ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Assigned Users Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Users</h3>
                        {employee.assignedUsers && employee.assignedUsers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {employee.assignedUsers.map((email) => (
                                    <div
                                        key={email}
                                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                                    >
                                        {email}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No users assigned</p>
                        )}
                    </div>

                    {/* Privileges Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Privileges</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderPrivilegeSection('Dashboard', {
                                view: 'dashboard_view',
                                add: 'dashboard_add',
                                edit: 'dashboard_edit'
                            })}
                            {renderPrivilegeSection('Customer Master', {
                                view: 'customer_view',
                                add: 'customer_add',
                                edit: 'customer_edit'
                            })}
                            {renderPrivilegeSection('Employee Master', {
                                view: 'employee_view',
                                add: 'employee_add',
                                edit: 'employee_edit'
                            })}
                            {renderPrivilegeSection('User Master', {
                                view: 'user_view',
                                add: 'user_add',
                                edit: 'user_edit'
                            })}
                            {renderPrivilegeSection('Vehicle Master', {
                                view: 'vehicle_view',
                                add: 'vehicle_add',
                                edit: 'vehicle_edit'
                            })}
                            {renderPrivilegeSection('Administrator Master', {
                                view: 'administrator_view',
                                add: 'administrator_add',
                                edit: 'administrator_edit'
                            })}

                            {/* Other Privileges */}
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900">Other Access</h4>
                                <div className="space-y-2">
                                    <PrivilegeIndicator
                                        label="Bulk Data Master"
                                        enabled={employee.privileges.bulk_data_access}
                                    />
                                    <PrivilegeIndicator
                                        label="Other Options Master"
                                        enabled={employee.privileges.other_options_access}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => router.push('/admin/employee')}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}