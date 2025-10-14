import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BoltIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import FuelTracker from '../../components/Transport/FuelTracker';

export default function FuelTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [isFuelTrackerOpen, setIsFuelTrackerOpen] = useState(false);
  const navigate = useNavigate();

  const mockVehicles = [
    { id: '1', make: 'Ford', model: 'Transit', licensePlate: 'ABC-123' },
    { id: '2', make: 'Mercedes', model: 'Sprinter', licensePlate: 'XYZ-789' },
    { id: '3', make: 'Toyota', model: 'Hiace', licensePlate: 'DEF-456' }
  ];

  const mockFuelRecords = [
    {
      id: '1',
      vehicleId: '1',
      vehicle: 'Ford Transit (ABC-123)',
      date: new Date(),
      liters: 45,
      cost: 67.5,
      pricePerLiter: 1.5,
      mileage: 45000,
      location: 'Shell Station - Main St',
      fuelType: 'diesel'
    },
    {
      id: '2',
      vehicleId: '2',
      vehicle: 'Mercedes Sprinter (XYZ-789)',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      liters: 60,
      cost: 90,
      pricePerLiter: 1.5,
      mileage: 28000,
      location: 'BP Station - Oak Ave',
      fuelType: 'diesel'
    }
  ];

  const filteredRecords = mockFuelRecords.filter(record => {
    const matchesSearch = record.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVehicle = vehicleFilter === 'all' || record.vehicleId === vehicleFilter;
    
    return matchesSearch && matchesVehicle;
  });

  const handleAddFuelRecord = (data: any) => {
    console.log('Adding fuel record:', data);
    alert('Fuel record added successfully!');
  };

  const fuelStats = {
    totalRecords: mockFuelRecords.length,
    totalCost: mockFuelRecords.reduce((sum, record) => sum + record.cost, 0),
    totalLiters: mockFuelRecords.reduce((sum, record) => sum + record.liters, 0),
    avgPricePerLiter: mockFuelRecords.length > 0 
      ? mockFuelRecords.reduce((sum, record) => sum + record.pricePerLiter, 0) / mockFuelRecords.length 
      : 0
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
            <h1 className="text-2xl font-bold text-gray-900">Fuel Tracking</h1>
            <p className="text-gray-600">Monitor fuel consumption and costs</p>
          </div>
        </div>
        <button
          onClick={() => setIsFuelTrackerOpen(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Fuel Record</span>
        </button>
      </div>

      {/* Fuel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{fuelStats.totalRecords}</p>
            </div>
            <BoltIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-red-600">${fuelStats.totalCost.toFixed(2)}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Liters</p>
              <p className="text-2xl font-bold text-blue-600">{fuelStats.totalLiters}L</p>
            </div>
            <BoltIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price/L</p>
              <p className="text-2xl font-bold text-green-600">${fuelStats.avgPricePerLiter.toFixed(2)}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fuel records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Vehicles</option>
                {mockVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fuel Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.vehicle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(record.date, 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.liters}L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.pricePerLiter.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.mileage.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel Tracker Modal */}
      <FuelTracker
        isOpen={isFuelTrackerOpen}
        onClose={() => setIsFuelTrackerOpen(false)}
        vehicles={mockVehicles}
        onAddRecord={handleAddFuelRecord}
      />
    </div>
  );
}