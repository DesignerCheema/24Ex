import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  CalendarIcon,
  ComputerDesktopIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { UserService } from '../../services/userService';
import { format, formatDistanceToNow } from 'date-fns';

export default function UserActivity() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    loadActivities();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Mock activity data - in real implementation, this would come from audit logs
      const mockActivities = [
        {
          id: '1',
          userId: '1',
          userName: 'Admin User',
          action: 'login',
          resource: 'system',
          details: 'User logged in from 192.168.1.100',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 120.0.0.0'
        },
        {
          id: '2',
          userId: '2',
          userName: 'John Dispatcher',
          action: 'order_created',
          resource: 'orders',
          details: 'Created order ORD-2024-001',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '192.168.1.101'
        },
        {
          id: '3',
          userId: '1',
          userName: 'Admin User',
          action: 'user_created',
          resource: 'users',
          details: 'Created new user: Jane Smith',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100'
        },
        {
          id: '4',
          userId: '2',
          userName: 'John Dispatcher',
          action: 'order_updated',
          resource: 'orders',
          details: 'Updated order status to shipped',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          ipAddress: '192.168.1.101'
        },
        {
          id: '5',
          userId: '1',
          userName: 'Admin User',
          action: 'settings_updated',
          resource: 'settings',
          details: 'Updated system notification settings',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100'
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === 'all' || activity.userId === userFilter;
    const matchesAction = actionFilter === 'all' || activity.action === actionFilter;
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case 'order_created':
      case 'order_updated':
        return <DocumentTextIcon className="h-4 w-4 text-green-600" />;
      case 'user_created':
      case 'user_updated':
        return <UserIcon className="h-4 w-4 text-purple-600" />;
      case 'settings_updated':
        return <CogIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-blue-50';
      case 'order_created':
      case 'order_updated':
        return 'bg-green-50';
      case 'user_created':
      case 'user_updated':
        return 'bg-purple-50';
      case 'settings_updated':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
            <p className="text-gray-600">Monitor user actions and system events</p>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {new Set(activities.filter(a => a.action === 'login').map(a => a.userId)).size}
              </p>
            </div>
            <UserIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders Created</p>
              <p className="text-2xl font-bold text-purple-600">
                {activities.filter(a => a.action === 'order_created').length}
              </p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Changes</p>
              <p className="text-2xl font-bold text-orange-600">
                {activities.filter(a => a.action.includes('settings') || a.action.includes('user')).length}
              </p>
            </div>
            <CogIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="order_created">Order Created</option>
                <option value="order_updated">Order Updated</option>
                <option value="user_created">User Created</option>
                <option value="settings_updated">Settings Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredActivities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== filteredActivities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActionColor(activity.action)}`}>
                          {getActionIcon(activity.action)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div className="flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.userName} • {activity.action.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500">{activity.details}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                              {activity.ipAddress && (
                                <span>IP: {activity.ipAddress}</span>
                              )}
                              {activity.userAgent && (
                                <span>Browser: {activity.userAgent}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp.toISOString()}>
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </time>
                            <div className="text-xs text-gray-400">
                              {format(activity.timestamp, 'MMM dd, HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}