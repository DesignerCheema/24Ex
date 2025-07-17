import React from 'react';
import { MapPinIcon, TruckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { mockAgents } from '../../data/mockData';

export default function DeliveryMap() {
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);
  const [mapView, setMapView] = React.useState<'live' | 'routes' | 'zones'>('live');

  const deliveryZones = [
    { id: '1', name: 'Manhattan', color: 'bg-blue-500', orders: 23, agents: 8 },
    { id: '2', name: 'Brooklyn', color: 'bg-green-500', orders: 18, agents: 6 },
    { id: '3', name: 'Queens', color: 'bg-yellow-500', orders: 15, agents: 5 },
    { id: '4', name: 'Bronx', color: 'bg-purple-500', orders: 12, agents: 4 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Live Delivery Map</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setMapView('live')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                mapView === 'live' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setMapView('routes')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                mapView === 'routes' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Routes
            </button>
            <button
              onClick={() => setMapView('zones')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                mapView === 'zones' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Zones
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          {/* Mock map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
          
          {/* Grid overlay for map feel */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-300"></div>
              ))}
            </div>
          </div>
          
          {/* Mock delivery agent locations */}
          {mockAgents.map((agent, index) => (
            <div
              key={agent.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                index === 0 ? 'top-1/3 left-1/4' : 
                index === 1 ? 'top-2/3 right-1/3' :
                'top-1/2 left-1/2'
              }`}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              <div className="relative">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all ${
                  agent.status === 'busy' ? 'bg-blue-600 animate-pulse' : 
                  agent.status === 'available' ? 'bg-green-600' : 'bg-gray-400'
                }`} />
                
                {selectedAgent === agent.id && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap z-10">
                    <div className="text-xs font-medium text-gray-900">{agent.name}</div>
                    <div className="text-xs text-gray-500">{agent.vehicle.make} {agent.vehicle.model}</div>
                    <div className={`text-xs font-medium ${
                      agent.status === 'busy' ? 'text-blue-600' : 
                      agent.status === 'available' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {agent.status}
                    </div>
                  </div>
                )}
                
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-1 py-0.5 rounded text-xs opacity-75">
                  {agent.name.split(' ')[0]}
                </div>
              </div>
            </div>
          ))}
          
          {mapView === 'live' && (
            <>
              {/* Mock delivery locations */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <MapPinIcon className="h-5 w-5 text-red-500 animate-bounce" />
              </div>
              <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <MapPinIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="absolute top-3/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <MapPinIcon className="h-5 w-5 text-yellow-500" />
              </div>
            </>
          )}
          
          {mapView === 'routes' && (
            <>
              {/* Mock route lines */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 60 80 Q 120 60 180 100 T 300 120"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
                <path
                  d="M 200 160 Q 250 140 300 180"
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              </svg>
            </>
          )}
          
          {mapView === 'zones' && (
            <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-2">
              {deliveryZones.map((zone, index) => (
                <div
                  key={zone.id}
                  className={`${zone.color} bg-opacity-20 border-2 border-current rounded-lg flex items-center justify-center`}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-900">{zone.name}</div>
                    <div className="text-xs text-gray-600">{zone.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Map controls */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
              +
            </button>
            <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
              -
            </button>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 animate-pulse" />
                <span>Active Agents ({mockAgents.filter(a => a.status === 'busy').length})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2" />
                <span>Available ({mockAgents.filter(a => a.status === 'available').length})</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-red-500 mr-1" />
                <span>Pending (8)</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-green-500 mr-1" />
                <span>Completed (24)</span>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              View Full Map
            </button>
          </div>
          
          {/* Real-time stats */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <TruckIcon className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">32</div>
                <div className="text-xs text-gray-500">Active Deliveries</div>
              </div>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 text-yellow-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">2.3h</div>
                <div className="text-xs text-gray-500">Avg Time</div>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900">94%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}