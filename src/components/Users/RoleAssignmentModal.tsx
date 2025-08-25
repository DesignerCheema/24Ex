import React, { useState } from 'react';
import { XMarkIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { User } from '../../types';

interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onAssignRole: (userId: string, role: User['role'], department?: string) => void;
}

const ROLE_DESCRIPTIONS = {
  admin: {
    title: 'Administrator',
    description: 'Full system access and user management',
    permissions: ['All system modules', 'User management', 'System settings', 'Data export'],
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  dispatcher: {
    title: 'Dispatcher',
    description: 'Order and delivery coordination',
    permissions: ['Orders management', 'Delivery assignment', 'Route planning', 'Customer communication'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  agent: {
    title: 'Delivery Agent',
    description: 'Field delivery operations',
    permissions: ['Delivery updates', 'Order status', 'Customer contact', 'Route tracking'],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  warehouse: {
    title: 'Warehouse Staff',
    description: 'Inventory and warehouse management',
    permissions: ['Inventory management', 'Stock movements', 'Picking tasks', 'Receiving'],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  accounting: {
    title: 'Accounting',
    description: 'Financial operations and reporting',
    permissions: ['Invoice management', 'Payment processing', 'Financial reports', 'Customer billing'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

export default function RoleAssignmentModal({ isOpen, onClose, user, onAssignRole }: RoleAssignmentModalProps) {
  const [selectedRole, setSelectedRole] = useState<User['role'] | ''>('');
  const [department, setDepartment] = useState('');

  const handleAssign = () => {
    if (user && selectedRole) {
      onAssignRole(user.id, selectedRole, department || undefined);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Role</h2>
              <p className="text-sm text-gray-500">{user.name} ({user.email})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Current Role</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ROLE_DESCRIPTIONS[user.role as keyof typeof ROLE_DESCRIPTIONS]?.bgColor || 'bg-gray-50'
              } ${
                ROLE_DESCRIPTIONS[user.role as keyof typeof ROLE_DESCRIPTIONS]?.color || 'text-gray-600'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span className="text-sm text-blue-800">
                {ROLE_DESCRIPTIONS[user.role as keyof typeof ROLE_DESCRIPTIONS]?.description || 'Standard user access'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ROLE_DESCRIPTIONS).map(([roleKey, roleInfo]) => (
                <div
                  key={roleKey}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === roleKey
                      ? `${roleInfo.borderColor} ${roleInfo.bgColor}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRole(roleKey as User['role'])}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="radio"
                      name="role"
                      value={roleKey}
                      checked={selectedRole === roleKey}
                      onChange={() => setSelectedRole(roleKey as User['role'])}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                      <h4 className={`font-medium ${roleInfo.color}`}>{roleInfo.title}</h4>
                      <p className="text-sm text-gray-600">{roleInfo.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Key Permissions:</div>
                    {roleInfo.permissions.map((permission, index) => (
                      <div key={index} className="text-xs text-gray-600">• {permission}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRole && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department (Optional)
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select department</option>
                <option value="operations">Operations</option>
                <option value="logistics">Logistics</option>
                <option value="customer_service">Customer Service</option>
                <option value="finance">Finance</option>
                <option value="it">IT</option>
                <option value="management">Management</option>
              </select>
            </div>
          )}

          {selectedRole && (
            <div className={`p-4 rounded-lg border ${
              ROLE_DESCRIPTIONS[selectedRole as keyof typeof ROLE_DESCRIPTIONS]?.borderColor
            } ${
              ROLE_DESCRIPTIONS[selectedRole as keyof typeof ROLE_DESCRIPTIONS]?.bgColor
            }`}>
              <h4 className="font-medium text-gray-900 mb-2">Role Change Summary</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">From:</span>
                  <span className="ml-2 font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </div>
                <div>
                  <span className="text-gray-600">To:</span>
                  <span className="ml-2 font-medium">{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                </div>
                {department && (
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2 font-medium capitalize">{department.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedRole}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign Role
          </button>
        </div>
      </div>
    </div>
  );
}