import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { mockAgents } from '../../data/mockData';

export default function DeliveryAgents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <h1 className="text-2xl font-bold text-gray-900">Delivery Agents</h1>
            <p className="text-gray-600">Manage delivery agents and their assignments</p>
          </div>
        </div>
        <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Agent</span>
        </button>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{mockAgents.length}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{mockAgents.filter(a => a.status === 'available').length}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Delivery</p>
              <p className="text-2xl font-bold text-blue-600">{mockAgents.filter(a => a.status === 'busy').length}</p>
            </div>
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(mockAgents.reduce((sum, agent) => sum + agent.rating, 0) / mockAgents.length).toFixed(1)}
              </p>
            </div>
            <div className="text-yellow-600 text-2xl">⭐</div>
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
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className={`p-6 border rounded-lg cursor-pointer transition-all ${
                  selectedAgent === agent.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <span className="text-sm font-medium text-yellow-600">⭐ {agent.rating}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Deliveries:</span>
                    <span className="text-sm font-medium text-gray-900">{agent.completedDeliveries}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <span className="text-sm font-medium text-gray-900">{agent.vehicle.make} {agent.vehicle.model}</span>
                  </div>
                </div>

                {selectedAgent === agent.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{agent.phone}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        Assign Route
                      </button>
                      <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        Contact
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}