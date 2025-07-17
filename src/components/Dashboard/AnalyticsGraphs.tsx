import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Order } from '../../types';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

interface AnalyticsGraphsProps {
  orders: Order[];
}

export default function AnalyticsGraphs({ orders }: AnalyticsGraphsProps) {
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'orders' | 'status' | 'performance'>('revenue');

  // Generate data for the last 30 days
  const generateDailyData = () => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });

      const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const delivered = dayOrders.filter(order => order.status === 'delivered').length;
      const cancelled = dayOrders.filter(order => order.status === 'cancelled').length;

      return {
        date: format(day, 'MMM dd'),
        fullDate: day,
        revenue: Math.round(revenue),
        orders: dayOrders.length,
        delivered,
        cancelled,
        pending: dayOrders.filter(order => order.status === 'pending').length,
        processing: dayOrders.filter(order => order.status === 'processing').length,
        shipped: dayOrders.filter(order => order.status === 'shipped').length
      };
    });
  };

  // Generate status distribution data
  const generateStatusData = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      delivered: '#10B981',
      shipped: '#3B82F6',
      processing: '#F59E0B',
      pending: '#6B7280',
      cancelled: '#EF4444',
      returned: '#8B5CF6'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status as keyof typeof colors] || '#6B7280'
    }));
  };

  // Generate priority distribution data
  const generatePriorityData = () => {
    const priorityCounts = orders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Low', value: priorityCounts.low || 0, color: '#10B981' },
      { name: 'Medium', value: priorityCounts.medium || 0, color: '#F59E0B' },
      { name: 'High', value: priorityCounts.high || 0, color: '#EF4444' },
      { name: 'Urgent', value: priorityCounts.urgent || 0, color: '#DC2626' }
    ];
  };

  // Generate hourly performance data
  const generateHourlyData = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      });

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      };
    });

    return hourlyData;
  };

  const dailyData = generateDailyData();
  const statusData = generateStatusData();
  const priorityData = generatePriorityData();
  const hourlyData = generateHourlyData();

  const chartTabs = [
    { id: 'revenue', label: 'Revenue Trends', icon: '💰' },
    { id: 'orders', label: 'Order Volume', icon: '📦' },
    { id: 'status', label: 'Status Distribution', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '⚡' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? `$${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Visual insights and performance metrics</p>
          </div>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {chartTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedChart(tab.id as any)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedChart === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {selectedChart === 'revenue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">Revenue Trends (Last 30 Days)</h3>
              <div className="text-sm text-gray-500">
                Total: ${dailyData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="Daily Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">Order Volume (Last 30 Days)</h3>
              <div className="text-sm text-gray-500">
                Total: {dailyData.reduce((sum, day) => sum + day.orders, 0)} orders
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="delivered" stackId="a" fill="#10B981" name="Delivered" />
                  <Bar dataKey="shipped" stackId="a" fill="#3B82F6" name="Shipped" />
                  <Bar dataKey="processing" stackId="a" fill="#F59E0B" name="Processing" />
                  <Bar dataKey="pending" stackId="a" fill="#6B7280" name="Pending" />
                  <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedChart === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Order Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Priority Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedChart === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Hourly Order Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name="Orders per Hour"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Success Rate</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2.3h</div>
                <div className="text-sm text-blue-700">Avg Delivery Time</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  ${(orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length).toFixed(0)}
                </div>
                <div className="text-sm text-yellow-700">Avg Order Value</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}