'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AdminStats {
    totalUsers: number;
    totalCustomers: number;
    totalEmployees: number;
    totalVehicles: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalCustomers: 0,
        totalEmployees: 0,
        totalVehicles: 0
    });


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/dashboard');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    toast.error('Failed to fetch dashboard stats');
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Error loading dashboard stats');
            }
        };

        fetchStats();
    }, []);


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Summary Cards */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Total Users</h2>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                    <button
                        onClick={() => router.push('/admin/user')}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                        More Info
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Total Customers</h2>
                    <p className="text-3xl font-bold text-green-600">{stats.totalCustomers}</p>
                    <button
                        onClick={() => router.push('/admin/company')}
                        className="mt-4 text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                    >
                        More Info
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Total Employees</h2>
                    <p className="text-3xl font-bold text-orange-600">{stats.totalEmployees}</p>
                    <button
                        onClick={() => router.push('/admin/employee')}
                        className="mt-4 text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                    >
                        More Info
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Total Vehicles</h2>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalVehicles}</p>
                    <button
                        onClick={() => router.push('/admin/vehicles')}
                        className="mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                    >
                        More Info
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}