import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { 
    name: 'Orders', 
    href: '/orders', 
    icon: ShoppingBagIcon,
    submenu: [
      { name: 'All Orders', href: '/orders', icon: EyeIcon },
      { name: 'Create Order', href: '/orders/create', icon: PlusIcon },
      { name: 'Pending Orders', href: '/orders/pending', icon: ClockIcon },
      { name: 'Completed Orders', href: '/orders/completed', icon: CheckCircleIcon },
    ]
  },
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
  const { hasPermission, state } = useAuth();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['Orders']);

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };
  const getVisibleNavigation = () => {
    return navigation.filter(item => {
      // Dashboard is always visible
      if (item.href === '/') return true;
      
      // Role-based navigation filtering
      const resource = getResourceFromPath(item.href);
      
      // Special cases for role-specific access
      switch (state.user?.role) {
        case 'admin':
          return true; // Admin sees everything
        case 'customer':
          return ['orders', 'returns'].includes(resource); // Customers only see orders and returns
        case 'agent':
          return ['orders', 'deliveries', 'vehicles'].includes(resource);
        case 'dispatcher':
          return ['orders', 'deliveries', 'analytics', 'customers'].includes(resource);
        case 'warehouse':
          return ['orders', 'warehouses', 'inventory'].includes(resource);
        case 'accounting':
          return ['orders', 'invoices', 'analytics'].includes(resource);
        default:
          return hasPermission(resource, 'read');
      }
    });
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TruckIcon className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">24EX Delivery</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {getVisibleNavigation().map((item) => (
          <div key={item.name}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className="group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </div>
                  {expandedMenus.includes(item.name) ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
                {expandedMenus.includes(item.name) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        className={({ isActive }) =>
                          `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                      >
                        <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
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
            )}
          </div>
        ))}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {state.user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{state.user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{state.user?.role || 'user'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getResourceFromPath(path: string): string {
  const pathMap: Record<string, string> = {
    '/orders': 'orders',
    '/deliveries': 'deliveries',
    '/transport': 'vehicles',
    '/warehouse': 'warehouses',
    '/inventory': 'inventory',
    '/returns': 'returns',
    '/accounting': 'invoices',
    '/analytics': 'analytics',
    '/customers': 'customers',
    '/users': 'users',
    '/settings': 'settings'
  };
  return pathMap[path] || 'dashboard';
}