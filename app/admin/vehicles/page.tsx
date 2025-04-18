'use client';

import { useState, useEffect } from 'react';
import {
  DocumentChartBarIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import AssignConfirmModal from '@/app/components/AssignConfirmModal';

interface RenewalService {
  id: string;
  services: string | null;
  vehicle_no: string | null;
  vehicleId: string | null;
  userId: string | null;
  isAssignedService: boolean;
  user: {
    name: string | null;
    company: {
      name: string | null;
    } | null;
  } | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface VehicleFormData {
  vrn: string;
  roadTax: string;
  roadTaxDoc: string;
  fitness: string;
  fitnessDoc: string;
  insurance: string;
  insuranceDoc: string;
  pollution: string;
  pollutionDoc: string;
  statePermit: string;
  statePermitDoc: string;
  nationalPermit: string;
  nationalPermitDoc: string;
  status: string;
  ownerId: string;
  lastUpdated: string;
  registeredAt: string;
  documents: number;
}

const initialFormData: VehicleFormData = {
  vrn: '',
  roadTax: '',
  roadTaxDoc: '',
  fitness: '',
  fitnessDoc: '',
  insurance: '',
  insuranceDoc: '',
  pollution: '',
  pollutionDoc: '',
  statePermit: '',
  statePermitDoc: '',
  nationalPermit: '',
  nationalPermitDoc: '',
  status: 'Active',
  ownerId: '',
  lastUpdated: new Date().toISOString(),
  registeredAt: new Date().toISOString(),
  documents: 0
};

export default function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<RenewalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/user');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load users');
    }
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    // Ensure vehicle exists before allowing uploads
    if (!formData.vrn) {
      toast.error('Please save the vehicle details first');
      return;
    }

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    // Create vehicle first if not exists
    try {
      const checkVehicle = await fetch(`/api/vehicles?vrn=${formData.vrn}`);
      const vehicleData = await checkVehicle.json();

      if (!vehicleData || vehicleData.length === 0) {
        toast.error('Please save the vehicle details before uploading documents');
        return;
      }
    } catch (error) {
      console.error('Error checking vehicle:', error);
      toast.error('Failed to verify vehicle. Please try saving the details first.');
      return;
    }


    const uploadPromise = async () => {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('vrn', formData.vrn || '');
      // Convert fieldName to proper document type name as expected by the API
      const docType = fieldName === 'roadTax'
        ? 'Road Tax'
        : fieldName === 'statePermit'
          ? 'Permit'
          : fieldName === 'nationalPermit'
            ? 'National Permit'
            : fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      console.log('Uploading file:', {
        fieldName,
        docType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        vrn: formData.vrn
      });

      uploadData.append('docType', docType);

      const response = await fetch('/api/documents?newVehicle=true', {
        method: 'POST',
        body: uploadData
      });

      const data = await response.json();
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        });
        throw new Error(`Upload failed: ${responseText}`);
      }

      if (!data.success) {
        console.error('Upload error:', data.error);
        throw new Error(data.error || 'Upload failed');
      }

      setFormData(prev => ({
        ...prev,
        [fieldName + 'Doc']: data.url
      }));

      return 'File uploaded successfully';
    };

    toast.promise(uploadPromise(), {
      loading: 'Uploading file...',
      success: (message) => message,
      error: 'Failed to upload file'
    });
  };


  function formatDateToDDMMYYYY(stringDate: string) {

    const formatedDate = new Date(stringDate);
    return `${formatedDate.getDate().toString().padStart(2, '0')}-${(formatedDate.getMonth() + 1).toString().padStart(2, '0')}-${formatedDate.getFullYear()}`;
  }
  // Function to format date string to DD-MMM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).split(' ').join('-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validate required fields
    if (!formData.vrn) {
      toast.error('Vehicle Registration Number (VRN) is required');
      return;
    }

    if (!formData.ownerId) {
      toast.error('Please select a user');
      return;
    }

    const submitPromise = async () => {
      setSubmitting(true);
      try {
        // Format all date fields before sending
        const formattedData = {
          ...formData,
          lastUpdated: new Date().toISOString().split('T')[0],
          registeredAt: new Date().toISOString(),
          roadTax: formatDateToDDMMYYYY(formData.roadTax),
          fitness: formatDate(formData.fitness),
          insurance: formatDate(formData.insurance),
          pollution: formatDate(formData.pollution),
          statePermit: formatDate(formData.statePermit),
          nationalPermit: formatDate(formData.nationalPermit)
        };

        const response = await fetch('/api/admin/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to create vehicle');
        }

        await fetchVehicles();
        setFormData(initialFormData);
        setShowForm(false);
        return 'Vehicle created successfully';
      } finally {
        setSubmitting(false);
      }
    };

    toast.promise(submitPromise(), {
      loading: 'Creating vehicle...',
      success: (message) => message,
      error: (err) => err instanceof Error ? err.message : 'Failed to create vehicle'
    });
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowAssignModal(true);
  };

  const confirmAssign = async () => {
    if (!selectedServiceId) return;

    try {
      const response = await fetch('/api/admin/vehicles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId: selectedServiceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign service');
      }

      await fetchVehicles();
      toast.success('Service assigned successfully');
    } catch (error) {
      toast.error('Failed to assign service');
    } finally {
      setShowAssignModal(false);
      setSelectedServiceId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Vehicle Services</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      <div className="relative">
        {/* Vehicle List Panel */}
        <div className={`bg-white rounded-lg shadow-sm transition-all duration-500 ease-out transform ${showForm ? 'translate-y-[50rem] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Sr.No
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Company
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      User
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      VRN
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Service
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Assign
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Track
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      View
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-4 text-center text-gray-500">
                        No vehicles found
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {vehicle.user?.company?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {vehicle.user?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {vehicle.vehicle_no || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {vehicle.services || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => !vehicle.isAssignedService && handleAssign(vehicle.id)}
                            className={`px-4 py-2 text-sm rounded-md ${vehicle.isAssignedService
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            disabled={vehicle.isAssignedService}
                          >
                            {vehicle.isAssignedService ? 'Assigned' : 'Assign'}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex justify-center">
                            <Link
                              href={`/admin/vehicles/trackservice?id=${vehicle.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <DocumentChartBarIcon className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex justify-center">
                            <Link
                              href={`/admin/user/vehicles/view?id=${vehicle.vehicleId}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <div className="flex justify-center">
                            <Link
                              href={`/admin/user/vehicles/edit?id=${vehicle.vehicleId}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Vehicle Form Panel */}
        <div className={`absolute inset-x-0 top-0 bg-white rounded-lg shadow-lg transition-all duration-500 ease-out transform ${showForm ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Vehicle</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VRN Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">VRN (Vehicle Registration Number)</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.vrn}
                    onChange={(e) => setFormData({ ...formData, vrn: e.target.value })}
                  />
                </div>

                {/* User Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Road Tax */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Road Tax Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm cursor-pointer relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-wrapper]:absolute [&::-webkit-calendar-picker-wrapper]:right-2"
                    value={formData.roadTax}
                    onChange={(e) => setFormData({ ...formData, roadTax: e.target.value })}
                  />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => e.target.files && handleFileUpload('roadTax', e.target.files[0])}
                  />
                </div>

                {/* Fitness */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Fitness Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm cursor-pointer relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-wrapper]:absolute [&::-webkit-calendar-picker-wrapper]:right-2"
                    value={formData.fitness}
                    onChange={(e) => setFormData({ ...formData, fitness: e.target.value })}
                  />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => e.target.files && handleFileUpload('fitness', e.target.files[0])}
                  />
                </div>

                {/* Insurance */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Insurance Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm cursor-pointer relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-wrapper]:absolute [&::-webkit-calendar-picker-wrapper]:right-2"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => e.target.files && handleFileUpload('insurance', e.target.files[0])}
                  />
                </div>

                {/* Pollution */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Pollution Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm cursor-pointer relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-wrapper]:absolute [&::-webkit-calendar-picker-wrapper]:right-2"
                    value={formData.pollution}
                    onChange={(e) => setFormData({ ...formData, pollution: e.target.value })}
                  />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => e.target.files && handleFileUpload('pollution', e.target.files[0])}
                  />
                </div>

                {/* State Permit */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">State Permit Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm cursor-pointer relative [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:hover:bg-gray-100 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-wrapper]:absolute [&::-webkit-calendar-picker-wrapper]:right-2"
                    value={formData.statePermit}
                    onChange={(e) => setFormData({ ...formData, statePermit: e.target.value })}
                  />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => e.target.files && handleFileUpload('statePermit', e.target.files[0])}
                  />
                </div>

                {/* National Permit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">National Permit Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 text-gray-700 bg-white shadow-sm"
                    value={formData.nationalPermit}
                    onChange={(e) => setFormData({ ...formData, nationalPermit: e.target.value })}
                  />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => e.target.files && handleFileUpload('nationalPermit', e.target.files[0])}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Creating...' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AssignConfirmModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedServiceId(null);
        }}
        onConfirm={confirmAssign}
        message="Are you sure you want to assign this service? This action cannot be undone."
      />
    </div>
  );
}
