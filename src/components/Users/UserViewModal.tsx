import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, ShieldCheckIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { User } from '../../types';
import { UserService } from '../../services/userService';
import { format, formatDistanceToNow } from 'date-fns';

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserViewModal({ isOpen, onClose, user }: UserViewModalProps) {
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserActivity();
    }
  }, [isOpen, user]);

  const loadUserActivity = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const activity = await UserService.getUserActivityLog(user.id);
      setActivityLog(activity);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'dispatcher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warehouse':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accounting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'customer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case 'order_created':
        return <CalendarIcon className="h-4 w-4 text-green-600" />;
      case 'profile_updated':
        return <UserIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Profile */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{user.email}</div>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium text-gray-900">{user.phone}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Member Since</div>
                  <div className="font-medium text-gray-900">{format(user.createdAt, 'MMM dd, yyyy')}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Last Login</div>
                  <div className="font-medium text-gray-900">
                    {user.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
              <span className="text-sm text-gray-500">({user.permissions.length} permissions)</span>
            </div>
            {user.permissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.permissions.map((permission, index) => (
                  <div key={index} className="bg-purple-50 px-3 py-2 rounded-lg">
                    <div className="text-sm font-medium text-purple-900">{permission.name}</div>
                    <div className="text-xs text-purple-700">
                      {permission.resource} • {permission.action}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No custom permissions assigned</p>
                <p className="text-xs">Using default role permissions</p>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading activity...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActionIcon(activity.action)}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.details}</div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        {activity.ipAddress && ` • IP: ${activity.ipAddress}`}
                      </div>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2" />
                    No recent activity
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className={`p-4 rounded-lg ${user.isActive ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center space-x-2">
              {user.isActive ? (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              ) : (
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              )}
              <span className={`font-medium ${user.isActive ? 'text-green-800' : 'text-red-800'}`}>
                Account {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className={`text-sm mt-1 ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
              {user.isActive 
                ? 'This user can log in and access the system'
                : 'This user cannot log in to the system'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}