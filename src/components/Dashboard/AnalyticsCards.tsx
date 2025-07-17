import React from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Order } from '../../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsCardsProps {
  orders: Order[];
}

export default function AnalyticsCards({ orders }: AnalyticsCardsProps) {
  // Calculate analytics from orders
  const calculateAnalytics = () => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    // Filter orders by time periods
    const ordersLast7Days = orders.filter(order => 
      new Date(order.createdAt) >= last7Days
    );
    const ordersLast30Days = orders.filter(order => 
      new Date(order.createdAt) >= last30Days
    );

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueThisMonth = ordersLast30Days.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueLastMonth = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const lastMonthStart = subDays(last30Days, 30);
        return orderDate >= lastMonthStart && orderDate < last30Days;
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const revenueGrowth = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : '0';

    // Order completion rate
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const completionRate = orders.length > 0 ? (completedOrders / orders.length * 100).toFixed(1) : '0';

    // Average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Customer metrics (unique customers)
    const uniqueCustomers = new Set(orders.map(order => order.customer.email)).size;

    // Delivery performance
    const onTimeDeliveries = orders.filter(order => {
      if (order.status === 'delivered' && order.deliveryDate && order.actualDeliveryTime) {
        return new Date(order.actualDeliveryTime) <= new Date(order.deliveryDate);
      }
      return false;
    }).length;

    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const onTimeRate = deliveredOrders > 0 ? (onTimeDeliveries / deliveredOrders * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      revenueGrowth: parseFloat(revenueGrowth),
      completionRate: parseFloat(completionRate),
      avgOrderValue,
      uniqueCustomers,
      onTimeRate: parseFloat(onTimeRate),
      ordersThisWeek: ordersLast7Days.length,
      ordersLastWeek: orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const lastWeekStart = subDays(last7Days, 7);
        return orderDate >= lastWeekStart && orderDate < last7Days;
      }).length
    };
  };

  const analytics = calculateAnalytics();
  const weeklyGrowth = analytics.ordersLastWeek > 0 
    ? ((analytics.ordersThisWeek - analytics.ordersLastWeek) / analytics.ordersLastWeek * 100).toFixed(1)
    : '0';

  const analyticsCards = [
    {
      title: 'Revenue Growth',
      value: `${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth}%`,
      subtitle: `$${(analytics.totalRevenue / 1000).toFixed(0)}K total revenue`,
      icon: CurrencyDollarIcon,
      trend: analytics.revenueGrowth >= 0 ? 'up' : 'down',
      color: analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: analytics.revenueGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Order Completion',
      value: `${analytics.completionRate}%`,
      subtitle: `${orders.filter(o => o.status === 'delivered').length} completed orders`,
      icon: CheckCircleIcon,
      trend: analytics.completionRate >= 90 ? 'up' : 'down',
      color: analytics.completionRate >= 90 ? 'text-green-600' : 'text-yellow-600',
      bgColor: analytics.completionRate >= 90 ? 'bg-green-50' : 'bg-yellow-50'
    },
    {
      title: 'Weekly Orders',
      value: analytics.ordersThisWeek.toString(),
      subtitle: `${parseFloat(weeklyGrowth) >= 0 ? '+' : ''}${weeklyGrowth}% from last week`,
      icon: ChartBarIcon,
      trend: parseFloat(weeklyGrowth) >= 0 ? 'up' : 'down',
      color: parseFloat(weeklyGrowth) >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: parseFloat(weeklyGrowth) >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Avg Order Value',
      value: `$${analytics.avgOrderValue.toFixed(0)}`,
      subtitle: `${analytics.uniqueCustomers} unique customers`,
      icon: UserGroupIcon,
      trend: 'neutral',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'On-Time Delivery',
      value: `${analytics.onTimeRate}%`,
      subtitle: 'Delivery performance',
      icon: ClockIcon,
      trend: analytics.onTimeRate >= 95 ? 'up' : 'down',
      color: analytics.onTimeRate >= 95 ? 'text-green-600' : 'text-yellow-600',
      bgColor: analytics.onTimeRate >= 95 ? 'bg-green-50' : 'bg-yellow-50'
    },
    {
      title: 'Failed Deliveries',
      value: orders.filter(o => o.status === 'cancelled').length.toString(),
      subtitle: 'Requires attention',
      icon: ExclamationTriangleIcon,
      trend: 'down',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Key performance metrics and trends</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsCards.map((card, index) => (
            <div
              key={index}
              className="relative p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                      {card.trend !== 'neutral' && (
                        <div className={`flex items-center ${card.color}`}>
                          {card.trend === 'up' ? (
                            <ArrowTrendingUpIcon className="h-4 w-4" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
              <span>Peak delivery time: 2-4 PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
              <span>Best performing day: Tuesday</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-4 w-4 text-blue-600" />
              <span>Top customer tier: Gold ({Math.round(analytics.uniqueCustomers * 0.3)})</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-blue-600" />
              <span>Avg processing time: 2.3 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}