'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { UserIcon, PlusIcon, EyeIcon, PencilIcon, XMarkIcon, MagnifyingGlassIcon, TruckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import StatusChangeModal from '@/app/components/StatusChangeModal';

interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    address?: string;
    dob?: string;
    gender?: string;
    image?: string;
    location?: string;
    userType: string;
    credits: number;
    companyId?: string;
    created_at: string;
    status: boolean;
    company?: {
        name: string;
    };
    vehicles?: { vrn: string }[];
}

interface UserFormData {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    dob: string;
    gender: string;
    image: string;
    location: string;
    userType: string;
    companyId: string;
    status: boolean;
}

const initialFormData: UserFormData = {
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    dob: '',
    gender: '',
    image: '',
    location: '',
    userType: 'BASIC',
    companyId: '',
    status: true
};

interface Company {
    id: string;
    name: string;
    status: boolean;
}

export default function UserManagement() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [changingStatus, setChangingStatus] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout>();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/admin/company');
            if (!response.ok) throw new Error('Failed to fetch companies');
            const data = await response.json();
            // Filter only active companies
            setCompanies(data.filter((company: Company) => company.status));
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to load companies');
        }
    };

    const handleStatusChange = async () => {
        if (!selectedUser) return;

        const updateStatusPromise = async () => {
            setChangingStatus(true);
            try {
                const response = await fetch(`/api/admin/user/${selectedUser.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: !selectedUser.status
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update status');
                }

                // Update local state instead of fetching all users again
                setUsers(users.map(user =>
                    user.id === selectedUser.id
                        ? { ...user, status: !user.status }
                        : user
                ));

                setShowStatusModal(false);
                return 'Status updated successfully';
            } finally {
                setChangingStatus(false);
                setSelectedUser(null);
            }
        };

        toast.promise(updateStatusPromise(), {
            loading: 'Updating status...',
            success: (message) => message,
            error: 'Failed to update status'
        });
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            setUploadError('Image size should be less than 500KB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            setUploadError('Only JPEG, JPG and PNG files are allowed');
            return;
        }

        setUploadError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('userId', 'temp');

        const uploadPromise = async () => {
            const response = await fetch('/api/admin/user/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const { url } = await response.json();
            setFormData(prev => ({ ...prev, image: url }));
            return 'Image uploaded successfully';
        };

        toast.promise(uploadPromise(), {
            loading: 'Uploading image...',
            success: (message) => message,
            error: (err) => err instanceof Error ? err.message : 'Failed to upload image'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const submitPromise = async () => {
            setSubmitting(true);
            try {
                const response = await fetch('/api/admin/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to create user');
                }

                await fetchUsers();
                setFormData(initialFormData);
                setPreviewImage(null);
                setShowForm(false);
                return 'User created successfully';
            } finally {
                setSubmitting(false);
            }
        };

        toast.promise(submitPromise(), {
            loading: 'Creating user...',
            success: (message) => message,
            error: (err) => err instanceof Error ? err.message : 'Failed to create user'
        });
    };

    const fetchUsers = async (search?: string) => {
        try {
            setLoading(true);
            const response = await fetch(search ? `/api/admin/user?search=${search}` : '/api/admin/user');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const handleSearch = useCallback((value: string) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        setSearchQuery(value);
        setSearching(true);

        searchTimeout.current = setTimeout(() => {
            fetchUsers(value);
        }, 500);
    }, []);

    const clearSearch = () => {
        setSearchQuery('');
        fetchUsers();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add User
                </button>
            </div>

            <div className="relative">
                {/* Table Panel */}
                <div className={`bg-white rounded-lg shadow-sm transition-all duration-500 ease-out transform ${showForm ? 'translate-y-[25rem] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                    <div className="p-6">
                        {/* Search Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                                    />
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Sl.No.
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Company Name
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Image
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Username
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Mobile
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Gender
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Created
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Vehicles
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            View
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                            Edit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={13} className="px-6 py-4 text-center">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={13} className="px-6 py-4 text-center">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {user.company?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="h-12 w-12 relative">
                                                        {user.image ? (
                                                            <Image
                                                                src={user.image}
                                                                alt={user.name || ''}
                                                                fill
                                                                className="rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserIcon className="h-10 w-10 text-gray-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-center font-medium text-gray-900">{user.name || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {user.phone || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {user.gender?.toUpperCase() || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${user.userType === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                                            user.userType === 'SUPER_USER' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-green-100 text-green-800'}`}>
                                                        {user.userType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    <button
                                                        onClick={() => router.push(`/admin/user/vehicles?id=${user.id}`)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm border bg-blue-600 text-white hover:bg-blue-700 border-blue-500"
                                                    >
                                                        <TruckIcon className="h-4 w-4 mr-1" />
                                                        <span>{user.vehicles?.length || 0}</span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm border ${user.status
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                                                            }`}
                                                    >
                                                        {user.status ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium ">
                                                    <button
                                                        onClick={() => router.push(`/admin/user/view?id=${user.id}`)}
                                                        className="text-blue-600 hover:text-blue-900 inline-block"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm  font-medium text-center">
                                                    <button
                                                        onClick={() => router.push(`/admin/user/edit?id=${user.id}`)}
                                                        className="text-green-600 hover:text-green-900 inline-block"
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

                {/* Form Panel */}
                {/* Form Panel */}
                <div className={`absolute inset-x-0 top-0 bg-white rounded-lg shadow-lg transition-all duration-500 ease-out transform ${showForm ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Add New User</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company</label>
                                    <select
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.companyId}
                                        onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                                    <select
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                        required
                                    >
                                        <option value="BASIC">Basic</option>
                                        <option value="CAB">Cab</option>
                                        <option value="EV">EV</option>
                                        <option value="CHALLAN">Challan</option>
                                        <option value="FLEET">Fleet</option>
                                        <option value="SUPER_USER">Super User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                >
                                    {submitting ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <StatusChangeModal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleStatusChange}
                isLoading={changingStatus}
                currentStatus={selectedUser?.status || false}
            />
        </div>
    );
}
