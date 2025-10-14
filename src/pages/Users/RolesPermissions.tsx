import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  ArrowLeftIcon, 
  UserGroupIcon,
  CogIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { UserService } from '../../services/userService';
import { User } from '../../types';
import PermissionsModal from '../../components/Users/PermissionsModal';
import RoleAssignmentModal from '../../components/Users/RoleAssignmentModal';

export default function RolesPermissions() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isRoleAssignmentOpen, setIsRoleAssignmentOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesRole;
  });

  const handleUpdatePermissions = async (userId: string, permissions: any[]) => {
    try {
      setLoading(true);
      const updatedUser = await UserService.updateUserPermissions(userId, permissions);
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
    } catch (error) {
      console.error('Failed to update permissions:', error);
      alert('Failed to update permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: User['role'], department?: string) => {
    try {
      setLoading(true);
      const updatedUser = await UserService.updateUser(userId, { role });
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      alert(`Role updated to ${role} successfully!`);
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert('Failed to assign role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600">Manage user roles and access permissions</p>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(roleStats).map(([role, count]) => (
          <div key={role} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className={`text-sm font-medium capitalize ${getRoleColor(role).split(' ')[1]}`}>
                {role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">User Role Management</h2>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="agent">Agent</option>
              <option value="warehouse">Warehouse</option>
              <option value="accounting">Accounting</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.permissions.length} permissions</div>
                    <div className="text-sm text-gray-500">
                      {user.permissions.length > 0 ? 'Custom' : 'Role defaults'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsRoleAssignmentOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Change Role"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsPermissionsModalOpen(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 p-1"
                        title="Manage Permissions"
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isUserFormOpen}
        onClose={handleClose}
        onSubmit={handleCreateUser}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdatePermissions={handleUpdatePermissions}
      />

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={isRoleAssignmentOpen}
        onClose={() => {
          setIsRoleAssignmentOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onAssignRole={handleAssignRole}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}