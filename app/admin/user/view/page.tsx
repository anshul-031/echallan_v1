'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { User } from '@/app/types/user';

export default function ViewUser() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (id) {
            fetchUser(id);
        }
    }, [id]);

    const fetchUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();
            setUser(data);
        } catch (error) {
            toast.error('Failed to load user');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!user) {
        return <div className="p-6">User not found</div>;
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">View User</h1>
                    <button
                        onClick={() => router.push(`/admin/user/edit?id=${id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Edit User
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-6 space-y-8">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || ''}
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
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1 text-base text-gray-900">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.status ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                            <p className="mt-1 text-base text-gray-900">{user.name || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-base text-gray-900">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                            <p className="mt-1 text-base text-gray-900">{user.phone || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Company</label>
                            <p className="mt-1 text-base text-gray-900">{user.company?.name || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">User Type</label>
                            <p className="mt-1">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${user.userType === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                        user.userType === 'SUPER_USER' ? 'bg-purple-100 text-purple-800' :
                                            'bg-green-100 text-green-800'}`}>
                                    {user.userType}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Address</label>
                            <p className="mt-1 text-base text-gray-900">{user.address || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Location</label>
                            <p className="mt-1 text-base text-gray-900">{user.location || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                            <p className="mt-1 text-base text-gray-900">
                                {user.dob ? new Date(user.dob).toLocaleDateString() : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Gender</label>
                            <p className="mt-1 text-base text-gray-900">{user.gender || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Created At</label>
                            <p className="mt-1 text-base text-gray-900">
                                {new Date(user.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Credits</label>
                            <p className="mt-1 text-base text-gray-900">{user.credits}</p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => router.push('/admin/user')}
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