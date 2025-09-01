import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  TruckIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function DeliveryRoutes() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const navigate = useNavigate();

  const mockRoutes = [
    {
      id: '1',
      name: 'Manhattan Route A',
      agent: 'Mike Wilson',
      vehicle: 'Ford Transit (ABC-123)',
      stops: 8,
      distance: '45 km',
      estimatedTime: '4.5 hours',
      status: 'active',
      efficiency: 92
    },
    {
      id: '2',
      name: 'Brooklyn Route B',
      agent: 'Lisa Chen',
      vehicle: 'Mercedes Sprinter (XYZ-789)',
      stops: 6,
      distance: '38 km',
      estimatedTime: '3.8 hours',
      status: 'completed',
      efficiency: 88
    },
    {
      id: '3',
      name: 'Queens Route C',
      agent: 'Unassigned',
      vehicle: 'Toyota Hiace (DEF-456)',
      stops: 10,
      distance: '52 km',
      estimatedTime: '5.2 hours',
      status: 'planned',
      efficiency: 85
    }
  ];

  const handleOptimizeRoutes = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      alert('Routes optimized successfully! 15% improvement in efficiency.');
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/deliveries')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Route Planning</h1>
            <p className="text-gray-600">Optimize delivery routes for maximum efficiency</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleOptimizeRoutes}
            disabled={optimizing}
            className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <BoltIcon className="h-4 w-4" />
            <span>{optimizing ? 'Optimizing...' : 'Optimize All Routes'}</span>
          </button>
          <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Route Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-blue-600">{mockRoutes.filter(r => r.status === 'active').length}</p>
            </div>
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stops</p>
              <p className="text-2xl font-bold text-green-600">{mockRoutes.reduce((sum, route) => sum + route.stops, 0)}</p>
            </div>
            <MapPinIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(mockRoutes.reduce((sum, route) => sum + route.efficiency, 0) / mockRoutes.length)}%
              </p>
            </div>
            <BoltIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Time</p>
              <p className="text-2xl font-bold text-orange-600">13.5h</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Routes</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {mockRoutes.map((route) => (
            <div
              key={route.id}
              className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRoute === route.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-500">{route.vehicle}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">{route.stops} stops</span>
                      <span className="text-sm text-gray-600">{route.distance}</span>
                      <span className="text-sm text-gray-600">{route.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{route.agent}</div>
                    <div className="text-sm text-gray-500">Efficiency: {route.efficiency}%</div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </div>
              </div>
              
              {selectedRoute === route.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Route Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Start: 8:00 AM</div>
                        <div>End: 12:30 PM</div>
                        <div>Break: 30 min</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Fuel Cost: $45</div>
                        <div>Time Saved: 25 min</div>
                        <div>CO2 Reduced: 12%</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          View Map
                        </button>
                        <button className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                          Start Route
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}