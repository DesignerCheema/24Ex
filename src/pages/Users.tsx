import React, { useState, useEffect, useMemo } from 'react';
import {
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';
import { UserService } from '../services/userService';
import UserForm from '../components/Users/UserForm';
import UserViewModal from '../components/Users/UserViewModal';
import PermissionsModal from '../components/Users/PermissionsModal';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isUserViewOpen, setIsUserViewOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const { hasPermission, state } = useAuth();

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && user.isActive) ||
                           (statusFilter === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleCreateUser = async (data: any) => {
    try {
      setLoading(true);
      const newUser = await UserService.createUser(data);
      setUsers([newUser, ...users]);
      
      // Send welcome email with temporary password
      alert(`User created successfully! A welcome email with login credentials has been sent to ${data.email}`);
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;

    try {
      setLoading(true);
      const updatedUser = await UserService.updateUser(editingUser.id, data);
      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === state.user?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await UserService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      setLoading(true);
      const updatedUser = await UserService.updateUserStatus(userId, !user.isActive);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleResetPassword = async (userId: string) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        setLoading(true);
        await UserService.resetUserPassword(userId);
        alert('Password reset email sent successfully.');
      } catch (error) {
        console.error('Failed to reset password:', error);
        alert('Failed to reset password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    const usersToDelete = selectedUsers.filter(id => id !== state.user?.id);
    if (usersToDelete.length === 0) {
      alert('Cannot delete selected users.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${usersToDelete.length} selected users?`)) {
      try {
        setLoading(true);
        await UserService.deleteUsers(usersToDelete);
        setUsers(users.filter(user => !usersToDelete.includes(user.id)));
        setSelectedUsers([]);
      } catch (error) {
        console.error('Failed to delete users:', error);
        alert('Failed to delete users. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
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

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length,
    recentLogins: users.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage staff accounts, roles, and permissions</p>
          <p className="text-sm text-blue-600 mt-1">
            Customer accounts are created through public registration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-700 flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete ({selectedUsers.length})</span>
            </button>
          )}

          {hasPermission('users', 'create') && (
            <button
              onClick={() => {
                setEditingUser(null);
                setIsUserFormOpen(true);
              }}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Users</p>
              <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role !== 'customer').length}</p>
            </div>
            <UserIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'customer').length}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Logins</p>
              <p className="text-2xl font-bold text-green-600">{userStats.recentLogins}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
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
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <EnvelopeIcon className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <PhoneIcon className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? format(user.lastLogin, 'MMM dd, yyyy HH:mm') : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(user.createdAt, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setViewingUser(user);
                          setIsUserViewOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View User"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {hasPermission('users', 'update') && (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsUserFormOpen(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setPermissionsUser(user);
                              setIsPermissionsModalOpen(true);
                            }}
                            className="text-purple-600 hover:text-purple-800 p-1"
                            title="Manage Permissions"
                          >
                            <ShieldCheckIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="Reset Password"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`p-1 ${user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                      
                      {hasPermission('users', 'delete') && user.id !== state.user?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete User"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or add a new user.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
            {selectedUsers.length > 0 && ` (${selectedUsers.length} selected)`}
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        initialData={editingUser}
      />

      {/* User View Modal */}
      <UserViewModal
        isOpen={isUserViewOpen}
        onClose={() => {
          setIsUserViewOpen(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setPermissionsUser(null);
        }}
        user={permissionsUser}
        onUpdatePermissions={handleUpdatePermissions}
      />

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={isRoleAssignmentOpen}
        onClose={() => {
          setIsRoleAssignmentOpen(false);
          setRoleAssignmentUser(null);
        }}
        user={roleAssignmentUser}
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