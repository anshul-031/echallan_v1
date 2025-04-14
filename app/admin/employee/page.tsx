'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { UserIcon, PlusIcon, EyeIcon, PencilIcon, XMarkIcon, CameraIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import StatusChangeModal from '@/app/components/StatusChangeModal';

import { Privileges, Employee, EmployeeFormData, defaultPrivileges } from './types';

const initialFormData: EmployeeFormData = {
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
};

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

export default function EmployeeManagement() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // Email search states
  const [searchEmail, setSearchEmail] = useState('');
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleStatusChange = async () => {
    if (!selectedEmployee) return;

    const updateStatusPromise = async () => {
      setChangingStatus(true);
      try {
        const response = await fetch(`/api/admin/employee/${selectedEmployee.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...selectedEmployee,
            status: !selectedEmployee.status
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        await fetchEmployees();
        setShowStatusModal(false);
        return 'Status updated successfully';
      } finally {
        setChangingStatus(false);
        setSelectedEmployee(null);
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
    uploadFormData.append('employeeId', 'temp');

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
        const response = await fetch('/api/admin/employee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to create employee');
        }

        await fetchEmployees();
        setFormData(initialFormData);
        setPreviewImage(null);
        setShowForm(false);
        return 'Employee created successfully';
      } finally {
        setSubmitting(false);
      }
    };

    toast.promise(submitPromise(), {
      loading: 'Creating employee...',
      success: (message) => message,
      error: (err) => err instanceof Error ? err.message : 'Failed to create employee'
    });
  };

  const fetchEmployees = async (search?: string) => {
    try {
      setLoading(true);
      const response = await fetch(search ? `/api/admin/employee?search=${search}` : '/api/admin/employee');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
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
      fetchEmployees(value);
    }, 500);
  }, []);

  const handleEmailSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchEmail(value);
      if (!value) {
        setShowSuggestions(false);
        setEmailSuggestions([]);
      } else {
        try {
          const response = await fetch(`/api/admin/employee/search-users?q=${encodeURIComponent(value)}&assigned=${encodeURIComponent(formData.assignedUsers.join(','))}`);
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
      }
    },
    [formData.assignedUsers]
  );

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchEmail && emailSuggestions.length > 0) {
      e.preventDefault();
      handleEmailSelect(emailSuggestions[0]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchEmployees();
  };

  const handlePrivilegeChange = (key: keyof Privileges, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privileges: {
        ...prev.privileges,
        [key]: value
      }
    }));
  };

  const renderPrivilegeSection = (title: string, privileges: {
    view: keyof Privileges & string;
    add: keyof Privileges & string;
    edit: keyof Privileges & string;
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="relative">
        <div className={`bg-white rounded-lg shadow-sm transition-all duration-500 ease-out transform ${showForm ? 'translate-y-[32rem] opacity-30' : 'translate-y-0 opacity-100'}`}>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Sr.No</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Image</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Name</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Contact</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Email ID</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Address</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Designation</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Role</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">View</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Edit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-4 text-center">Loading...</td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-4 text-center">No employees found</td>
                    </tr>
                  ) : (
                    employees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{index + 1}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            <div className="h-10 w-10 relative">
                              {employee.image ? (
                                <Image
                                  src={employee.image}
                                  alt={employee.name}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <UserIcon className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{employee.phone}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{employee.email}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{employee.address}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{employee.designation}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{employee.role}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowStatusModal(true);
                              }}
                              className={`w-20 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm border ${employee.status
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 hover:border-green-300'
                                : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200 hover:border-red-300'
                                }`}
                            >
                              {employee.status ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <button
                            onClick={() => router.push(`/admin/employee/view?id=${employee.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <button
                            onClick={() => router.push(`/admin/employee/edit?id=${employee.id}`)}
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

            {/* Status Change Modal */}
            <StatusChangeModal
              isOpen={showStatusModal}
              onClose={() => {
                setShowStatusModal(false);
                setSelectedEmployee(null);
              }}
              onConfirm={handleStatusChange}
              currentStatus={selectedEmployee?.status || false}
              isLoading={changingStatus}
            />
          </div>
        </div>

        {/* Form Panel */}
        <div className={`absolute inset-x-0 top-0 bg-white shadow-lg transition-all duration-500 ease-out transform origin-left ${showForm ? 'translate-x-0 scale-x-100' : '-translate-x-full scale-x-0'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Employee</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Image Upload Section */}
            <div className="mb-8 flex flex-col items-center">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              assignedUsers: prev.assignedUsers.filter(e => e !== email)
                            }))}
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
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
