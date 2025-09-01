import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Order } from '../../types';
import { OrderService } from '../../services/orderService';
import { format, differenceInHours } from 'date-fns';
import OrderViewModal from '../../components/Orders/OrderViewModal';
import { exportOrdersToPDF, exportOrdersToExcel, exportOrdersToCSV } from '../../utils/exportUtils';

export default function CompletedOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOrderViewOpen, setIsOrderViewOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCompletedOrders();
  }, []);

  const loadCompletedOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await OrderService.getAllOrders();
      const completedOrders = allOrders.filter(order => 
        order.status === 'delivered'
      );
      setOrders(completedOrders);
    } catch (error) {
      console.error('Failed to load completed orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
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
      
      return matchesSearch && matchesDate;
    });
  }, [orders, searchTerm, dateFilter]);

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsOrderViewOpen(true);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    switch (format) {
      case 'pdf':
        exportOrdersToPDF(filteredOrders, 'Completed Orders Report');
        break;
      case 'excel':
        exportOrdersToExcel(filteredOrders, 'completed-orders-export');
        break;
      case 'csv':
        exportOrdersToCSV(filteredOrders, 'completed-orders-export');
        break;
    }
    
    setShowExportMenu(false);
  };

  const calculateDeliveryTime = (order: Order) => {
    if (order.actualDeliveryTime) {
      return differenceInHours(new Date(order.actualDeliveryTime), new Date(order.createdAt));
    }
    return null;
  };

  const getDeliveryPerformance = (order: Order) => {
    if (order.deliveryDate && order.actualDeliveryTime) {
      const onTime = new Date(order.actualDeliveryTime) <= new Date(order.deliveryDate);
      return onTime ? 'on-time' : 'late';
    }
    return 'unknown';
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'on-time':
        return 'text-green-600';
      case 'late':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const completedStats = {
    total: orders.length,
    onTime: orders.filter(order => getDeliveryPerformance(order) === 'on-time').length,
    late: orders.filter(order => getDeliveryPerformance(order) === 'late').length,
    avgDeliveryTime: orders.length > 0 
      ? orders.reduce((sum, order) => {
          const time = calculateDeliveryTime(order);
          return sum + (time || 0);
        }, 0) / orders.length 
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Completed Orders</h1>
            <p className="text-gray-600">Successfully delivered orders</p>
          </div>
        </div>
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
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedStats.total}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
              <p className="text-2xl font-bold text-blue-600">
                {completedStats.total > 0 ? ((completedStats.onTime / completedStats.total) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-500">{completedStats.onTime} orders</p>
            </div>
            <TruckIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-purple-600">{completedStats.avgDeliveryTime.toFixed(1)}h</p>
              <p className="text-sm text-gray-500">From order to delivery</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Rating</p>
              <p className="text-2xl font-bold text-yellow-600">4.8</p>
              <p className="text-sm text-gray-500">Average satisfaction</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-600" />
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
                  placeholder="Search completed orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const deliveryTime = calculateDeliveryTime(order);
                const performance = getDeliveryPerformance(order);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliveryTime ? `${deliveryTime.toFixed(1)}h` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          performance === 'on-time' ? 'bg-green-500' : 
                          performance === 'late' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${getPerformanceColor(performance)}`}>
                          {performance === 'on-time' ? 'On Time' : 
                           performance === 'late' ? 'Late' : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.actualDeliveryTime 
                        ? format(order.actualDeliveryTime, 'MMM dd, yyyy HH:mm')
                        : format(order.updatedAt, 'MMM dd, yyyy HH:mm')
                      }
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
                        <button
                          onClick={() => window.open(`/track?id=${order.trackingNumber}`, '_blank')}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="View Public Tracking"
                        >
                          <TruckIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No completed orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or date filter.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} completed orders
          </div>
          <div className="text-sm text-gray-500">
            Success Rate: {completedStats.total > 0 ? ((completedStats.onTime / completedStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">On-Time Deliveries</h4>
            <div className="text-2xl font-bold text-green-600">{completedStats.onTime}</div>
            <div className="text-sm text-green-700">
              {completedStats.total > 0 ? ((completedStats.onTime / completedStats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Late Deliveries</h4>
            <div className="text-2xl font-bold text-red-600">{completedStats.late}</div>
            <div className="text-sm text-red-700">
              {completedStats.total > 0 ? ((completedStats.late / completedStats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Average Delivery Time</h4>
            <div className="text-2xl font-bold text-blue-600">{completedStats.avgDeliveryTime.toFixed(1)}h</div>
            <div className="text-sm text-blue-700">From order creation</div>
          </div>
        </div>
      </div>

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
              <span className="text-gray-900">Loading completed orders...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}