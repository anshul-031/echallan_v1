'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    role: 'Administrator',
    address: 'Jaipur, Rajasthan, India',
    department: 'Operations',
    joinDate: 'January 10, 2023',
    bio: 'Experienced fleet manager with over 5 years of experience in logistics and transportation management.'
  });

  const [editableProfile, setEditableProfile] = useState({ ...profile });

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setIsLoading(true);
      setError(null);
      
      // Simulate API call with timeout
      setTimeout(() => {
        try {
          // Simulate successful update
          setProfile(editableProfile);
          setIsLoading(false);
          setIsEditing(false);
          toast.success('Profile updated successfully');
        } catch (err) {
          setIsLoading(false);
          setError('Failed to update profile. Please try again.');
          toast.error('Failed to update profile');
        }
      }, 800);
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
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
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
                        className="bg-white text-blue-600 rounded-lg p-2 hover:bg-blue-50 transition-colors"
                      >
                        <CheckIcon className="w-5 h-5" />
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
                        <p className="text-gray-900">{profile.name}</p>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={editableProfile.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                      <div className="flex items-center">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            value={editableProfile.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.address}</p>
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
                        {isEditing ? (
                          <input
                            type="text"
                            name="role"
                            value={editableProfile.role}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.role}</p>
                        )}
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
                      <label className="block text-sm font-medium text-gray-500 mb-1">Biography</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={editableProfile.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-8 flex justify-end gap-3">
                  <button 
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleEditToggle}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
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