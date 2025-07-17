import React, { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentOrders from '../components/Dashboard/RecentOrders';
import DeliveryMap from '../components/Dashboard/DeliveryMap';
import RecentActivity from '../components/Dashboard/RecentActivity';
import AnalyticsCards from '../components/Dashboard/AnalyticsCards';
import AnalyticsGraphs from '../components/Dashboard/AnalyticsGraphs';
import OrderForm from '../components/Orders/OrderForm';
import { mockAnalytics, mockOrders, mockCustomers } from '../data/mockData';
import { OrderFormData } from '../types';
import { OrderService } from '../services/orderService';
import { exportOrdersToPDF, exportOrdersToExcel, exportOrdersToCSV } from '../utils/exportUtils';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState(mockCustomers);
  const { hasPermission } = useAuth();

  // Load orders on component mount
  useEffect(() => {
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

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const recentOrders = orders.slice(0, 50); // Export recent 50 orders

    switch (format) {
      case 'pdf':
        exportOrdersToPDF(recentOrders, 'Dashboard Orders Report');
        break;
      case 'excel':
        exportOrdersToExcel(recentOrders, 'dashboard-orders-export');
        break;
      case 'csv':
        exportOrdersToCSV(recentOrders, 'dashboard-orders-export');
        break;
    }
    
    setShowExportMenu(false);
  };

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length.toLocaleString(),
      change: '+12% from last month',
      changeType: 'increase' as const,
      icon: ShoppingBagIcon
    },
    {
      title: 'Active Deliveries',
      value: orders.filter(o => o.status === 'shipped' || o.status === 'processing').length,
      change: `${orders.filter(o => o.status === 'shipped').length} out for delivery`,
      changeType: 'neutral' as const,
      icon: TruckIcon
    },
    {
      title: 'Revenue',
      value: `$${Math.round(orders.reduce((sum, order) => sum + order.totalAmount, 0) / 1000)}K`,
      change: '+18% from last month',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon
    },
    {
      title: 'Active Agents',
      value: '24',
      change: '19 available',
      changeType: 'neutral' as const,
      icon: UsersIcon
    },
    {
      title: 'Avg. Delivery Time',
      value: `${mockAnalytics.averageDeliveryTime}h`,
      change: '-15 min from last week',
      changeType: 'increase' as const,
      icon: ClockIcon
    },
    {
      title: 'Success Rate',
      value: `${mockAnalytics.onTimeDeliveryRate}%`,
      change: '+2.1% from last month',
      changeType: 'increase' as const,
      icon: CheckCircleIcon
    }
  ];

  const todayDeliveries = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const failedDeliveries = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your deliveries.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export Report</span>
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
              onClick={() => setIsOrderFormOpen(true)}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Order</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <DeliveryMap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsCards orders={orders} />
        </div>
        <RecentActivity orders={orders} />
      </div>

      <AnalyticsGraphs orders={orders} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Deliveries</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{todayDeliveries}</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                <span>+23 from yesterday</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Failed Deliveries</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{failedDeliveries}</div>
              <div className="flex items-center text-sm text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span>2 address issues</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Satisfaction</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{mockAnalytics.customerSatisfaction}/5</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                <span>+0.2 from last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Return Rate</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{mockAnalytics.returnRate}%</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                <span>-0.8% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <ArrowTrendingDownIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        onSubmit={handleCreateOrder}
        customers={customers}
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