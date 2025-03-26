'use client';

import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  UserIcon,
  EnvelopeIcon,
  MoonIcon,
  SunIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { getSettings, updateSettings, UserSettings, UserSettingsUpdate } from '@/lib/mockApi';

type SettingsTab = 'app' | 'account' | 'security' | 'preferences';

interface PreferenceType {
  roadTaxVisibility: boolean;
  fitnessVisibility: boolean;
  insuranceVisibility: boolean;
  pollutionVisibility: boolean;
  statePermitVisibility: boolean;
  nationalPermitVisibility: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('app');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreferenceType | null>(null);

  // App settings
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('english');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    renewals: true,
    newVehicles: true
  });

  // Account settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  // Security settings
  const [passwordLastChanged, setPasswordLastChanged] = useState('2 months ago');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [activityAlertsEnabled, setActivityAlertsEnabled] = useState(true);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Use mock API instead of actual fetch
        setIsLoading(true);
        const data = getSettings();

        if (!data) {
          throw new Error('Failed to fetch settings');
        }

        // Update state with fetched data
        if (data.settings) {
          setDarkMode(data.settings.darkMode);
          setLanguage(data.settings.language);
          setNotifications(data.settings.notifications);
          setSessionTimeout(data.settings.sessionTimeout);
        }
        if (data.preferences) {
          setPreferences(data.preferences);
        }
        if (typeof data.twoFactorEnabled === 'boolean') {
          setTwoFactorEnabled(data.twoFactorEnabled);
        }
        if (data.emailVerified !== undefined) {
          setEmailVerified(data.emailVerified);
        }
        if (data.passwordLastChanged) {
          setPasswordLastChanged(new Date(data.passwordLastChanged).toLocaleDateString());
        }
        if (typeof data.activityAlertsEnabled === 'boolean') {
          setActivityAlertsEnabled(data.activityAlertsEnabled);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Add password fields state
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Add password validation state
  const [passwordError, setPasswordError] = useState('');

  // Add delete account confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Fleet dashboard preferences
  const [showVehicleNames, setShowVehicleNames] = useState(false);
  const [showVehicleLocations, setShowVehicleLocations] = useState(false);

  const handlePreferenceChange = async (key: keyof PreferenceType) => {
    if (!preferences) return;

    setIsLoading(true);
    setError(null);

    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    try {
      // Use mock API instead of actual fetch
      await updateSettings({ preferences: updatedPreferences });

      setPreferences(updatedPreferences);
      toast.success(`${updatedPreferences[key] ? 'Enabled' : 'Disabled'} ${key.replace('Visibility', '')}`);

    } catch (err) {
      console.error("Could not update preferences:", err);
      setError('Failed to update preferences');
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };

    try {
      // Use mock API instead of actual fetch
      const update: UserSettingsUpdate = {
        settings: {
          notifications: {
            [key]: !notifications[key]
          }
        }
      };

      await updateSettings(update);

      setNotifications(updatedNotifications);
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${updatedNotifications[key] ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use mock API instead of actual fetch
      await updateSettings({
        twoFactorEnabled: !twoFactorEnabled
      });

      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setError('Failed to update two-factor authentication');
      toast.error('Failed to update two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDarkMode = async () => {
    try {
      // Use mock API instead of actual fetch
      await updateSettings({
        settings: {
          darkMode: !darkMode
        }
      });

      setDarkMode(!darkMode);
      toast.success(`${!darkMode ? 'Dark' : 'Light'} mode enabled`);

      // Apply dark mode to document
      if (!darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error('Error updating dark mode:', error);
      toast.error('Failed to update dark mode');
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      // Use mock API instead of actual fetch
      await updateSettings({
        settings: {
          language: e.target.value
        }
      });

      setLanguage(e.target.value);
      toast.success(`Language changed to ${e.target.value}`);
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language');
    }
  };

  const handleSessionTimeoutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      // Use mock API instead of actual fetch
      await updateSettings({
        settings: {
          sessionTimeout: Number(e.target.value)
        }
      });

      setSessionTimeout(Number(e.target.value));
      toast.success(`Session timeout set to ${e.target.value} minutes`);
    } catch (error) {
      console.error('Error updating session timeout:', error);
      toast.error('Failed to update session timeout');
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when typing
    if (passwordError) setPasswordError('');
  };

  const handleSavePassword = async () => {
    // Reset error
    setPasswordError('');
    setError(null);

    // Validate fields are not empty
    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmPassword) {
      setPasswordError('All password fields are required');
      toast.error('All password fields are required');
      return;
    }

    // Validate new password length
    if (passwordFields.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Validate passwords match
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordError('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Use mock API instead of actual fetch
      const result = await updateSettings({
        password: passwordFields.newPassword
      });

      setPasswordLastChanged(new Date(result.passwordLastChanged).toLocaleDateString());

      // Clear password fields
      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password updated successfully');
    } catch (err) {
      setError('Failed to update password');
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle device revocation
  const handleRevokeDevice = async (deviceId: string) => {
    try {
      // In a real app, you would call an API to revoke the device
      toast.success('Device access has been revoked');
    } catch (error) {
      console.error('Error revoking device:', error);
      toast.error('Failed to revoke device access');
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    toast.success('You have been logged out successfully');
    // In a real app, you would call an API to log the user out
  };

  // Function to toggle activity alerts
  const handleToggleActivityAlerts = async () => {
    try {
      await updateSettings({
        activityAlertsEnabled: !activityAlertsEnabled
      });

      setActivityAlertsEnabled(!activityAlertsEnabled);
      toast.success(`Activity alerts ${!activityAlertsEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating activity alerts:', error);
      toast.error('Failed to update activity alerts');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    toast.success('Account has been scheduled for deletion');
    setShowDeleteConfirmation(false);
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirmation(false);
  };

  try {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
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
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Cog6ToothIcon className="w-6 h-6 mr-2 text-blue-600" />
                Settings
              </h1>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('app')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'app'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <GlobeAltIcon className="w-5 h-5 mr-3" />
                  App Settings
                </button>

                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'account'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <UserIcon className="w-5 h-5 mr-3" />
                  Account Settings
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'security'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <LockClosedIcon className="w-5 h-5 mr-3" />
                  Security & Privacy
                </button>

                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'preferences'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-3" />
                  Preferences
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {activeTab === 'app' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Settings</h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {darkMode ? (
                            <MoonIcon className="w-5 h-5 text-indigo-600 mr-3" />
                          ) : (
                            <SunIcon className="w-5 h-5 text-yellow-500 mr-3" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">Appearance</p>
                            <p className="text-sm text-gray-500">Toggle between light and dark mode</p>
                          </div>
                        </div>
                        <button
                          onClick={handleToggleDarkMode}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Language</label>
                        <select
                          value={language}
                          onChange={handleLanguageChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="english">English</option>
                          <option value="hindi">Hindi</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('email')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('push')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">System Updates</p>
                          <p className="text-sm text-gray-500">Receive notifications about system updates</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('updates')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.updates ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.updates ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Document Renewals</p>
                          <p className="text-sm text-gray-500">Get notified about upcoming document renewals</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('renewals')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.renewals ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.renewals ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">New Vehicle Alerts</p>
                          <p className="text-sm text-gray-500">Get notified when new vehicles are added</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('newVehicles')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.newVehicles ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.newVehicles ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <div className="flex items-center mt-1">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <p className="text-gray-900">john.doe@example.com</p>
                          {emailVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        {!emailVerified && (
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                            Verify Email
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                          <button
                            onClick={handleToggleTwoFactor}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isLoading ? (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </span>
                            ) : (
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            )}
                          </button>
                        </div>
                        {twoFactorEnabled && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Two-factor authentication is enabled. You&apos;ll be asked for a verification code when you sign in from a new device.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete Account
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                          This will permanently delete your account and all associated data.
                        </p>
                      </div>

                      {/* Delete Account Confirmation Dialog */}
                      {showDeleteConfirmation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Account Deletion</h3>
                            <p className="text-gray-600 mb-6">
                              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
                            </p>
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={cancelDeleteAccount}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={confirmDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                Delete Account
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility Preferences</h2>
                    <p className="text-sm text-gray-500 mb-4">Change your preferences according to your requirement. The disabled ones will not be shown in the table.</p>
                    {preferences ? (
                      <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Fleet Dashboard</h2>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Road Tax</p>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('roadTaxVisibility')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.roadTaxVisibility ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            disabled={isLoading}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.roadTaxVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Fitness</p>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('fitnessVisibility')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.fitnessVisibility ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            disabled={isLoading}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.fitnessVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Insurance</p>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('insuranceVisibility')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.insuranceVisibility ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            disabled={isLoading}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.insuranceVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Pollution</p>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('pollutionVisibility')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pollutionVisibility ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            disabled={isLoading}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pollutionVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">State Permit</p>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('statePermitVisibility')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.statePermitVisibility ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            disabled={isLoading}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.statePermitVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">National Permit</p>
                          </div>
                          <button
                            onClick={() => handlePreferenceChange('nationalPermitVisibility')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.nationalPermitVisibility ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            disabled={isLoading}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.nationalPermitVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>Loading preferences...</div>
                    )}
                  </div>

                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Password Last Changed</p>
                        <p className="text-gray-900">{passwordLastChanged}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="current-password"
                            name="currentPassword"
                            value={passwordFields.currentPassword}
                            onChange={handlePasswordInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="new-password"
                            name="newPassword"
                            value={passwordFields.newPassword}
                            onChange={handlePasswordInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirm-password"
                            name="confirmPassword"
                            value={passwordFields.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {passwordError && (
                          <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                        )}

                        <button
                          onClick={handleSavePassword}
                          disabled={isLoading}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Session Timeout</label>
                        <div className="flex items-center">
                          <select
                            value={sessionTimeout}
                            onChange={handleSessionTimeoutChange}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                          </select>
                          <p className="ml-3 text-sm text-gray-500">
                            You&apos;ll be logged out after this period of inactivity
                          </p>
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                        >
                          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                          Log Out of All Devices
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                          This will log you out of all devices except this one
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Login History</h2>
                    <div className="mt-4 space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Jaipur, India</p>
                            <p className="text-xs text-gray-500">Today, 09:23 AM</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Current Session
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">New Delhi, India</p>
                            <p className="text-xs text-gray-500">Yesterday, 07:12 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">Activity Alerts</p>
                            <p className="text-sm text-gray-500">
                              Get alerts about unusual account activity
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleToggleActivityAlerts}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activityAlertsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activityAlertsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">iPhone 13 Pro</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Current Device
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">Last active: Just now</p>
                            <p className="text-sm text-gray-500">Location: Jaipur, India</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">MacBook Pro</p>
                              <button
                                onClick={() => handleRevokeDevice('2')}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Revoke Access
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">Last active: 2 days ago</p>
                            <p className="text-sm text-gray-500">Location: New Delhi, India</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in SettingsPage:", error);
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error Loading Settings</h2>
          <p>Sorry, there was a problem loading the settings page. Please try again later.</p>
        </div>
      </div>
    );
  }
}
