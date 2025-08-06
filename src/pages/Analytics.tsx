import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
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
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { AnalyticsService, AnalyticsData } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'orders' | 'delivery' | 'customers' | 'financial' | 'operational'>('overview');
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await AnalyticsService.getAnalyticsData(dateRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    if (!analyticsData) return;
    
    try {
      await AnalyticsService.exportAnalyticsReport(analyticsData, format);
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Amount') ? `$${entry.value?.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
    { id: 'delivery', label: 'Delivery', icon: TruckIcon },
    { id: 'customers', label: 'Customers', icon: UsersIcon },
    { id: 'financial', label: 'Financial', icon: CurrencyDollarIcon },
    { id: 'operational', label: 'Operations', icon: ClockIcon }
  ];

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={() => handleExportReport('pdf')}
            className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-700 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>PDF</span>
          </button>
          
          <button
            onClick={() => handleExportReport('excel')}
            className="bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalOrders.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                {analyticsData.overview.orderGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${analyticsData.overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.overview.orderGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(analyticsData.overview.totalRevenue / 1000).toFixed(0)}K</p>
              <div className="flex items-center mt-1">
                {analyticsData.overview.revenueGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${analyticsData.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.overview.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalCustomers}</p>
              <div className="flex items-center mt-1">
                {analyticsData.overview.customerGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${analyticsData.overview.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.overview.customerGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <UsersIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${analyticsData.overview.averageOrderValue.toFixed(0)}</p>
              <p className="text-sm text-blue-600">{analyticsData.overview.conversionRate.toFixed(1)}% conversion</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                selectedView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Orders & Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData.orderAnalytics.dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.orderAnalytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {analyticsData.orderAnalytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

      {/* Orders Tab */}
      {selectedView === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Order Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.orderAnalytics.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.orderAnalytics.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="orders" fill="#3B82F6" name="Orders" />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analyticsData.orderAnalytics.priorityDistribution.map((priority, index) => (
                <div key={priority.priority} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{priority.count}</div>
                  <div className="text-sm text-gray-600 capitalize">{priority.priority}</div>
                  <div className="text-xs text-gray-500">{priority.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Tab */}
      {selectedView === 'delivery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.deliveryAnalytics.deliveryPerformance.onTimePercentage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{analyticsData.deliveryAnalytics.deliveryPerformance.onTime} on time</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.deliveryAnalytics.averageDeliveryTime.toFixed(1)}h</p>
                  <p className="text-sm text-gray-500">Hours from order</p>
                </div>
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late Deliveries</p>
                  <p className="text-2xl font-bold text-yellow-600">{analyticsData.deliveryAnalytics.deliveryPerformance.late}</p>
                  <p className="text-sm text-gray-500">Needs improvement</p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Deliveries</p>
                  <p className="text-2xl font-bold text-red-600">{analyticsData.deliveryAnalytics.deliveryPerformance.failed}</p>
                  <p className="text-sm text-gray-500">Requires attention</p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Time Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.deliveryAnalytics.deliveryTimeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="timeRange" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3B82F6" name="Deliveries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
              <div className="space-y-4">
                {analyticsData.deliveryAnalytics.agentPerformance.map((agent, index) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{agent.agentName}</div>
                      <div className="text-sm text-gray-500">{agent.deliveries} deliveries</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{agent.onTimeRate}% on-time</div>
                      <div className="text-sm text-gray-500">{agent.avgTime}h avg time</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {selectedView === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Customer Retention</div>
              <div className="text-2xl font-bold text-green-600">{analyticsData.customerAnalytics.customerRetention.retentionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">
                {analyticsData.customerAnalytics.customerRetention.returningCustomers} returning customers
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Avg Lifetime Value</div>
              <div className="text-2xl font-bold text-blue-600">${analyticsData.customerAnalytics.customerLifetimeValue.average.toFixed(0)}</div>
              <div className="text-sm text-gray-500">
                Median: ${analyticsData.customerAnalytics.customerLifetimeValue.median.toFixed(0)}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">New Customers</div>
              <div className="text-2xl font-bold text-purple-600">{analyticsData.customerAnalytics.customerRetention.newCustomers}</div>
              <div className="text-sm text-gray-500">This period</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segmentation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.customerAnalytics.customerSegmentation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="tier" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Customers" />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
              <div className="space-y-3">
                {analyticsData.customerAnalytics.topCustomers.slice(0, 8).map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{customer.customerName}</div>
                      <div className="text-sm text-gray-500">{customer.orderCount} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">${customer.totalSpent.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        Last: {format(customer.lastOrderDate, 'MMM dd')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {selectedView === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Gross Profit</div>
              <div className="text-2xl font-bold text-green-600">${analyticsData.financialAnalytics.profitMargins.grossProfit.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{analyticsData.financialAnalytics.profitMargins.grossMargin.toFixed(1)}% margin</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Net Profit</div>
              <div className="text-2xl font-bold text-blue-600">${analyticsData.financialAnalytics.profitMargins.netProfit.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{analyticsData.financialAnalytics.profitMargins.netMargin.toFixed(1)}% margin</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Monthly Growth</div>
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.financialAnalytics.monthlyRevenue[analyticsData.financialAnalytics.monthlyRevenue.length - 1]?.growth.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Revenue growth</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Payment Methods</div>
              <div className="text-2xl font-bold text-orange-600">{analyticsData.financialAnalytics.paymentMethodAnalysis.length}</div>
              <div className="text-sm text-gray-500">Active methods</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.financialAnalytics.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.financialAnalytics.paymentMethodAnalysis}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="amount"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {analyticsData.financialAnalytics.paymentMethodAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Tab */}
      {selectedView === 'operational' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Picking Efficiency</div>
              <div className="text-2xl font-bold text-green-600">{analyticsData.operationalAnalytics.pickingEfficiency.pickAccuracy}%</div>
              <div className="text-sm text-gray-500">
                Avg: {analyticsData.operationalAnalytics.pickingEfficiency.averagePickTime} min/task
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Fleet Utilization</div>
              <div className="text-2xl font-bold text-blue-600">{analyticsData.operationalAnalytics.transportEfficiency.averageUtilization}%</div>
              <div className="text-sm text-gray-500">Average across fleet</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Fuel Cost</div>
              <div className="text-2xl font-bold text-orange-600">${analyticsData.operationalAnalytics.transportEfficiency.fuelCostPerKm.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Per kilometer</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Utilization</h3>
              <div className="space-y-4">
                {analyticsData.operationalAnalytics.warehouseUtilization.map((warehouse) => (
                  <div key={warehouse.warehouseId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{warehouse.warehouseName}</div>
                      <div className="text-sm font-medium text-blue-600">{warehouse.utilization}%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${warehouse.utilization}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Efficiency: {warehouse.efficiency}%</span>
                      <span>Capacity: {warehouse.capacity.toLocaleString()} sq ft</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Turnover</h3>
              <div className="space-y-3">
                {analyticsData.operationalAnalytics.inventoryTurnover.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{category.category}</div>
                      <div className="text-sm text-gray-500">{category.daysOnHand.toFixed(0)} days on hand</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">
                        {category.turnoverRate.toFixed(1)}x
                      </div>
                      <div className="text-sm text-gray-500">Turnover rate</div>
                    </div>
                  </div>
                ))}
              </div>
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
              <span className="text-gray-900">Loading analytics...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}