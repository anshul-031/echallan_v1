'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { User } from '@/app/types/user';

interface Company {
    id: string;
    name: string;
    status: boolean;
}

interface UserFormData extends Omit<User, 'id' | 'created_at'> {
    password?: string;
}

export default function EditUser() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        name: '',
        phone: '',
        password: '',
        address: '',
        location: '',
        dob: '',
        gender: '',
        userType: 'BASIC',
        credits: 0,
        status: true,
        companyId: '',
        image: '',
    });

    useEffect(() => {
        fetchCompanies();
        if (id) {
            fetchUser(id);
        }
    }, [id]);

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

    const fetchUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/user/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            const data: User = await response.json();

            setFormData({
                email: data.email,
                name: data.name || '',
                phone: data.phone || '',
                password: '', // Empty for security
                address: data.address || '',
                location: data.location || '',
                dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                gender: data.gender || '',
                userType: data.userType,
                credits: data.credits,
                status: data.status,
                companyId: data.companyId || '',
                image: data.image || '',
            });
        } catch (error) {
            toast.error('Failed to load user');
            console.error(error);
        } finally {
            setLoading(false);
        }
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
        uploadFormData.append('userId', id || 'temp');

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
                const response = await fetch(`/api/admin/user/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                router.push('/admin/user');
                return 'User updated successfully';
            } finally {
                setSubmitting(false);
            }
        };

        toast.promise(submitPromise(), {
            loading: 'Updating user...',
            success: (message) => message,
            error: (err) => err instanceof Error ? err.message : 'Failed to update user'
        });
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit User</h1>

                <div className="bg-white shadow-sm rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Image Upload Section */}
                        <div className="flex flex-col items-center">
                            <div
                                className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer group"
                                onClick={handleImageClick}
                            >
                                {previewImage ? (
                                    <Image
                                        src={previewImage}
                                        alt="User photo preview"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                ) : formData.image ? (
                                    <Image
                                        src={formData.image}
                                        alt="User photo"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-16 w-16 text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <CameraIcon className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleImageChange}
                            />
                            {uploadError && (
                                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                                Upload user photo (JPEG, PNG, JPG, max 500KB)
                            </p>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
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
                                <label className="block text-sm font-medium text-gray-700">Company</label>
                                <select
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
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
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.userType}
                                    onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
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
                                <label className="block text-sm font-medium text-gray-700">Credits</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.credits}
                                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={String(formData.status)}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/user')}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}