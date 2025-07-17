import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface MaintenanceFormData {
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  date: Date;
  nextDue?: Date;
  mechanic?: string;
  notes?: string;
}

interface MaintenanceSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: any[];
  onSchedule: (data: MaintenanceFormData) => void;
}

export default function MaintenanceScheduler({ isOpen, onClose, vehicles, onSchedule }: MaintenanceSchedulerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MaintenanceFormData>();

  const handleFormSubmit = (data: MaintenanceFormData) => {
    onSchedule(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Maintenance</h2>
          </div>
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
              <label className="block text-sm font-medium text-gray-700">Vehicle *</label>
              <select
                {...register('vehicleId', { required: 'Vehicle is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maintenance Type *</label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                <option value="routine">Routine Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <input
                {...register('description', { required: 'Description is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Oil change and filter replacement"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Cost ($) *</label>
              <input
                {...register('cost', {
                  required: 'Cost is required',
                  min: { value: 0, message: 'Cost cannot be negative' },
                })}
                type="number"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date *</label>
              <input
                {...register('date', { required: 'Date is required' })}
                type="datetime-local"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
              <input
                {...register('nextDue')}
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Mechanic</label>
              <input
                {...register('mechanic')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., John Smith"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes or special instructions..."
              />
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
              Schedule Maintenance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}