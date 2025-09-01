import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TruckIcon } from '@heroicons/react/24/outline';
import VehicleForm from '../../components/Transport/VehicleForm';

export default function AddVehicle() {
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateVehicle = async (data: any) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Vehicle added successfully!');
      navigate('/transport');
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      alert('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/transport');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/transport')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
            <p className="text-gray-600">Add a new vehicle to your fleet</p>
          </div>
        </div>
      </div>

      {/* Vehicle Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Vehicle Registration Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div>• Ensure all vehicle documents are valid</div>
            <div>• Vehicle must pass safety inspection</div>
            <div>• Insurance must be current and comprehensive</div>
          </div>
          <div className="space-y-2">
            <div>• License plate must be registered</div>
            <div>• Vehicle capacity should match business needs</div>
            <div>• Fuel type affects route assignments</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-500">Current Fleet Size</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">2</div>
          <div className="text-sm text-gray-500">Active Vehicles</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">1</div>
          <div className="text-sm text-gray-500">In Maintenance</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">78%</div>
          <div className="text-sm text-gray-500">Avg Utilization</div>
        </div>
      </div>

      {/* Vehicle Form */}
      <VehicleForm
        isOpen={isVehicleFormOpen}
        onClose={handleClose}
        onSubmit={handleCreateVehicle}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Adding vehicle...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}