import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { mockOrders, mockAgents } from '../data/mockData';
import { Order, DeliveryAgent } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { OrderService } from '../services/orderService';
import { exportOrdersToPDF, exportOrdersToExcel, exportOrdersToCSV } from '../utils/exportUtils';

interface DeliveryAssignment {
  id: string;
  orderId: string;
  agentId: string;
  assignedAt: Date;
  estimatedDelivery: Date;
  status: 'assigned' | 'in_transit' | 'delivered' | 'failed';
  notes?: string;
}

export default function Deliveries() {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [agents, setAgents] = useState<DeliveryAgent[]>(mockAgents);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();

  // Load data on component mount
  useEffect(() => {
    loadOrders();
    generateMockAssignments();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await OrderService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAssignments = () => {
    const mockAssignments: DeliveryAssignment[] = mockOrders
      .filter(order => order.status === 'shipped' || order.status === 'processing')
      .map((order, index) => ({
        id: `assign-${order.id}`,
        orderId: order.id,
        agentId: mockAgents[index % mockAgents.length].id,
        assignedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000),
        status: Math.random() > 0.7 ? 'delivered' : Math.random() > 0.5 ? 'in_transit' : 'assigned',
        notes: Math.random() > 0.7 ? 'Customer requested specific time slot' : undefined
      }));
    setAssignments(mockAssignments);
  };

  const activeDeliveries = useMemo(() => {
    return orders.filter(order => 
      order.status === 'shipped' || order.status === 'processing'
    );
  }, [orders]);

  const filteredDeliveries = useMemo(() => {
    return activeDeliveries.filter(delivery => {
      const matchesSearch = delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || delivery.priority === priorityFilter;
      
      const assignment = assignments.find(a => a.orderId === delivery.id);
      const matchesAgent = agentFilter === 'all' || 
                          (assignment && assignment.agentId === agentFilter);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    });
  }, [activeDeliveries, searchTerm, statusFilter, priorityFilter, agentFilter, assignments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <MapPinIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAssignmentStatus = (orderId: string) => {
    const assignment = assignments.find(a => a.orderId === orderId);
    return assignment?.status || 'unassigned';
  };

  const getAssignedAgent = (orderId: string) => {
    const assignment = assignments.find(a => a.orderId === orderId);
    if (!assignment) return null;
    return agents.find(agent => agent.id === assignment.agentId);
  };

  const handleAssignDelivery = (orderId: string, agentId: string) => {
    const newAssignment: DeliveryAssignment = {
      id: `assign-${Date.now()}`,
      orderId,
      agentId,
      assignedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      status: 'assigned'
    };
    
    setAssignments(prev => [...prev.filter(a => a.orderId !== orderId), newAssignment]);
    setShowAssignModal(false);
  };

  const handleUpdateDeliveryStatus = (orderId: string, status: DeliveryAssignment['status']) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.orderId === orderId 
          ? { ...assignment, status }
          : assignment
      )
    );
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const deliveriesToExport = filteredDeliveries;

    switch (format) {
      case 'pdf':
        exportOrdersToPDF(deliveriesToExport, 'Deliveries Report');
        break;
      case 'excel':
        exportOrdersToExcel(deliveriesToExport, 'deliveries-export');
        break;
      case 'csv':
        exportOrdersToCSV(deliveriesToExport, 'deliveries-export');
        break;
    }
    
    setShowExportMenu(false);
  };

  const optimizeRoutes = () => {
    // Mock route optimization
    alert('Route optimization completed! 15 deliveries optimized for efficiency.');
    setShowRouteOptimizer(false);
  };

  const deliveryStats = {
    active: activeDeliveries.length,
    completed: orders.filter(o => o.status === 'delivered').length,
    failed: orders.filter(o => o.status === 'cancelled').length,
    available: agents.filter(a => a.status === 'available').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600">Track and manage all delivery operations</p>
        </div>
        <div className="flex space-x-3">
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
            onClick={() => setShowRouteOptimizer(true)}
            className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-purple-700 flex items-center space-x-2"
          >
            <MapPinIcon className="h-4 w-4" />
            <span>Route Optimizer</span>
          </button>
          
          {hasPermission('deliveries', 'create') && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Assign Delivery</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryStats.active}</p>
              <p className="text-sm text-blue-600">In progress</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryStats.completed}</p>
              <p className="text-sm text-green-600">Successfully delivered</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Agents</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryStats.available}</p>
              <p className="text-sm text-yellow-600">Ready for assignment</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <UserIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveryStats.failed}</p>
              <p className="text-sm text-red-600">Requires attention</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
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
                  placeholder="Search deliveries..."
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
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="divide-y divide-gray-200">
          {filteredDeliveries.map((delivery) => {
            const assignment = assignments.find(a => a.orderId === delivery.id);
            const assignedAgent = assignment ? agents.find(a => a.id === assignment.agentId) : null;
            
            return (
              <div
                key={delivery.id}
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedDelivery === delivery.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedDelivery(selectedDelivery === delivery.id ? null : delivery.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(delivery.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{delivery.orderNumber}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          delivery.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          delivery.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          delivery.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {delivery.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{delivery.customer.name}</div>
                      <div className="text-xs text-gray-400">{delivery.trackingNumber}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {assignedAgent ? (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{assignedAgent.name}</div>
                        <div className="text-xs text-gray-500">{assignedAgent.vehicle.make} {assignedAgent.vehicle.model}</div>
                        <div className={`text-xs font-medium ${
                          assignment?.status === 'delivered' ? 'text-green-600' :
                          assignment?.status === 'in_transit' ? 'text-blue-600' :
                          assignment?.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {assignment?.status?.replace('_', ' ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-500">Unassigned</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDelivery(delivery.id);
                            setShowAssignModal(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Assign Agent
                        </button>
                      </div>
                    )}
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.deliveryDate ? format(delivery.deliveryDate, 'MMM dd') : 'TBD'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {delivery.deliveryDate ? format(delivery.deliveryDate, 'HH:mm') : ''}
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedDelivery === delivery.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Address</h4>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-4 w-4 text-gray-400" />
                            <span>{delivery.deliveryAddress.street}</span>
                          </div>
                          <div className="ml-6">
                            {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Info</h4>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span>{delivery.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 ml-6">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span>{delivery.customer.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {delivery.specialInstructions && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Special Instructions</h4>
                        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                          {delivery.specialInstructions}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex space-x-3">
                      <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      {assignedAgent && (
                        <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          <PhoneIcon className="h-4 w-4" />
                          <span>Contact Agent</span>
                        </button>
                      )}
                      
                      <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                        <MapPinIcon className="h-4 w-4" />
                        <span>Track Location</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredDeliveries.length === 0 && (
          <div className="p-12 text-center">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No deliveries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Delivery Agents Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Agents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {agents.map((agent) => {
            const agentAssignments = assignments.filter(a => a.agentId === agent.id);
            const activeAssignments = agentAssignments.filter(a => a.status === 'assigned' || a.status === 'in_transit');
            
            return (
              <div
                key={agent.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAgent === agent.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.vehicle.make} {agent.vehicle.model}</div>
                      <div className="text-xs text-gray-500">{agent.vehicle.licensePlate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      agent.status === 'available' ? 'text-green-600' : 
                      agent.status === 'busy' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {agent.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⭐ {agent.rating} ({agent.completedDeliveries})
                    </div>
                    <div className="text-xs text-gray-500">
                      {activeAssignments.length} active
                    </div>
                  </div>
                </div>
                
                {selectedAgent === agent.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900">{agent.phone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vehicle Type:</span>
                        <span className="text-gray-900 capitalize">{agent.vehicle.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="text-gray-900">{agent.vehicle.capacity}kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fuel Type:</span>
                        <span className="text-gray-900 capitalize">{agent.vehicle.fuelType}</span>
                      </div>
                    </div>
                    
                    {activeAssignments.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Active Deliveries</h5>
                        <div className="space-y-1">
                          {activeAssignments.map((assignment) => {
                            const order = orders.find(o => o.id === assignment.orderId);
                            return (
                              <div key={assignment.id} className="text-xs text-gray-600 flex justify-between">
                                <span>{order?.orderNumber}</span>
                                <span className="capitalize">{assignment.status}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Delivery Agent</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {agents.filter(agent => agent.status === 'available').map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectedDelivery && handleAssignDelivery(selectedDelivery, agent.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.vehicle.make} {agent.vehicle.model}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-green-600">Available</div>
                      <div className="text-xs text-gray-500">⭐ {agent.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Optimizer Modal */}
      {showRouteOptimizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Route Optimization</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Optimization Parameters</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>• Minimize total distance</div>
                    <div>• Consider traffic patterns</div>
                    <div>• Respect delivery time windows</div>
                    <div>• Balance agent workloads</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Expected Benefits</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div>• 25% reduction in travel time</div>
                    <div>• 15% fuel cost savings</div>
                    <div>• Improved delivery accuracy</div>
                    <div>• Better customer satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRouteOptimizer(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={optimizeRoutes}
                className="px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700"
              >
                Optimize Routes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Loading deliveries...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}