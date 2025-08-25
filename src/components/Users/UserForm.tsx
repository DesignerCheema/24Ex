import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { User, Permission } from '../../types';
import { UserFormData } from '../../services/userService';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: User | null;
}

export default function UserForm({ isOpen, onClose, onSubmit, initialData }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      role: initialData.role,
      phone: initialData.phone,
      isActive: initialData.isActive,
    } : {
      role: 'agent',
      isActive: true,
    },
  });

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role *</label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="agent">Delivery Agent</option>
                <option value="warehouse">Warehouse Staff</option>
                <option value="accounting">Accounting</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Customer accounts are created through public registration
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                {...register('department')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Supervisor</label>
              <input
                {...register('supervisor')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter supervisor name"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Inactive users cannot log in to the system
              </p>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Role Responsibilities</h3>
            <div className="text-sm text-blue-800">
              <div className="space-y-1">
                <div>• Access will be granted based on role</div>
                <div>• Permissions can be customized after creation</div>
                <div>• Default permissions will be applied automatically</div>
                <div>• Contact admin for special access requirements</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}