'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  TruckIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  DocumentChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  MapPinIcon,
  DocumentCheckIcon,
  BuildingLibraryIcon,
  ReceiptPercentIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Import separate ClockIcon for timeline usage to avoid conflicts
import { ClockIcon as ClockIconAlt } from '@heroicons/react/24/solid';
import { TruckIcon as TruckIconAlt } from '@heroicons/react/24/solid';

import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ButtonLoader, ProfileLoader } from '@/app/components/ui/Loader';
import { getExpirationColor } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    joinDate: '',
    department: 'Operations', // Still keeping this as default since it's not in the database
    expiring_documents: 0,
    expired_documents: 0,
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Smaller pagination for profile page
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);

  const [editableProfile, setEditableProfile] = useState({ ...profile });

  const [trackingData, setTrackingData] = useState<any[]>([
    {
      id: 1,
      vehicleNo: 'MH12AB1234',
      service: 'Road Tax Renewal',
      status: 'In Progress',
      progress: {
        governmentFees: 100,
        rtoApproval: 60,
        inspection: 75,
        certificate: 30,
        documentDelivery: 0,
        overall: 50
      }
    },
    {
      id: 2,
      vehicleNo: 'MH43CD5678',
      service: 'Fitness Certificate',
      status: 'Pending Approval',
      progress: {
        governmentFees: 100,
        rtoApproval: 30,
        inspection: 0,
        certificate: 0,
        documentDelivery: 0,
        overall: 25
      }
    },
    {
      id: 3,
      vehicleNo: 'DL9EF9012',
      service: 'Pollution Certificate',
      status: 'Completed',
      progress: {
        governmentFees: 100,
        rtoApproval: 100,
        inspection: 100,
        certificate: 100,
        documentDelivery: 100,
        overall: 100
      }
    }
  ]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        // Pre-populate with session data immediately
        if (session?.user) {
          setProfile(prev => ({
            ...prev,
            name: session.user.name || '',
            email: session.user.email || '',
            role: session.user.role || '',
          }));
          
          setEditableProfile(prev => ({
            ...prev,
            name: session.user.name || '',
            email: session.user.email || '',
          }));
        }
        
        const response = await fetch('/api/profile', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: Failed to fetch profile data`);
        }
        
        const userData = await response.json();
        
        if (!userData) {
          throw new Error('No profile data received');
        }
        
        setProfile(prev => ({
          ...prev,
          name: userData.name || prev.name || '',
          email: userData.email || prev.email || '',
          role: userData.role || prev.role || '',
          joinDate: userData.joinDate || '',
          expiring_documents: userData.expiring_documents ?? 0,
          expired_documents: userData.expired_documents ?? 0,
          department: userData.department || 'Operations',
        }));
        
        setEditableProfile(prev => ({
          ...prev,
          name: userData.name || prev.name || '',
          email: userData.email || prev.email || '',
        }));
        
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile data. Please try again later.');
        toast.error('Failed to load profile data');
        
        // Still use session data if API fails
        if (session?.user) {
          setProfile(prev => ({
            ...prev,
            name: session.user.name || prev.name || '',
            email: session.user.email || prev.email || '',
            role: session.user.role || prev.role || '',
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [session]);

  // Fetch user vehicles data
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!session?.user) return;
      
      try {
        setIsVehiclesLoading(true);
        const response = await fetch('/api/vehicles/user');
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        toast.error('Failed to load vehicles data');
      } finally {
        setIsVehiclesLoading(false);
      }
    };
    
    fetchVehicles();
  }, [session]);

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editableProfile.name,
            email: editableProfile.email,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
        
        const updatedData = await response.json();
        
        // Update profile with the returned data
        setProfile(prev => ({
          ...prev,
          name: updatedData.name || prev.name,
          email: updatedData.email || prev.email,
          joinDate: updatedData.joinDate || prev.joinDate,
        }));
        
        setIsLoading(false);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Failed to update profile. Please try again.');
        toast.error('Failed to update profile');
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditableProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfileImage(e.target.result as string);
        toast.success('Profile picture updated');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteVehicle = (id: number) => {
    // Implement delete functionality
    toast.success('Delete functionality will be implemented');
  };

  const handleUpdateVehicle = (id: number) => {
    // Implement update functionality
    toast.success('Update functionality will be implemented');
  };

  const handleUploadDocument = (id: number) => {
    // Implement upload functionality
    toast.success('Upload functionality will be implemented');
  };

  // Add search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter(
        vehicle => 
          vehicle.vrn?.toLowerCase().includes(query) ||
          vehicle.status?.toLowerCase().includes(query)
      );
      setFilteredVehicles(filtered);
    }
  };

  // Pagination handlers
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentVehicles = filteredVehicles.slice(startIdx, endIdx);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredVehicles(vehicles);
  };

  // Update filteredVehicles when vehicles change
  useEffect(() => {
    setFilteredVehicles(vehicles);
  }, [vehicles]);

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)} 
                  className="text-sm text-red-600 hover:text-red-800 mt-1"
                >
                  Try Again
                </button>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="ml-auto p-1 text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {isLoading && !error ? (
            <div className="py-14">
              <ProfileLoader size="lg" showText text="Loading your profile data..." />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-4 border-white">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-24 h-24 text-white" />
                        )}
                      </div>
                      <label 
                        htmlFor="profile-image" 
                        className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </label>
                      <input 
                        type="file" 
                        id="profile-image" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl font-bold">{profile.name || 'User'}</h1>
                      <p className="text-blue-100">{profile.role}</p>
                      <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                        <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                          {profile.department}
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          Joined {profile.joinDate}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={handleCancel}
                            className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={handleEditToggle}
                            disabled={isLoading}
                            className="bg-white text-blue-600 rounded-lg p-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? <ButtonLoader /> : <CheckIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={handleEditToggle}
                          className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={editableProfile.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">{profile.name || 'Not set'}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2" />
                            {isEditing ? (
                              <input
                                type="email"
                                name="email"
                                value={editableProfile.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{profile.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                          <div className="flex items-center">
                            <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <p className="text-gray-900">{profile.role}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                          <div className="flex items-center">
                            <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-2" />
                            {isEditing ? (
                              <input
                                type="text"
                                name="department"
                                value={editableProfile.department}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{profile.department}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Join Date</label>
                          <div className="flex items-center">
                            <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <p className="text-gray-900">{profile.joinDate}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Document Status</label>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <p className="text-amber-800 text-sm font-medium">Expiring Soon</p>
                              <p className="text-2xl font-bold text-amber-600">{profile.expiring_documents}</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                              <p className="text-red-800 text-sm font-medium">Expired</p>
                              <p className="text-2xl font-bold text-red-600">{profile.expired_documents}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Renewals Section - Updated with icons on cards */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Renewals</h2>
                  <p className="text-gray-500 mt-1">Manage your vehicle documents and renewals</p>
                </div>
                
                <div className="p-6">
                  {/* Status Cards with Icons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md shadow-blue-200 p-5 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-medium uppercase opacity-80">Total Vehicles</h3>
                          <p className="text-3xl font-bold mt-1">{vehicles.length}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <TruckIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <p>
                          <span className="opacity-80">Active: </span>
                          <span className="font-semibold">{vehicles.filter(v => v.status === 'Active').length}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md shadow-amber-200 p-5 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-medium uppercase opacity-80">Expiring Soon</h3>
                          <p className="text-3xl font-bold mt-1">{profile.expiring_documents}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <ClockIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <p>
                          <span className="opacity-80">Documents needing renewal</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md shadow-red-200 p-5 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xs font-medium uppercase opacity-80">Expired</h3>
                          <p className="text-3xl font-bold mt-1">{profile.expired_documents}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <DocumentChartBarIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        <p>
                          <span className="opacity-80">Expired documents</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Search bar */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by VRN or status..."
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Vehicles Table */}
                  <div className="overflow-x-auto">
                    {isVehiclesLoading ? (
                      <div className="py-8 text-center">
                        <ProfileLoader size="md" showText text="Loading vehicles data..." />
                      </div>
                    ) : filteredVehicles.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <p>No vehicles found. Add vehicles to manage their documents.</p>
                      </div>
                    ) : (
                      <>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VRN</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Road Tax</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fitness</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pollution</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State Permit</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National Permit</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentVehicles.map((vehicle, index) => (
                              <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.vrn}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${vehicle.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                    vehicle.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'}`}>
                                    {vehicle.status || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={getExpirationColor(vehicle.roadTax)}>
                                    {vehicle.roadTax || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={getExpirationColor(vehicle.fitness)}>
                                    {vehicle.fitness || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={getExpirationColor(vehicle.insurance)}>
                                    {vehicle.insurance || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={getExpirationColor(vehicle.pollution)}>
                                    {vehicle.pollution || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={getExpirationColor(vehicle.statePermit)}>
                                    {vehicle.statePermit || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <span className={getExpirationColor(vehicle.nationalPermit)}>
                                    {vehicle.nationalPermit || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {/* Pagination */}
                        <div className="px-3 py-4 flex items-center justify-between border-t border-gray-200">
                          <div className="flex-1 flex justify-between items-center">
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{startIdx + 1}</span> to{" "}
                              <span className="font-medium">
                                {Math.min(endIdx, filteredVehicles.length)}
                              </span>{" "}
                              of <span className="font-medium">{filteredVehicles.length}</span> vehicles
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                                Previous
                              </button>
                              <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                                <ChevronRightIcon className="h-4 w-4 ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Real-Time Tracking Section - New */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Real-Time Tracking</h2>
                  <p className="text-gray-500 mt-1">Track the status of your vehicle document renewals and services</p>
                </div>
                
                <div className="p-6">
                  {/* Tracking Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl. No.</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No.</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {trackingData.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.vehicleNo}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.service}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${item.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    item.progress.overall === 100 ? 'bg-green-600' : 
                                    item.progress.overall > 60 ? 'bg-blue-600' : 
                                    item.progress.overall > 30 ? 'bg-yellow-600' : 'bg-red-600'
                                  }`} 
                                  style={{ width: `${item.progress.overall}%` }}
                                ></div>
                              </div>
                              <div className="text-xs">{item.progress.overall}% Complete</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Detailed Progress Tracking */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Progress Tracking</h3>
                    
                    {trackingData.length > 0 && (
                      <div className="grid grid-cols-1 gap-6">
                        {trackingData.map((item) => (
                          <div key={`tracking-detail-${item.id}`} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h4 className="text-md font-semibold">{item.vehicleNo} - {item.service}</h4>
                                <p className="text-sm text-gray-500">Started on: 15 May 2024</p>
                              </div>
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${item.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                                {item.status}
                              </span>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Government Fees */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center">
                                    <ReceiptPercentIcon className="w-4 h-4 mr-2 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Government Fees</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{item.progress.governmentFees}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full" 
                                    style={{ width: `${item.progress.governmentFees}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* RTO Approval */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center">
                                    <BuildingLibraryIcon className="w-4 h-4 mr-2 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">RTO Approval</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{item.progress.rtoApproval}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-violet-600 h-2 rounded-full" 
                                    style={{ width: `${item.progress.rtoApproval}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Inspection */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center">
                                    <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Inspection</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{item.progress.inspection}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${item.progress.inspection}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Certificate */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center">
                                    <DocumentCheckIcon className="w-4 h-4 mr-2 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Certificate</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{item.progress.certificate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${item.progress.certificate}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Document Delivery */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <div className="flex items-center">
                                    <TruckIconAlt className="w-4 h-4 mr-2 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Document Delivery</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{item.progress.documentDelivery}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-amber-600 h-2 rounded-full" 
                                    style={{ width: `${item.progress.documentDelivery}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Progress Timeline */}
                              <div className="pt-4 border-t border-gray-200 mt-4">
                                <h5 className="text-sm font-semibold mb-2">Progress Timeline</h5>
                                <div className="space-y-3">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                      </div>
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-900">Payment Received</p>
                                      <p className="text-xs text-gray-500">15 May 2024, 10:30 AM</p>
                                    </div>
                                  </div>
                                  
                                  {item.progress.rtoApproval > 0 && (
                                    <div className="flex">
                                      <div className="flex-shrink-0">
                                        <div className={`w-7 h-7 rounded-full ${item.progress.rtoApproval === 100 ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
                                          {item.progress.rtoApproval === 100 ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                          ) : (
                                            <ClockIconAlt className="w-5 h-5 text-blue-600" />
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">RTO Application Submitted</p>
                                        <p className="text-xs text-gray-500">16 May 2024, 02:15 PM</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {item.progress.inspection > 0 && (
                                    <div className="flex">
                                      <div className="flex-shrink-0">
                                        <div className={`w-7 h-7 rounded-full ${item.progress.inspection === 100 ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
                                          {item.progress.inspection === 100 ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                          ) : (
                                            <ClockIconAlt className="w-5 h-5 text-blue-600" />
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Vehicle Inspection Scheduled</p>
                                        <p className="text-xs text-gray-500">18 May 2024, 11:00 AM</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {item.status === 'Completed' && (
                                    <div className="flex">
                                      <div className="flex-shrink-0">
                                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Process Completed</p>
                                        <p className="text-xs text-gray-500">22 May 2024, 04:45 PM</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action Button */}
                              {item.status !== 'Completed' && (
                                <div className="mt-4">
                                  <button
                                    className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none"
                                  >
                                    <ArrowPathIcon className="mr-1.5 h-4 w-4" />
                                    Refresh Status
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Vehicle Documents Table Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Document Updates</h2>
                  <p className="text-gray-500 mt-1">Update your vehicle documents and manage renewals</p>
                </div>
                
                <div className="p-4 sm:p-6 overflow-x-auto">
                  {isVehiclesLoading ? (
                    <div className="py-8 text-center">
                      <ProfileLoader size="md" showText text="Loading vehicles data..." />
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <p>No vehicles found. Add vehicles to manage their documents.</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VRN</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Road Tax</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fitness</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pollution</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permit</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National Permit</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles.map((vehicle, index) => (
                          <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.vrn}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.roadTax || 'N/A'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.fitness || 'N/A'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.insurance || 'N/A'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.pollution || 'N/A'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.statePermit || 'N/A'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.nationalPermit || 'N/A'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.lastUpdated || 'Never'}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleUpdateVehicle(vehicle.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Update"
                                >
                                  <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleUploadDocument(vehicle.id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Upload"
                                >
                                  <ArrowUpTrayIcon className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ProfilePage:", error);
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
          <p>Sorry, there was a problem loading the profile page. Please try again later.</p>
        </div>
      </div>
    );
  }
} 