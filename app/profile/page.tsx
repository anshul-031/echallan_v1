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
} from '@heroicons/react/24/outline';

import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ButtonLoader, ProfileLoader } from '@/app/components/ui/Loader';
import { getExpirationColor } from '@/lib/utils';
import Link from 'next/link';

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

  const [editableProfile, setEditableProfile] = useState({ ...profile });

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