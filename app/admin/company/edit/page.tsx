'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BuildingOfficeIcon, XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { Company } from '@/app/types/user';

export default function EditCompany() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = searchParams.get('id');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<Company>>({});

    useEffect(() => {
        if (!companyId) {
            router.push('/admin/company');
            return;
        }
        fetchCompany();
    }, [companyId]);

    const fetchCompany = async () => {
        try {
            const response = await fetch(`/api/admin/company/${companyId}`);
            if (!response.ok) throw new Error('Failed to fetch company');
            const data = await response.json();
            setFormData(data);
            if (data.image) {
                setPreviewImage(data.image);
            }
        } catch (error) {
            toast.error('Failed to load company');
            router.push('/admin/company');
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
        uploadFormData.append('companyId', companyId || 'temp');

        const uploadPromise = async () => {
            const response = await fetch('/api/admin/company/upload', {
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
        if (!companyId || submitting) return;

        const submitPromise = async () => {
            setSubmitting(true);
            try {
                const response = await fetch(`/api/admin/company/${companyId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to update company');
                }

                router.push('/admin/company');
                return 'Company updated successfully';
            } finally {
                setSubmitting(false);
            }
        };

        toast.promise(submitPromise(), {
            loading: 'Updating company...',
            success: (message) => message,
            error: (err) => err instanceof Error ? err.message : 'Failed to update company'
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Edit Company</h2>
                        <button
                            onClick={() => router.push('/admin/company')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 flex flex-col items-center">
                        <div
                            className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer group"
                            onClick={handleImageClick}
                        >
                            {previewImage ? (
                                <Image
                                    src={previewImage}
                                    alt="Company logo preview"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : formData.image ? (
                                <Image
                                    src={formData.image}
                                    alt="Company logo"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
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
                            Upload company logo (JPEG, PNG, JPG, max 500KB)
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.ownerName || ''}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
                                <input
                                    type="tel"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.ownerPhone || ''}
                                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.contactName || ''}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                                <input
                                    type="tel"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.contactPhone || ''}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.gstin || ''}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PAN</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.pan || ''}
                                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CIN</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.cin || ''}
                                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/company')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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