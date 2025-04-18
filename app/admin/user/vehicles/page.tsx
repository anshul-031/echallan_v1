'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TruckIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Vehicle {
    id: number;
    vrn: string;
    roadTax: string;
    fitness: string;
    insurance: string;
    pollution: string;
    statePermit: string;
    nationalPermit: string;
    status: string;
    registeredAt: string;
    lastUpdated: string;
}

export default function UserVehicles() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [userDetails, setUserDetails] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        if (userId) {
            fetchUserVehicles();
        }
    }, [userId]);

    const fetchUserVehicles = async () => {
        try {
            const [vehiclesResponse, userResponse] = await Promise.all([
                fetch(`/api/admin/user/${userId}/vehicles`),
                fetch(`/api/admin/user/${userId}`),
            ]);

            if (!vehiclesResponse.ok || !userResponse.ok)
                throw new Error('Failed to fetch data');

            const vehiclesData = await vehiclesResponse.json();
            const userData = await userResponse.json();

            setVehicles(vehiclesData);
            setUserDetails({
                name: userData.name || 'N/A',
                email: userData.email,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin/user')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Users
                    </button>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-4">User Vehicles</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-base font-medium">{userDetails?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-base font-medium">{userDetails?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Vehicle Count Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <TruckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500">Total Vehicles</h2>
                            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                        </div>
                    </div>
                </div>

                {/* Vehicles Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        VRN
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Road Tax
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fitness
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Insurance
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pollution
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        View
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Edit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                                            No vehicles found
                                        </td>
                                    </tr>
                                ) : (
                                    vehicles.map((vehicle) => (
                                        <tr key={vehicle.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {vehicle.vrn}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vehicle.roadTax}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vehicle.fitness}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vehicle.insurance}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vehicle.pollution}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                <button
                                                    onClick={() => router.push(`/admin/user/vehicles/view?id=${vehicle.id}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                <button
                                                    onClick={() => router.push(`/admin/user/vehicles/edit?id=${vehicle.id}`)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
