import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ArrowUturnLeftIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
  { name: 'Deliveries', href: '/deliveries', icon: TruckIcon },
  { name: 'Transport', href: '/transport', icon: TruckIcon },
  { name: 'Warehouse', href: '/warehouse', icon: BuildingStorefrontIcon },
  { name: 'Returns', href: '/returns', icon: ArrowUturnLeftIcon },
  { name: 'Accounting', href: '/accounting', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TruckIcon className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">24EX Delivery</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@24ex.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}