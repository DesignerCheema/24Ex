import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WarehouseFormData } from '../../types/warehouse';

interface WarehouseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseFormData) => void;
  initialData?: Partial<WarehouseFormData>;
}

export default function WarehouseForm({ isOpen, onClose, onSubmit, initialData }: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WarehouseFormData>({
    defaultValues: initialData || {
      operatingHours: {
        open: '08:00',
        close: '18:00',
        timezone: 'UTC',
      },
    },
  });

  const handleFormSubmit = (data: WarehouseFormData) => {
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
            {initialData ? 'Edit Warehouse' : 'Add New Warehouse'}
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
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                {...register('name', { required: 'Warehouse name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Main Distribution Center"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Code *</label>
              <input
                {...register('code', { required: 'Warehouse code is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., WH001"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Street Address *</label>
              <input
                {...register('address.street', { required: 'Street address is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.address?.street && (
                <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                {...register('address.city', { required: 'City is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <input
                {...register('address.state', { required: 'State is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.address?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country *</label>
              <input
                {...register('address.country', { required: 'Country is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.address?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
              <input
                {...register('address.zipCode', { required: 'ZIP code is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.address?.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity (sq ft) *</label>
              <input
                {...register('capacity', {
                  required: 'Capacity is required',
                  min: { value: 1, message: 'Capacity must be greater than 0' },
                })}
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manager *</label>
              <input
                {...register('manager', { required: 'Manager name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., John Smith"
              />
              {errors.manager && (
                <p className="mt-1 text-sm text-red-600">{errors.manager.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                {...register('contactInfo.phone', { required: 'Phone is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.contactInfo?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                {...register('contactInfo.email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.contactInfo?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Opening Time *</label>
              <input
                {...register('operatingHours.open', { required: 'Opening time is required' })}
                type="time"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.operatingHours?.open && (
                <p className="mt-1 text-sm text-red-600">{errors.operatingHours.open.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Closing Time *</label>
              <input
                {...register('operatingHours.close', { required: 'Closing time is required' })}
                type="time"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.operatingHours?.close && (
                <p className="mt-1 text-sm text-red-600">{errors.operatingHours.close.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone *</label>
              <select
                {...register('operatingHours.timezone', { required: 'Timezone is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
              {errors.operatingHours?.timezone && (
                <p className="mt-1 text-sm text-red-600">{errors.operatingHours.timezone.message}</p>
              )}
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
              {initialData ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}