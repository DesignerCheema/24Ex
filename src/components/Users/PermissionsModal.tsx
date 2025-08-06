import React, { useState } from 'react';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { User, Permission } from '../../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdatePermissions: (userId: string, permissions: Permission[]) => void;
}

const AVAILABLE_PERMISSIONS = [
  // Orders
  { resource: 'orders', action: 'create', name: 'Create Orders', description: 'Create new delivery orders' },
  { resource: 'orders', action: 'read', name: 'View Orders', description: 'View order details and lists' },
  { resource: 'orders', action: 'update', name: 'Update Orders', description: 'Modify existing orders' },
  { resource: 'orders', action: 'delete', name: 'Delete Orders', description: 'Remove orders from system' },
  { resource: 'orders', action: 'export', name: 'Export Orders', description: 'Export order data' },

  // Deliveries
  { resource: 'deliveries', action: 'create', name: 'Assign Deliveries', description: 'Assign deliveries to agents' },
  { resource: 'deliveries', action: 'read', name: 'View Deliveries', description: 'View delivery information' },
  { resource: 'deliveries', action: 'update', name: 'Update Deliveries', description: 'Update delivery status' },

  // Inventory
  { resource: 'inventory', action: 'create', name: 'Add Inventory', description: 'Add new inventory items' },
  { resource: 'inventory', action: 'read', name: 'View Inventory', description: 'View inventory levels' },
  { resource: 'inventory', action: 'update', name: 'Update Inventory', description: 'Modify inventory quantities' },
  { resource: 'inventory', action: 'delete', name: 'Remove Inventory', description: 'Remove inventory items' },

  // Warehouses
  { resource: 'warehouses', action: 'create', name: 'Create Warehouses', description: 'Add new warehouse locations' },
  { resource: 'warehouses', action: 'read', name: 'View Warehouses', description: 'View warehouse information' },
  { resource: 'warehouses', action: 'update', name: 'Update Warehouses', description: 'Modify warehouse details' },
  { resource: 'warehouses', action: 'delete', name: 'Delete Warehouses', description: 'Remove warehouses' },

  // Vehicles
  { resource: 'vehicles', action: 'create', name: 'Add Vehicles', description: 'Add vehicles to fleet' },
  { resource: 'vehicles', action: 'read', name: 'View Vehicles', description: 'View fleet information' },
  { resource: 'vehicles', action: 'update', name: 'Update Vehicles', description: 'Modify vehicle details' },
  { resource: 'vehicles', action: 'delete', name: 'Remove Vehicles', description: 'Remove vehicles from fleet' },

  // Customers
  { resource: 'customers', action: 'create', name: 'Add Customers', description: 'Add new customers' },
  { resource: 'customers', action: 'read', name: 'View Customers', description: 'View customer information' },
  { resource: 'customers', action: 'update', name: 'Update Customers', description: 'Modify customer details' },
  { resource: 'customers', action: 'delete', name: 'Delete Customers', description: 'Remove customers' },

  // Invoices
  { resource: 'invoices', action: 'create', name: 'Create Invoices', description: 'Generate invoices' },
  { resource: 'invoices', action: 'read', name: 'View Invoices', description: 'View invoice details' },
  { resource: 'invoices', action: 'update', name: 'Update Invoices', description: 'Modify invoices' },
  { resource: 'invoices', action: 'delete', name: 'Delete Invoices', description: 'Remove invoices' },

  // Returns
  { resource: 'returns', action: 'create', name: 'Create Returns', description: 'Process return requests' },
  { resource: 'returns', action: 'read', name: 'View Returns', description: 'View return information' },
  { resource: 'returns', action: 'update', name: 'Update Returns', description: 'Modify return status' },
  { resource: 'returns', action: 'delete', name: 'Delete Returns', description: 'Remove return requests' },

  // Analytics
  { resource: 'analytics', action: 'read', name: 'View Analytics', description: 'Access analytics dashboard' },
  { resource: 'reports', action: 'export', name: 'Export Reports', description: 'Export system reports' },

  // Users
  { resource: 'users', action: 'create', name: 'Create Users', description: 'Add new users to system' },
  { resource: 'users', action: 'read', name: 'View Users', description: 'View user information' },
  { resource: 'users', action: 'update', name: 'Update Users', description: 'Modify user details' },
  { resource: 'users', action: 'delete', name: 'Delete Users', description: 'Remove users from system' },

  // Settings
  { resource: 'settings', action: 'read', name: 'View Settings', description: 'View system settings' },
  { resource: 'settings', action: 'update', name: 'Update Settings', description: 'Modify system settings' },
  { resource: 'security', action: 'read', name: 'View Security', description: 'View security settings' },
  { resource: 'security', action: 'update', name: 'Update Security', description: 'Modify security settings' },
  { resource: 'system', action: 'read', name: 'View System', description: 'View system information' },
  { resource: 'system', action: 'update', name: 'Update System', description: 'Modify system configuration' },
  { resource: 'backup', action: 'create', name: 'Create Backups', description: 'Create system backups' },
  { resource: 'backup', action: 'read', name: 'View Backups', description: 'View backup information' },
];

export default function PermissionsModal({ isOpen, onClose, user, onUpdatePermissions }: PermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions);
    }
  }, [user]);

  const handlePermissionToggle = (permission: typeof AVAILABLE_PERMISSIONS[0]) => {
    const permissionKey = `${permission.resource}-${permission.action}`;
    const exists = selectedPermissions.some(p => p.resource === permission.resource && p.action === permission.action);

    if (exists) {
      setSelectedPermissions(prev => 
        prev.filter(p => !(p.resource === permission.resource && p.action === permission.action))
      );
    } else {
      const newPermission: Permission = {
        id: permissionKey,
        name: permission.name,
        resource: permission.resource,
        action: permission.action as any
      };
      setSelectedPermissions(prev => [...prev, newPermission]);
    }
  };

  const handleSave = () => {
    if (user) {
      onUpdatePermissions(user.id, selectedPermissions);
      onClose();
    }
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
              <p className="text-sm text-gray-500">{user.name} ({user.role})</p>
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
          {Object.entries(groupedPermissions).map(([resource, permissions]) => (
            <div key={resource} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                {resource} Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((permission) => {
                  const isSelected = selectedPermissions.some(p => 
                    p.resource === permission.resource && p.action === permission.action
                  );
                  
                  return (
                    <label
                      key={`${permission.resource}-${permission.action}`}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePermissionToggle(permission)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedPermissions.length} permissions selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}