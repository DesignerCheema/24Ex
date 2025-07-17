import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, DocumentArrowDownIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { mockOrders, mockCustomers } from '../data/mockData';
import { Order, OrderFormData } from '../types';
import { format } from 'date-fns';
import OrderForm from '../components/Orders/OrderForm';
import OrderViewModal from '../components/Orders/OrderViewModal';
import { exportOrdersToPDF, exportOrdersToExcel, exportOrdersToCSV } from '../utils/exportUtils';
import { useAuth } from '../contexts/AuthContext';
import { OrderService } from '../services/orderService';

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState(mockCustomers);
  const { hasPermission } = useAuth();

  // Load orders and customers on component mount
  React.useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await OrderService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Fallback to mock data if database fails
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await OrderService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load customers:', error);
      // Fallback to mock data if database fails
      setCustomers(mockCustomers);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        
        switch (dateFilter) {
          case 'today':
            matchesDate = orderDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, priorityFilter, dateFilter]);

  const handleCreateOrder = async (data: OrderFormData) => {
    try {
      setLoading(true);
      const newOrder = await OrderService.createOrder(data);
      setOrders([newOrder, ...orders]);
      await loadCustomers(); // Refresh customers list
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderFormOpen(true);
  };

  const handleUpdateOrder = async (data: OrderFormData) => {
    if (!editingOrder) return;

    try {
      setLoading(true);
      const updatedOrder = await OrderService.updateOrder(editingOrder.id, data);
      setOrders(orders.map(order => order.id === editingOrder.id ? updatedOrder : order));
      setEditingOrder(null);
      await loadCustomers(); // Refresh customers list
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setLoading(true);
        await OrderService.deleteOrder(orderId);
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert('Failed to delete order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} selected orders?`)) {
      try {
        setLoading(true);
        await OrderService.deleteOrders(selectedOrders);
        setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
        setSelectedOrders([]);
      } catch (error) {
        console.error('Failed to delete orders:', error);
        alert('Failed to delete orders. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const ordersToExport = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id))
      : filteredOrders;

    switch (format) {
      case 'pdf':
        exportOrdersToPDF(ordersToExport, 'Orders Report');
        break;
      case 'excel':
        exportOrdersToExcel(ordersToExport, 'orders-export');
        break;
      case 'csv':
        exportOrdersToCSV(ordersToExport, 'orders-export');
        break;
    }
    
    setShowExportMenu(false);
  };

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsOrderViewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const convertOrderToFormData = (order: Order): OrderFormData => {
    return {
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        company: order.customer.company,
      },
      deliveryAddress: order.deliveryAddress,
      pickupAddress: order.pickupAddress,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        value: item.value,
        category: item.category,
        description: item.description,
      })),
      priority: order.priority,
      paymentMethod: order.paymentMethod,
      deliveryDate: order.deliveryDate,
      specialInstructions: order.specialInstructions,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage all your delivery orders</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-700 flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete ({selectedOrders.length})</span>
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

          {hasPermission('orders', 'create') && (
            <button
              onClick={() => {
                setEditingOrder(null);
                setIsOrderFormOpen(true);
              }}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-gray-500">Delivered</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'shipped').length}
          </div>
          <div className="text-sm text-gray-500">In Transit</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
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
                <option value="pending">Pending</option>
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
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.trackingNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(order.createdAt, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Order"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {hasPermission('orders', 'update') && (
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-green-600 hover:text-green-800 p-1"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('orders', 'delete') && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800 p-1"
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

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
            {selectedOrders.length > 0 && ` (${selectedOrders.length} selected)`}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setEditingOrder(null);
        }}
        onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
        initialData={editingOrder ? convertOrderToFormData(editingOrder) : undefined}
      />

      {/* Order View Modal */}
      <OrderViewModal
        isOpen={isOrderViewOpen}
        onClose={() => {
          setIsOrderViewOpen(false);
          setViewingOrder(null);
        }}
        order={viewingOrder}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}