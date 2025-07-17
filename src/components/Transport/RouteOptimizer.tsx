import React, { useState } from 'react';
import { XMarkIcon, MapPinIcon, TruckIcon, ClockIcon, BoltIcon } from '@heroicons/react/24/outline';

interface RouteOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: any[];
}

export default function RouteOptimizer({ isOpen, onClose, vehicles }: RouteOptimizerProps) {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [optimizationSettings, setOptimizationSettings] = useState({
    prioritizeTime: true,
    prioritizeFuel: false,
    prioritizeDistance: false,
    considerTraffic: true,
    timeWindows: true,
  });

  const handleOptimize = () => {
    // Mock optimization logic
    alert(`Route optimization completed for ${selectedVehicles.length} vehicles!\n\nResults:\n• 25% reduction in travel time\n• 18% fuel savings\n• 32% more deliveries per day`);
    onClose();
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MapPinIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Route Optimization</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vehicle Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Vehicles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVehicles.includes(vehicle.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleVehicleSelection(vehicle.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => toggleVehicleSelection(vehicle.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                      <div className="text-sm text-gray-500">{vehicle.licensePlate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Priority</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      checked={optimizationSettings.prioritizeTime}
                      onChange={() => setOptimizationSettings(prev => ({
                        ...prev,
                        prioritizeTime: true,
                        prioritizeFuel: false,
                        prioritizeDistance: false
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Minimize Travel Time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      checked={optimizationSettings.prioritizeFuel}
                      onChange={() => setOptimizationSettings(prev => ({
                        ...prev,
                        prioritizeTime: false,
                        prioritizeFuel: true,
                        prioritizeDistance: false
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Minimize Fuel Consumption</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      checked={optimizationSettings.prioritizeDistance}
                      onChange={() => setOptimizationSettings(prev => ({
                        ...prev,
                        prioritizeTime: false,
                        prioritizeFuel: false,
                        prioritizeDistance: true
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Minimize Total Distance</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Additional Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={optimizationSettings.considerTraffic}
                      onChange={(e) => setOptimizationSettings(prev => ({
                        ...prev,
                        considerTraffic: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Consider Real-time Traffic</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={optimizationSettings.timeWindows}
                      onChange={(e) => setOptimizationSettings(prev => ({
                        ...prev,
                        timeWindows: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Respect Delivery Time Windows</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Benefits */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Expected Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">25%</div>
                  <div className="text-sm text-green-800">Time Reduction</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BoltIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">18%</div>
                  <div className="text-sm text-green-800">Fuel Savings</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">32%</div>
                  <div className="text-sm text-green-800">More Deliveries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Route Summary */}
          {selectedVehicles.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Route Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Selected Vehicles:</span>
                  <div className="font-medium text-blue-900">{selectedVehicles.length}</div>
                </div>
                <div>
                  <span className="text-blue-700">Total Stops:</span>
                  <div className="font-medium text-blue-900">{selectedVehicles.length * 8}</div>
                </div>
                <div>
                  <span className="text-blue-700">Estimated Distance:</span>
                  <div className="font-medium text-blue-900">245 km</div>
                </div>
                <div>
                  <span className="text-blue-700">Estimated Time:</span>
                  <div className="font-medium text-blue-900">6.5 hours</div>
                </div>
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
            onClick={handleOptimize}
            disabled={selectedVehicles.length === 0}
            className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Optimize Routes ({selectedVehicles.length} vehicles)
          </button>
        </div>
      </div>
    </div>
  );
}