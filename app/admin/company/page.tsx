'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { BuildingOfficeIcon, PlusIcon, EyeIcon, PencilIcon, XMarkIcon, CameraIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import StatusChangeModal from '@/app/components/StatusChangeModal';

interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  contactName: string;
  contactPhone: string;
  status: boolean;
  image?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
}

interface CompanyFormData {
  name: string;
  email: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  contactName: string;
  contactPhone: string;
  image?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
}

const initialFormData: CompanyFormData = {
  name: '',
  email: '',
  address: '',
  ownerName: '',
  ownerPhone: '',
  contactName: '',
  contactPhone: '',
  image: '',
  gstin: '',
  pan: '',
  cin: ''
};

export default function CompanyManagement() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatusChange = async () => {
    if (!selectedCompany) return;

    const updateStatusPromise = async () => {
      setChangingStatus(true);
      try {
        const response = await fetch(`/api/admin/company/${selectedCompany.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...selectedCompany,
            status: !selectedCompany.status
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        await fetchCompanies();
        setShowStatusModal(false);
        return 'Status updated successfully';
      } finally {
        setChangingStatus(false);
        setSelectedCompany(null);
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

    // Validate file size (500KB)
    if (file.size > 500 * 1024) {
      setUploadError('Image size should be less than 500KB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setUploadError('Only JPEG, JPG and PNG files are allowed');
      return;
    }

    setUploadError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('companyId', 'temp');

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
    if (submitting) return;

    const submitPromise = async () => {
      setSubmitting(true);
      try {
        const response = await fetch('/api/admin/company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to create company');
        }

        await fetchCompanies();
        setFormData(initialFormData);
        setPreviewImage(null);
        setShowForm(false);
        return 'Company created successfully';
      } finally {
        setSubmitting(false);
      }
    };

    toast.promise(submitPromise(), {
      loading: 'Creating company...',
      success: (message) => message,
      error: (err) => err instanceof Error ? err.message : 'Failed to create company'
    });
  };

  const fetchCompanies = async (search?: string) => {
    try {
      setLoading(true);
      const response = await fetch(search ? `/api/admin/company?search=${search}` : '/api/admin/company');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      toast.error('Failed to load companies');
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
      fetchCompanies(value);
    }, 500);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    fetchCompanies();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Company Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Company
        </button>
      </div>

      <div className="relative">
        <div className={`bg-white rounded-lg shadow-sm transition-all duration-500 ease-out transform ${showForm ? 'translate-y-[32rem] opacity-30' : 'translate-y-0 opacity-100'
          }`}>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search companies..."
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      View
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : companies.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-4 text-center">
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    companies.map((company, index) => (
                      <tr key={company.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 relative">
                            {company.image ? (
                              <Image
                                src={company.image}
                                alt={company.name}
                                fill
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.ownerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.ownerPhone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.contactName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.contactPhone}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {company.status ? 'Active' : 'Inactive'}
                          </span>
                        </td> */}

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowStatusModal(true);
                            }}
                            className={`w-20 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm border ${company.status
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 hover:border-green-300'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200 hover:border-red-300'
                              }`}
                          >
                            {company.status ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <button
                            onClick={() => router.push(`/admin/company/view?id=${company.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <button
                            onClick={() => router.push(`/admin/company/edit?id=${company.id}`)}
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

        {/* Form Panel */}
        <div className={`absolute inset-x-0 top-0 bg-white shadow-lg transition-all duration-500 ease-out transform origin-left ${showForm ? 'translate-x-0 scale-x-100' : '-translate-x-full scale-x-0'
          }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Company</h2>
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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PAN</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CIN</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedCompany(null);
        }}
        onConfirm={handleStatusChange}
        currentStatus={selectedCompany?.status || false}
        isLoading={changingStatus}
      />
    </div>
  );
}