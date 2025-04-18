'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';

type ProfileData = {
    name: string;
    email: string;
    phone: string;
    image?: string;
    designation?: string;
    doj?: string;
    reportTo?: string;
    status?: boolean;
};

export default function AdminProfile() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<ProfileData>({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        image: '',
        designation: '',
        doj: '',
        reportTo: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.email) {
                try {
                    const response = await fetch('/api/profile');
                    if (response.ok) {
                        const userData = await response.json();
                        setFormData({
                            ...formData,
                            ...userData,
                            doj: userData.doj ? new Date(userData.doj).toISOString().split('T')[0] : '',
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [session]);

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatePromise = fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            toast.promise(updatePromise, {
                loading: 'Updating profile...',
                success: 'Profile updated successfully!',
                error: 'Could not update profile',
            });

            const response = await updatePromise;

            if (response.ok) {
                const updatedData = await response.json();
                setFormData({
                    ...formData,
                    ...updatedData,
                    doj: updatedData.doj ? new Date(updatedData.doj).toISOString().split('T')[0] : '',
                });
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: updatedData.name
                    }
                });
                router.refresh();
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }

        try {
            const changePasswordPromise = fetch('/api/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            toast.promise(changePasswordPromise, {
                loading: 'Changing password...',
                success: 'Password updated successfully!',
                error: 'Failed to update password',
            });

            const response = await changePasswordPromise;

            if (response.ok) {
                setShowPasswordModal(false);
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                toast.error('Failed to update password. Please check your old password.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
                <h1 className="text-2xl font-bold">My Profile</h1>
                <button
                    onClick={() => router.back()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Go Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="mb-8 flex flex-col items-center">
                        <div className={`relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center ${isEditing ? 'cursor-pointer group' : ''}`}
                            onClick={() => isEditing && fileInputRef.current?.click()}
                        >
                            {previewImage ? (
                                <Image
                                    src={previewImage}
                                    alt="Profile preview"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : formData.image ? (
                                <Image
                                    src={formData.image}
                                    alt="Profile picture"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <UserCircleIcon className="h-16 w-16 text-gray-400" />
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <CameraIcon className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={async (e) => {
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

                                const uploadPromise = fetch('/api/profile/upload', {
                                    method: 'POST',
                                    body: uploadFormData,
                                }).then(async (response) => {
                                    if (!response.ok) {
                                        const error = await response.text();
                                        throw new Error(error);
                                    }
                                    const { url } = await response.json();
                                    setFormData(prev => ({ ...prev, image: url }));
                                    return 'Image uploaded successfully';
                                });

                                toast.promise(uploadPromise, {
                                    loading: 'Uploading image...',
                                    success: (message) => message,
                                    error: (err) => err instanceof Error ? err.message : 'Failed to upload image'
                                });
                            }}
                        />
                        {isEditing && (
                            <>
                                {uploadError && (
                                    <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    Upload profile picture (JPEG, PNG, JPG, max 500KB)
                                </p>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled={!isEditing}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                            />
                        </div>

                        {session?.user?.isEmployee && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                                    <input
                                        type="date"
                                        name="doj"
                                        value={formData.doj}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reports To</label>
                                    <input
                                        type="text"
                                        name="reportTo"
                                        value={formData.reportTo}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        {!isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Change Password
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save Changes
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Change Password</h3>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Old Password</label>
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}