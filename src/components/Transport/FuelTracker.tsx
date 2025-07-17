import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FuelFormData {
  vehicleId: string;
  date: Date;
  liters: number;
  cost: number;
  pricePerLiter: number;
  mileage: number;
  location: string;
  fuelType: string;
}

interface FuelTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: any[];
  onAddRecord: (data: FuelFormData) => void;
}

export default function FuelTracker({ isOpen, onClose, vehicles, onAddRecord }: FuelTrackerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FuelFormData>();

  const liters = watch('liters');
  const cost = watch('cost');

  // Auto-calculate price per liter
  React.useEffect(() => {
    if (liters && cost) {
      setValue('pricePerLiter', cost / liters);
    }
  }, [liters, cost, setValue]);

  const handleFormSubmit = (data: FuelFormData) => {
    onAddRecord(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Add Fuel Record</h2>
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
              <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
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
              <label className="block text-sm font-medium text-gray-700">Liters *</label>
              <input
                {...register('liters', {
                  required: 'Liters is required',
                  min: { value: 0.1, message: 'Must be at least 0.1 liters' },
                })}
                type="number"
                step="0.1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.liters && (
                <p className="mt-1 text-sm text-red-600">{errors.liters.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Cost ($) *</label>
              <input
                {...register('cost', {
                  required: 'Cost is required',
                  min: { value: 0.01, message: 'Must be at least $0.01' },
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
              <label className="block text-sm font-medium text-gray-700">Price per Liter ($)</label>
              <input
                {...register('pricePerLiter')}
                type="number"
                step="0.001"
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-calculated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Mileage (km) *</label>
              <input
                {...register('mileage', {
                  required: 'Mileage is required',
                  min: { value: 0, message: 'Mileage cannot be negative' },
                })}
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.mileage && (
                <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Type *</label>
              <select
                {...register('fuelType', { required: 'Fuel type is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select fuel type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric (kWh)</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {errors.fuelType && (
                <p className="mt-1 text-sm text-red-600">{errors.fuelType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Shell Station - Main St"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Quick Fill Buttons */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Quick Fill Options</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue('liters', 20);
                  setValue('cost', 30);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                20L / $30
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('liters', 40);
                  setValue('cost', 60);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                40L / $60
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('liters', 60);
                  setValue('cost', 90);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                60L / $90
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('liters', 80);
                  setValue('cost', 120);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                80L / $120
              </button>
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
              Add Fuel Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}