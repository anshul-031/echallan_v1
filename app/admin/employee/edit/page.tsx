'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Employee, EmployeeFormData, defaultPrivileges } from '../types';
import debounce from 'lodash/debounce';

const PrivilegeCheckbox = ({
    label,
    checked,
    onChange
}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) => (
    <label className="flex items-center space-x-3">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

export default function EditEmployee() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<EmployeeFormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        location: '',
        role: '',
        designation: '',
        doj: '',
        reportTo: '',
        assignedUsers: [],
        image: '',
        privileges: defaultPrivileges
    });

    const [submitting, setSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New state for email search functionality
    const [searchEmail, setSearchEmail] = useState('');
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasSearchResults, setHasSearchResults] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEmployee(id);
        }
    }, [id]);

    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query) {
                setEmailSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const assigned = formData.assignedUsers.join(',');
                const response = await fetch(
                    `/api/admin/employee/search-users?q=${encodeURIComponent(query)}&assigned=${encodeURIComponent(assigned)}`
                );
                if (!response.ok) throw new Error('Failed to fetch suggestions');
                const data = await response.json();
                setEmailSuggestions(data.users);
                setHasSearchResults(data.hasResults);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setEmailSuggestions([]);
                setHasSearchResults(false);
            }
        }, 300),
        [formData.assignedUsers]
    );

    const handleEmailSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchEmail(value);
        if (!value) {
            setShowSuggestions(false);
            setEmailSuggestions([]);
        } else {
            debouncedSearch(value);
        }
    };

    const handleEmailSelect = (email: string) => {
        if (!formData.assignedUsers.includes(email)) {
            setFormData(prev => ({
                ...prev,
                assignedUsers: [...prev.assignedUsers, email]
            }));
        }
        setSearchEmail('');
        setShowSuggestions(false);
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            assignedUsers: prev.assignedUsers.filter(email => email !== emailToRemove)
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchEmail && emailSuggestions.length > 0) {
            e.preventDefault();
            handleEmailSelect(emailSuggestions[0]);
        }
    };

    const fetchEmployee = async (employeeId: string) => {
        try {
            const response = await fetch(`/api/admin/employee/${employeeId}`);
            if (!response.ok) throw new Error('Failed to fetch employee');
            const data: Employee = await response.json();
            console.log('Fetched employee data:', data);

            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: '', // Empty for security
                address: data.address,
                location: data.location,
                role: data.role,
                designation: data.designation,
                doj: new Date(data.doj).toISOString().split('T')[0],
                reportTo: data.reportTo || '',
                assignedUsers: data.assignedUsers || [],
                image: data.image || '',
                privileges: data.privileges
            });
        } catch (error) {
            toast.error('Failed to load employee');
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
        uploadFormData.append('employeeId', id || 'temp');

        const uploadPromise = async () => {
            const response = await fetch('/api/admin/employee/upload', {
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
                console.log('Submitting data:', formData);
                const response = await fetch(`/api/admin/employee/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                const responseData = await response.json();
                console.log('Response:', responseData);

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || 'Failed to update employee');
                }

                router.push('/admin/employee');
                return 'Employee updated successfully';
            } finally {
                setSubmitting(false);
            }
        };

        toast.promise(submitPromise(), {
            loading: 'Updating employee...',
            success: (message) => message,
            error: (err) => err instanceof Error ? err.message : 'Failed to update employee'
        });
    };

    const handlePrivilegeChange = (key: keyof typeof defaultPrivileges, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            privileges: {
                ...prev.privileges,
                [key]: value
            }
        }));
    };

    const renderPrivilegeSection = (title: string, privileges: {
        view: keyof typeof defaultPrivileges;
        add: keyof typeof defaultPrivileges;
        edit: keyof typeof defaultPrivileges;
    }) => (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{title}</h4>
            <div className="space-y-2">
                <PrivilegeCheckbox
                    label="View"
                    checked={formData.privileges[privileges.view]}
                    onChange={(value) => handlePrivilegeChange(privileges.view, value)}
                />
                <PrivilegeCheckbox
                    label="Add"
                    checked={formData.privileges[privileges.add]}
                    onChange={(value) => handlePrivilegeChange(privileges.add, value)}
                />
                <PrivilegeCheckbox
                    label="Edit"
                    checked={formData.privileges[privileges.edit]}
                    onChange={(value) => handlePrivilegeChange(privileges.edit, value)}
                />
            </div>
        </div>
    );

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Employee</h1>

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
                                        alt="Employee photo preview"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                ) : formData.image ? (
                                    <Image
                                        src={formData.image}
                                        alt="Employee photo"
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
                                Upload employee photo (JPEG, PNG, JPG, max 500KB)
                            </p>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
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
                                    required
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
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Joining</label>
                                <input
                                    type="date"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.doj}
                                    onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reports To</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                                    value={formData.reportTo}
                                    onChange={(e) => setFormData({ ...formData, reportTo: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Users</label>
                                <div className="mt-1 border-2 border-gray-300 rounded-md focus-within:border-blue-500 hover:border-gray-400">
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {formData.assignedUsers.map((email) => (
                                            <div
                                                key={email}
                                                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                                            >
                                                <span>{email}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEmail(email)}
                                                    className="text-blue-600 hover:text-blue-800 ml-1"
                                                >
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            type="text"
                                            value={searchEmail}
                                            onChange={handleEmailSearch}
                                            onKeyDown={handleKeyDown}
                                            onFocus={() => setShowSuggestions(Boolean(searchEmail))}
                                            placeholder="Type to search users..."
                                            className="flex-1 min-w-[200px] outline-none focus:outline-none border-0 p-2 text-sm"
                                        />
                                    </div>
                                </div>
                                {showSuggestions && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <ul className="py-1 max-h-60 overflow-auto">
                                            {emailSuggestions.length > 0 ? (
                                                emailSuggestions.map((email) => (
                                                    <li
                                                        key={email}
                                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                                                        onClick={() => handleEmailSelect(email)}
                                                    >
                                                        {email}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="px-4 py-2 text-sm text-gray-500">
                                                    No users found
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Privileges Section */}
                        <div className="mt-8">
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
                                        <PrivilegeCheckbox
                                            label="Bulk Data Master"
                                            checked={formData.privileges.bulk_data_access}
                                            onChange={(value) => handlePrivilegeChange('bulk_data_access', value)}
                                        />
                                        <PrivilegeCheckbox
                                            label="Other Options Master"
                                            checked={formData.privileges.other_options_access}
                                            onChange={(value) => handlePrivilegeChange('other_options_access', value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/employee')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? 'Updating...' : 'Update Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}