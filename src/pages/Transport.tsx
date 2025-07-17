import React, { useState, useMemo } from 'react';
import { 
  TruckIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import VehicleForm from '../components/Transport/VehicleForm';
import VehicleDetailsModal from '../components/Transport/VehicleDetailsModal';
import FuelTracker from '../components/Transport/FuelTracker';
import MaintenanceScheduler from '../components/Transport/MaintenanceScheduler';
import RouteOptimizer from '../components/Transport/RouteOptimizer';
import { exportVehiclesToPDF, exportVehiclesToExcel, exportVehiclesToCSV } from '../utils/transportExportUtils';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays } from 'date-fns';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'bike' | 'car' | 'van' | 'truck';
  capacity: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  status: 'active' | 'maintenance' | 'inactive' | 'out_of_service';
  utilizationRate: number;
  mileage: number;
  fuelLevel: number;
  maintenanceStatus: 'good' | 'needs_attention' | 'maintenance';
  maintenanceCost: number;
  dailyRate: number;
  totalTrips: number;
  totalDistance: number;
  fuelConsumption: number;
  lastService?: Date;
  nextService?: Date;
  insuranceExpiry?: Date;
  registrationExpiry?: Date;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export default function Transport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFuelTrackerOpen, setIsFuelTrackerOpen] = useState(false);
  const [isMaintenanceSchedulerOpen, setIsMaintenanceSchedulerOpen] = useState(false);
  const [isRouteOptimizerOpen, setIsRouteOptimizerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      make: 'Ford',
      model: 'Transit',
      year: 2022,
      licensePlate: 'ABC-123',
      type: 'van',
      capacity: 1500,
      fuelType: 'diesel',
      status: 'active',
      utilizationRate: 85,
      mileage: 45000,
      fuelLevel: 75,
      maintenanceStatus: 'good',
      maintenanceCost: 2500,
      dailyRate: 120,
      totalTrips: 1247,
      totalDistance: 45000,
      fuelConsumption: 8.5,
      lastService: new Date('2024-01-15'),
      nextService: addDays(new Date(), 30),
      insuranceExpiry: addDays(new Date(), 180),
      registrationExpiry: addDays(new Date(), 365),
      currentLocation: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: '2',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2023,
      licensePlate: 'XYZ-789',
      type: 'van',
      capacity: 2000,
      fuelType: 'diesel',
      status: 'active',
      utilizationRate: 92,
      mileage: 28000,
      fuelLevel: 45,
      maintenanceStatus: 'needs_attention',
      maintenanceCost: 1800,
      dailyRate: 150,
      totalTrips: 892,
      totalDistance: 28000,
      fuelConsumption: 9.2,
      lastService: new Date('2024-01-10'),
      nextService: addDays(new Date(), 15),
      insuranceExpiry: addDays(new Date(), 120),
      registrationExpiry: addDays(new Date(), 300),
      currentLocation: { lat: 34.0522, lng: -118.2437 }
    },
    {
      id: '3',
      make: 'Toyota',
      model: 'Hiace',
      year: 2021,
      licensePlate: 'DEF-456',
      type: 'van',
      capacity: 1200,
      fuelType: 'petrol',
      status: 'maintenance',
      utilizationRate: 0,
      mileage: 62000,
      fuelLevel: 30,
      maintenanceStatus: 'maintenance',
      maintenanceCost: 3200,
      dailyRate: 100,
      totalTrips: 1456,
      totalDistance: 62000,
      fuelConsumption: 10.5,
      lastService: new Date('2024-01-20'),
      nextService: new Date(),
      insuranceExpiry: addDays(new Date(), 90),
      registrationExpiry: addDays(new Date(), 200),
      currentLocation: { lat: 41.8781, lng: -87.6298 }
    }
  ]);

  const { hasPermission } = useAuth();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  const handleCreateVehicle = (data: any) => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      ...data,
      status: 'active',
      utilizationRate: 0,
      mileage: 0,
      fuelLevel: 100,
      maintenanceStatus: 'good',
      maintenanceCost: 0,
      totalTrips: 0,
      totalDistance: 0,
      fuelConsumption: data.fuelType === 'electric' ? 0 : 8.5,
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const handleUpdateVehicle = (data: any) => {
    if (!editingVehicle) return;
    
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === editingVehicle.id 
        ? { ...vehicle, ...data }
        : vehicle
    ));
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedVehicles.length} selected vehicles?`)) {
      setVehicles(vehicles.filter(vehicle => !selectedVehicles.includes(vehicle.id)));
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(filteredVehicles.map(vehicle => vehicle.id));
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const vehiclesToExport = selectedVehicles.length > 0 
      ? vehicles.filter(vehicle => selectedVehicles.includes(vehicle.id))
      : filteredVehicles;

    switch (format) {
      case 'pdf':
        exportVehiclesToPDF(vehiclesToExport, 'Fleet Report');
        break;
      case 'excel':
        exportVehiclesToExcel(vehiclesToExport, 'fleet-export');
        break;
      case 'csv':
        exportVehiclesToCSV(vehiclesToExport, 'fleet-export');
        break;
    }
    
    setShowExportMenu(false);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleFormOpen(true);
  };

  const handleAddFuelRecord = (data: any) => {
    // Update vehicle fuel level and mileage
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === data.vehicleId 
        ? { 
            ...vehicle, 
            fuelLevel: Math.min(100, vehicle.fuelLevel + (data.liters / 60) * 100),
            mileage: data.mileage,
            maintenanceCost: vehicle.maintenanceCost + data.cost
          }
        : vehicle
    ));
  };

  const handleScheduleMaintenance = (data: any) => {
    // Update vehicle maintenance status
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === data.vehicleId 
        ? { 
            ...vehicle, 
            maintenanceStatus: 'maintenance',
            status: data.type === 'emergency' ? 'out_of_service' : vehicle.status,
            maintenanceCost: vehicle.maintenanceCost + data.cost,
            nextService: data.nextDue ? new Date(data.nextDue) : vehicle.nextService
          }
        : vehicle
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'needs_attention':
        return 'text-yellow-600';
      case 'maintenance':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level >= 70) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const fleetStats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    avgUtilization: Math.round(vehicles.reduce((sum, v) => sum + v.utilizationRate, 0) / vehicles.length),
    totalCost: vehicles.reduce((sum, v) => sum + v.maintenanceCost, 0),
    lowFuel: vehicles.filter(v => v.fuelLevel < 30).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Manage vehicles, maintenance, and fuel tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedVehicles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-700 flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete ({selectedVehicles.length})</span>
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFuelTrackerOpen(true)}
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
          >
            <BoltIcon className="h-4 w-4" />
            <span>Add Fuel</span>
          </button>

          <button
            onClick={() => setIsMaintenanceSchedulerOpen(true)}
            className="bg-yellow-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-yellow-700 flex items-center space-x-2"
          >
            <WrenchScrewdriverIcon className="h-4 w-4" />
            <span>Maintenance</span>
          </button>

          <button
            onClick={() => setIsRouteOptimizerOpen(true)}
            className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-purple-700 flex items-center space-x-2"
          >
            <MapPinIcon className="h-4 w-4" />
            <span>Optimize</span>
          </button>

          {hasPermission('vehicles', 'create') && (
            <button
              onClick={() => {
                setEditingVehicle(null);
                setIsVehicleFormOpen(true);
              }}
              className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{fleetStats.total}</p>
            </div>
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{fleetStats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{fleetStats.maintenance}</p>
            </div>
            <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold text-blue-600">{fleetStats.avgUtilization}%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Cost</p>
              <p className="text-2xl font-bold text-red-600">${fleetStats.totalCost.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Fuel</p>
              <p className="text-2xl font-bold text-orange-600">{fleetStats.lowFuel}</p>
            </div>
            <BoltIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_service">Out of Service</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleSelectVehicle(vehicle.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <TruckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.licensePlate} • {vehicle.year}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{vehicle.utilizationRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${vehicle.utilizationRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{vehicle.fuelLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getFuelLevelColor(vehicle.fuelLevel)}`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getMaintenanceColor(vehicle.maintenanceStatus)}`}>
                      {vehicle.maintenanceStatus.replace('_', ' ')}
                    </div>
                    {vehicle.nextService && (
                      <div className="text-xs text-gray-500">
                        Next: {format(vehicle.nextService, 'MMM dd')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.mileage.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(vehicle)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {hasPermission('vehicles', 'update') && (
                        <button
                          onClick={() => handleEditVehicle(vehicle)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Edit Vehicle"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('vehicles', 'delete') && (
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Vehicle"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="p-12 text-center">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or add a new vehicle.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
            {selectedVehicles.length > 0 && ` (${selectedVehicles.length} selected)`}
          </div>
        </div>
      </div>

      {/* Vehicle Form Modal */}
      <VehicleForm
        isOpen={isVehicleFormOpen}
        onClose={() => {
          setIsVehicleFormOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={editingVehicle ? handleUpdateVehicle : handleCreateVehicle}
        initialData={editingVehicle}
      />

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
      />

      {/* Fuel Tracker Modal */}
      <FuelTracker
        isOpen={isFuelTrackerOpen}
        onClose={() => setIsFuelTrackerOpen(false)}
        vehicles={vehicles}
        onAddRecord={handleAddFuelRecord}
      />

      {/* Maintenance Scheduler Modal */}
      <MaintenanceScheduler
        isOpen={isMaintenanceSchedulerOpen}
        onClose={() => setIsMaintenanceSchedulerOpen(false)}
        vehicles={vehicles}
        onSchedule={handleScheduleMaintenance}
      />

      {/* Route Optimizer Modal */}
      <RouteOptimizer
        isOpen={isRouteOptimizerOpen}
        onClose={() => setIsRouteOptimizerOpen(false)}
        vehicles={vehicles.filter(v => v.status === 'active')}
      />
    </div>
  );
}