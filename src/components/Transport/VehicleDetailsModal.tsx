import React from 'react';
import { XMarkIcon, TruckIcon, BoltIcon, WrenchScrewdriverIcon, CalendarIcon, CurrencyDollarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format, differenceInDays } from 'date-fns';

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
}

export default function VehicleDetailsModal({ isOpen, onClose, vehicle }: VehicleDetailsModalProps) {
  if (!isOpen || !vehicle) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'out_of_service':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level >= 70) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TruckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-sm text-gray-500">{vehicle.licensePlate} • {vehicle.year}</p>
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
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
              <div className={`px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(vehicle.status)} inline-block`}>
                {vehicle.status.replace('_', ' ')}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Vehicle Type</h3>
              <p className="text-lg font-semibold text-gray-900 capitalize">{vehicle.type}</p>
              <p className="text-sm text-gray-500">{vehicle.capacity}kg capacity</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Fuel Type</h3>
              <p className="text-lg font-semibold text-gray-900 capitalize">{vehicle.fuelType}</p>
              {vehicle.fuelType !== 'electric' && (
                <p className="text-sm text-gray-500">{vehicle.fuelConsumption}L/100km</p>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{vehicle.utilizationRate}%</div>
                <div className="text-sm text-gray-600">Utilization Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{vehicle.totalTrips?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{vehicle.totalDistance?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Distance (km)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">${vehicle.maintenanceCost?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Maintenance Cost</div>
              </div>
            </div>
          </div>

          {/* Fuel and Maintenance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BoltIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Fuel Status</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Level</span>
                    <span className="text-sm font-medium text-gray-900">{vehicle.fuelLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getFuelLevelColor(vehicle.fuelLevel)}`}
                      style={{ width: `${vehicle.fuelLevel}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mileage:</span>
                    <div className="font-medium text-gray-900">{vehicle.mileage?.toLocaleString()} km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency:</span>
                    <div className="font-medium text-gray-900">
                      {vehicle.fuelType === 'electric' ? 'N/A' : `${vehicle.fuelConsumption}L/100km`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Maintenance</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className={`font-medium ${
                      vehicle.maintenanceStatus === 'good' ? 'text-green-600' :
                      vehicle.maintenanceStatus === 'needs_attention' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {vehicle.maintenanceStatus.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Cost:</span>
                    <div className="font-medium text-gray-900">${vehicle.maintenanceCost?.toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Last Service:</span>
                    <div className="font-medium text-gray-900">
                      {vehicle.lastService ? format(vehicle.lastService, 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Service:</span>
                    <div className="font-medium text-gray-900">
                      {vehicle.nextService ? format(vehicle.nextService, 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation and Compliance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Documentation & Compliance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Insurance</h4>
                {vehicle.insuranceExpiry ? (
                  <div>
                    <p className="text-sm text-gray-600">Expires: {format(vehicle.insuranceExpiry, 'MMM dd, yyyy')}</p>
                    <p className={`text-sm font-medium ${
                      differenceInDays(vehicle.insuranceExpiry, new Date()) <= 30 ? 'text-red-600' :
                      differenceInDays(vehicle.insuranceExpiry, new Date()) <= 90 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {differenceInDays(vehicle.insuranceExpiry, new Date())} days remaining
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not set</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Registration</h4>
                {vehicle.registrationExpiry ? (
                  <div>
                    <p className="text-sm text-gray-600">Expires: {format(vehicle.registrationExpiry, 'MMM dd, yyyy')}</p>
                    <p className={`text-sm font-medium ${
                      differenceInDays(vehicle.registrationExpiry, new Date()) <= 30 ? 'text-red-600' :
                      differenceInDays(vehicle.registrationExpiry, new Date()) <= 90 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {differenceInDays(vehicle.registrationExpiry, new Date())} days remaining
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not set</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Daily Rate</h4>
                <p className="text-lg font-bold text-green-600">
                  ${vehicle.dailyRate || 0}/day
                </p>
                <p className="text-sm text-gray-600">Rental rate</p>
              </div>
            </div>
          </div>

          {/* Current Location */}
          {vehicle.currentLocation && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPinIcon className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Current Location</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Coordinates:</p>
                <p className="font-medium text-gray-900">
                  {vehicle.currentLocation.lat.toFixed(6)}, {vehicle.currentLocation.lng.toFixed(6)}
                </p>
                <p className="text-sm text-gray-500 mt-2">Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Edit Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}