// Mock API functions for development/demo purposes
import { toast } from 'react-hot-toast';

// Define the types for our settings data
export interface UserSettings {
  settings: {
    darkMode: boolean;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      updates: boolean;
      renewals: boolean;
      newVehicles: boolean;
    };
    sessionTimeout: number;
  };
  preferences: {
    roadTaxVisibility: boolean;
    fitnessVisibility: boolean;
    insuranceVisibility: boolean;
    pollutionVisibility: boolean;
    statePermitVisibility: boolean;
    nationalPermitVisibility: boolean;
  };
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  passwordLastChanged: string;
  activityAlertsEnabled: boolean;
  devices: Array<{
    id: string;
    name: string;
    lastActive: string;
    location: string;
    isCurrent: boolean;
  }>;
}

// Define a separate type for partial updates
export interface UserSettingsUpdate {
  settings?: Partial<{
    darkMode?: boolean;
    language?: string;
    notifications?: Partial<{
      email?: boolean;
      push?: boolean;
      updates?: boolean;
      renewals?: boolean;
      newVehicles?: boolean;
    }>;
    sessionTimeout?: number;
  }>;
  preferences?: Partial<{
    roadTaxVisibility?: boolean;
    fitnessVisibility?: boolean;
    insuranceVisibility?: boolean;
    pollutionVisibility?: boolean;
    statePermitVisibility?: boolean;
    nationalPermitVisibility?: boolean;
  }>;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  activityAlertsEnabled?: boolean;
  password?: string; // Special case for password updates
}

// Create a local storage based "database" for settings
export const getSettings = (): UserSettings | null => {
  try {
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings) as UserSettings;
    }
    
    // Default settings
    const defaultSettings: UserSettings = {
      settings: {
        darkMode: false,
        language: 'english',
        notifications: {
          email: true,
          push: true,
          updates: false,
          renewals: true,
          newVehicles: true
        },
        sessionTimeout: 30
      },
      preferences: {
        roadTaxVisibility: true,
        fitnessVisibility: true,
        insuranceVisibility: true,
        pollutionVisibility: true,
        statePermitVisibility: true,
        nationalPermitVisibility: true
      },
      twoFactorEnabled: false,
      emailVerified: true,
      activityAlertsEnabled: true,
      passwordLastChanged: new Date().toISOString(),
      devices: [
        {
          id: '1',
          name: 'iPhone 13 Pro',
          lastActive: new Date().toISOString(),
          location: 'Jaipur, India',
          isCurrent: true
        },
        {
          id: '2',
          name: 'MacBook Pro',
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'New Delhi, India',
          isCurrent: false
        }
      ]
    };
    
    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    return defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

export const updateSettings = (updates: UserSettingsUpdate): Promise<UserSettings> => {
  try {
    const currentSettings = getSettings();
    if (!currentSettings) {
      throw new Error('Failed to get current settings');
    }
    
    // Merge the updates with current settings
    const newSettings: UserSettings = { ...currentSettings };
    
    // Special handling for nested settings object
    if (updates.settings) {
      // Create a copy of the current settings to update
      const updatedSettings = { ...currentSettings.settings };
      
      // Update specific fields from updates.settings
      if (updates.settings.darkMode !== undefined) {
        updatedSettings.darkMode = updates.settings.darkMode;
      }
      
      if (updates.settings.language !== undefined) {
        updatedSettings.language = updates.settings.language;
      }
      
      if (updates.settings.sessionTimeout !== undefined) {
        updatedSettings.sessionTimeout = updates.settings.sessionTimeout;
      }
      
      // Special handling for notifications
      if (updates.settings.notifications) {
        const updatedNotifications = { ...currentSettings.settings.notifications };
        
        // Update each notification setting if defined
        if (typeof updates.settings.notifications.email === 'boolean') {
          updatedNotifications.email = updates.settings.notifications.email;
        }
        
        if (typeof updates.settings.notifications.push === 'boolean') {
          updatedNotifications.push = updates.settings.notifications.push;
        }
        
        if (typeof updates.settings.notifications.updates === 'boolean') {
          updatedNotifications.updates = updates.settings.notifications.updates;
        }
        
        if (typeof updates.settings.notifications.renewals === 'boolean') {
          updatedNotifications.renewals = updates.settings.notifications.renewals;
        }
        
        if (typeof updates.settings.notifications.newVehicles === 'boolean') {
          updatedNotifications.newVehicles = updates.settings.notifications.newVehicles;
        }
        
        updatedSettings.notifications = updatedNotifications;
      }
      
      newSettings.settings = updatedSettings;
    }
    
    // Special handling for preferences object
    if (updates.preferences) {
      newSettings.preferences = {
        ...currentSettings.preferences,
        ...updates.preferences
      };
    }
    
    // Handle boolean properties
    if (typeof updates.twoFactorEnabled === 'boolean') {
      newSettings.twoFactorEnabled = updates.twoFactorEnabled;
    }
    
    if (typeof updates.emailVerified === 'boolean') {
      newSettings.emailVerified = updates.emailVerified;
    }
    
    if (typeof updates.activityAlertsEnabled === 'boolean') {
      newSettings.activityAlertsEnabled = updates.activityAlertsEnabled;
    }
    
    // Special case for password update
    if (updates.password) {
      newSettings.passwordLastChanged = new Date().toISOString();
    }
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(newSettings);
      }, 500);
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    toast.error('Failed to update settings');
    return Promise.reject(error);
  }
}; 