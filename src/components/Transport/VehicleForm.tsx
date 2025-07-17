import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'bike' | 'car' | 'van' | 'truck';
  capacity: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  dailyRate?: number;
  insuranceExpiry?: Date;
  registrationExpiry?: Date;
}

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => void;
  initialData?: any;
}

export default function VehicleForm({ isOpen, onClose, onSubmit, initialData }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    defaultValues: initialData || {
      type: 'van',
      fuelType: 'diesel',
      capacity: 1000,
      year: new Date().getFullYear(),
    },
  });

  const handleFormSubmit = (data: VehicleFormData) => {
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
            {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
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
              <label className="block text-sm font-medium text-gray-700">Make *</label>
              <input
                {...register('make', { required: 'Make is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Ford, Toyota, Mercedes"
              />
              {errors.make && (
                <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Model *</label>
              <input
                {...register('model', { required: 'Model is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Transit, Camry, Sprinter"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Year *</label>
              <input
                {...register('year', {
                  required: 'Year is required',
                  min: { value: 1990, message: 'Year must be 1990 or later' },
                  max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
                })}
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">License Plate *</label>
              <input
                {...register('licensePlate', { required: 'License plate is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ABC-123"
              />
              {errors.licensePlate && (
                <p className="mt-1 text-sm text-red-600">{errors.licensePlate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Type *</label>
              <select
                {...register('type', { required: 'Vehicle type is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Type *</label>
              <select
                {...register('fuelType', { required: 'Fuel type is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {errors.fuelType && (
                <p className="mt-1 text-sm text-red-600">{errors.fuelType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity (kg) *</label>
              <input
                {...register('capacity', {
                  required: 'Capacity is required',
                  min: { value: 1, message: 'Capacity must be at least 1 kg' },
                })}
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Rate ($)</label>
              <input
                {...register('dailyRate', {
                  min: { value: 0, message: 'Daily rate cannot be negative' },
                })}
                type="number"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
              {errors.dailyRate && (
                <p className="mt-1 text-sm text-red-600">{errors.dailyRate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance Expiry</label>
              <input
                {...register('insuranceExpiry')}
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Expiry</label>
              <input
                {...register('registrationExpiry')}
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              {initialData ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}