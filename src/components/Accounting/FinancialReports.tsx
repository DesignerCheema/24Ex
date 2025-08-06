import React, { useState } from 'react';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon
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
  ResponsiveContainer
} from 'recharts';
import { FinancialSummary, Invoice, Payment } from '../../services/accountingService';
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface FinancialReportsProps {
  financialSummary: FinancialSummary;
  invoices: Invoice[];
  payments: Payment[];
}

export default function FinancialReports({ financialSummary, invoices, payments }: FinancialReportsProps) {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'revenue' | 'payments' | 'customers'>('overview');
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y'>('6m');

  const generateRevenueData = () => {
    const months = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), dateRange === '3m' ? 3 : dateRange === '6m' ? 6 : 12)),
      end: endOfMonth(new Date())
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate >= monthStart && invoiceDate <= monthEnd;
      });

      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      return {
        month: format(month, 'MMM yyyy'),
        invoiced: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        paid: monthPayments.reduce((sum, pay) => sum + pay.amount, 0),
        outstanding: monthInvoices
          .filter(inv => inv.status === 'sent')
          .reduce((sum, inv) => sum + inv.totalAmount, 0)
      };
    });
  };

  const generatePaymentMethodData = () => {
    return financialSummary.paymentMethodBreakdown.map(method => ({
      name: method.method,
      value: method.amount,
      percentage: method.percentage
    }));
  };

  const revenueData = generateRevenueData();
  const paymentMethodData = generatePaymentMethodData();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'revenue', label: 'Revenue Trends', icon: TrendingUpIcon },
    { id: 'payments', label: 'Payment Analysis', icon: CurrencyDollarIcon },
    { id: 'customers', label: 'Customer Insights', icon: TrendingDownIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                selectedReport === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center space-x-2">
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Invoiced</div>
              <div className="text-2xl font-bold text-blue-600">${financialSummary.totalInvoiced.toLocaleString()}</div>
              <div className="text-sm text-gray-500">All time</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Paid</div>
              <div className="text-2xl font-bold text-green-600">${financialSummary.totalPaid.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Collected revenue</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Outstanding</div>
              <div className="text-2xl font-bold text-yellow-600">${financialSummary.totalOutstanding.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Pending payment</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Overdue</div>
              <div className="text-2xl font-bold text-red-600">${financialSummary.totalOverdue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Requires action</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Invoiced vs Paid</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Invoiced"
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Paid"
                  />
                  <Area
                    type="monotone"
                    dataKey="outstanding"
                    stackId="3"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                    name="Outstanding"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialSummary.monthlyRevenue}>
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
                    name="Monthly Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Rate by Month</h3>
              <div className="space-y-3">
                {financialSummary.monthlyRevenue.slice(-6).map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{month.month}</div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">${month.revenue.toLocaleString()}</span>
                      <div className={`flex items-center ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {month.growth >= 0 ? (
                          <TrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">{month.growth.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Best Performing Month</div>
                  <div className="text-lg font-bold text-green-600">
                    {financialSummary.monthlyRevenue.reduce((best, current) => 
                      current.revenue > best.revenue ? current : best
                    ).month}
                  </div>
                  <div className="text-sm text-green-700">
                    ${financialSummary.monthlyRevenue.reduce((best, current) => 
                      current.revenue > best.revenue ? current : best
                    ).revenue.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Average Monthly Revenue</div>
                  <div className="text-lg font-bold text-blue-600">
                    ${(financialSummary.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / financialSummary.monthlyRevenue.length).toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-900">Revenue Trend</div>
                  <div className="text-lg font-bold text-purple-600">
                    {financialSummary.monthlyRevenue.slice(-3).reduce((sum, month) => sum + month.growth, 0) / 3 > 0 ? 'Growing' : 'Declining'}
                  </div>
                  <div className="text-sm text-purple-700">
                    {(financialSummary.monthlyRevenue.slice(-3).reduce((sum, month) => sum + month.growth, 0) / 3).toFixed(1)}% avg growth
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {selectedReport === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Performance</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Average Payment Time</div>
                  <div className="text-2xl font-bold text-green-600">{financialSummary.averagePaymentTime.toFixed(1)} days</div>
                  <div className="text-sm text-green-700">From invoice date</div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Collection Rate</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {((financialSummary.totalPaid / financialSummary.totalInvoiced) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700">Of total invoiced</div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-yellow-900">Outstanding Ratio</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {((financialSummary.totalOutstanding / financialSummary.totalInvoiced) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-yellow-700">Of total invoiced</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialSummary.paymentMethodBreakdown.map((method, index) => (
                <div key={method.method} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900 capitalize">{method.method}</div>
                    <div className="text-sm font-medium text-blue-600">{method.percentage.toFixed(1)}%</div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">${method.amount.toLocaleString()}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {selectedReport === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialSummary.topCustomers.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="customerName" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalSpent" fill="#3B82F6" name="Total Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Total Active Customers</div>
                  <div className="text-2xl font-bold text-blue-600">{financialSummary.topCustomers.length}</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Average Customer Value</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(financialSummary.topCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0) / financialSummary.topCustomers.length).toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-900">Top Customer Contribution</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {((financialSummary.topCustomers[0]?.totalSpent || 0) / financialSummary.totalRevenue * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-700">Of total revenue</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
              <div className="space-y-3">
                {financialSummary.topCustomers.slice(0, 8).map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{customer.customerName}</div>
                      <div className="text-sm text-gray-500">{customer.orderCount} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">${customer.totalSpent.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        ${(customer.totalSpent / customer.orderCount).toFixed(0)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}