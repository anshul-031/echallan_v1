'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  MapPinIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Document Renewal',
      message: 'Insurance for vehicle RJ09GB9453 is due for renewal in 7 days.',
      time: '2 hours ago',
      type: 'warning',
      read: false
    },
    {
      id: '2',
      title: 'Payment Success',
      message: 'Your payment of ₹1,500 for challan #CH001 has been processed successfully.',
      time: '5 hours ago',
      type: 'success',
      read: false
    },
    {
      id: '3',
      title: 'New Challan Added',
      message: 'A new challan has been added for vehicle RJ09GB9450.',
      time: 'Yesterday',
      type: 'info',
      read: true
    },
    {
      id: '4',
      title: 'System Maintenance',
      message: 'The system will undergo maintenance on July 15, 2024 from 2:00 AM to 5:00 AM IST.',
      time: '2 days ago',
      type: 'info',
      read: true
    },
    {
      id: '5',
      title: 'Document Expired',
      message: 'Pollution certificate for vehicle RJ09GB9453 has expired. Please renew immediately.',
      time: '3 days ago',
      type: 'alert',
      read: false
    },
    {
      id: '6',
      title: 'Vehicle Location Updated',
      message: 'RJ09GB9450 location has been updated. Last seen at Jaipur Railway Station.',
      time: '1 week ago',
      type: 'info',
      read: true
    }
  ]);
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Simulate fetching notifications
  const fetchNotifications = () => {
    setRefreshing(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Keep the same notifications but reset their state
        setRefreshing(false);
        toast.success('Notifications refreshed');
      } catch (err) {
        setRefreshing(false);
        setError('Failed to refresh notifications. Please try again.');
        toast.error('Failed to refresh notifications');
      }
    }, 800);
  };
  
  const handleMarkAsRead = (id: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
        setIsLoading(false);
        toast.success('Notification marked as read');
      } catch (err) {
        setIsLoading(false);
        setError('Failed to mark notification as read. Please try again.');
        toast.error('Failed to update notification');
      }
    }, 400);
  };
  
  const handleDelete = (id: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        setIsLoading(false);
        toast.success('Notification deleted');
      } catch (err) {
        setIsLoading(false);
        setError('Failed to delete notification. Please try again.');
        toast.error('Failed to delete notification');
      }
    }, 400);
  };
  
  const handleMarkAllAsRead = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setIsLoading(false);
        toast.success('All notifications marked as read');
      } catch (err) {
        setIsLoading(false);
        setError('Failed to mark all notifications as read. Please try again.');
        toast.error('Failed to update notifications');
      }
    }, 600);
  };
  
  const handleClearAll = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        setNotifications([]);
        setIsLoading(false);
        toast.success('All notifications cleared');
      } catch (err) {
        setIsLoading(false);
        setError('Failed to clear notifications. Please try again.');
        toast.error('Failed to clear notifications');
      }
    }, 600);
  };
  
  const handleRenewDocument = (vehicleNo: string, documentType: string) => {
    toast.success(`Initiating renewal for ${documentType} of vehicle ${vehicleNo}`);
  };
  
  const handleViewDocuments = (vehicleNo: string) => {
    toast.success(`Viewing documents for vehicle ${vehicleNo}`);
  };
  
  const handleViewLocation = (vehicleNo: string, location: string) => {
    toast.success(`Viewing location of ${vehicleNo} at ${location}`);
  };
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  }).filter(notification => 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getIconByType = (type: string) => {
    switch(type) {
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'success':
        return <CheckIcon className="w-6 h-6 text-green-500" />;
      case 'alert':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-500" />;
    }
  };
  
  const getNotificationTypeClass = (type: string) => {
    switch(type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
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
            <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="w-8 h-8 mr-3" />
                  <h1 className="text-2xl font-bold">Notifications</h1>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={fetchNotifications}
                    disabled={refreshing}
                    className="flex items-center text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors disabled:opacity-50"
                    title="Refresh notifications"
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="text-sm">
                    {notifications.filter(n => !n.read).length} unread notifications
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === 'unread' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === 'read' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    Read
                  </button>
                </div>
                
                <div className="w-full sm:w-auto flex gap-2">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={isLoading || notifications.length === 0 || notifications.every(n => n.read)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      title="Mark all as read"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={isLoading || notifications.length === 0}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      title="Clear all notifications"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {isLoading && notifications.length === 0 ? (
                  // Loading state when no notifications
                  <div className="text-center py-8">
                    <svg className="animate-spin w-12 h-12 text-gray-300 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 text-lg">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`relative border rounded-lg p-4 transition-all ${
                        getNotificationTypeClass(notification.type)
                      } ${notification.read ? 'opacity-80' : ''} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {!notification.read && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                      <div className="flex">
                        <div className="mr-4 mt-1">
                          {getIconByType(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                          <p className="text-gray-700 mb-3">{notification.message}</p>
                          <div className="flex gap-3">
                            {notification.type === 'warning' && notification.title.includes('Renewal') && (
                              <button 
                                onClick={() => {
                                  const vehicleNo = notification.message.match(/RJ\d+[A-Z]+\d+/)?.[0] || '';
                                  const documentType = notification.message.split(' for ')[0].split('Insurance')[0].trim();
                                  handleRenewDocument(vehicleNo, documentType || 'document');
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <ArrowPathIcon className="w-4 h-4 mr-1" />
                                Renew Now
                              </button>
                            )}
                            {notification.type === 'alert' && notification.title.includes('Expired') && (
                              <button 
                                onClick={() => {
                                  const vehicleNo = notification.message.match(/RJ\d+[A-Z]+\d+/)?.[0] || '';
                                  handleViewDocuments(vehicleNo);
                                }} 
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                View Documents
                              </button>
                            )}
                            {notification.type === 'info' && notification.title.includes('Location') && (
                              <button 
                                onClick={() => {
                                  const vehicleNo = notification.message.match(/RJ\d+[A-Z]+\d+/)?.[0] || '';
                                  const location = notification.message.includes('Last seen at') 
                                    ? notification.message.split('Last seen at ')[1].split('.')[0]
                                    : '';
                                  handleViewLocation(vehicleNo, location || 'unknown location');
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                View Location
                              </button>
                            )}
                            {!notification.read && (
                              <button 
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={isLoading}
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center disabled:opacity-50"
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                Mark as Read
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(notification.id)}
                              disabled={isLoading}
                              className="text-sm text-red-600 hover:text-red-800 flex items-center ml-auto disabled:opacity-50"
                            >
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No notifications to display</p>
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'Try a different search query' : 'You\'re all caught up!'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={fetchNotifications}
                        disabled={refreshing}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto disabled:opacity-50"
                      >
                        {refreshing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <ArrowPathIcon className="w-4 h-4 mr-2" />
                            Refresh Notifications
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in NotificationsPage:", error);
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error Loading Notifications</h2>
          <p>Sorry, there was a problem loading the notifications page. Please try again later.</p>
        </div>
      </div>
    );
  }
} 