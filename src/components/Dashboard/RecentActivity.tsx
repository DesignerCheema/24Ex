import React from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Order } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  orders: Order[];
}

export default function RecentActivity({ orders }: RecentActivityProps) {
  // Generate activity items from orders
  const generateActivityItems = () => {
    const activities = [];
    
    // Recent order updates
    const recentOrders = orders
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);

    recentOrders.forEach(order => {
      const timeDiff = new Date().getTime() - new Date(order.updatedAt).getTime();
      const isRecent = timeDiff < 24 * 60 * 60 * 1000; // Within 24 hours

      if (isRecent) {
        activities.push({
          id: `order-${order.id}`,
          type: 'order_update',
          title: `Order ${order.orderNumber} ${order.status}`,
          description: `Customer: ${order.customer.name}`,
          time: order.updatedAt,
          icon: getStatusIcon(order.status),
          color: getStatusColor(order.status)
        });
      }
    });

    // Add some mock system activities
    const now = new Date();
    const mockActivities = [
      {
        id: 'agent-1',
        type: 'agent_login',
        title: 'Agent Mike Wilson logged in',
        description: 'Started delivery route in Manhattan',
        time: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: UserIcon,
        color: 'text-blue-600'
      },
      {
        id: 'system-1',
        type: 'system_alert',
        title: 'Route optimization completed',
        description: '15 deliveries optimized for efficiency',
        time: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        icon: TruckIcon,
        color: 'text-green-600'
      },
      {
        id: 'agent-2',
        type: 'delivery_issue',
        title: 'Delivery attempt failed',
        description: 'Customer not available at TR-045-2024',
        time: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        icon: ExclamationTriangleIcon,
        color: 'text-red-600'
      }
    ];

    // Combine and sort all activities
    const allActivities = [...activities, ...mockActivities]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return allActivities;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircleIcon;
      case 'shipped':
        return TruckIcon;
      case 'processing':
        return ClockIcon;
      case 'cancelled':
        return ExclamationTriangleIcon;
      default:
        return ShoppingBagIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'shipped':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const activityItems = generateActivityItems();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activityItems.map((item, index) => (
              <li key={item.id}>
                <div className="relative pb-8">
                  {index !== activityItems.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-50`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={item.time.toISOString()}>
                          {formatDistanceToNow(item.time, { addSuffix: true })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {activityItems.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as orders are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}