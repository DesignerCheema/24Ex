import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import OrderForm from '../../components/Orders/OrderForm';
import { OrderFormData, Customer } from '../../types';
import { OrderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateOrder() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Check permission
    if (!hasPermission('orders', 'create')) {
      navigate('/orders');
      return;
    }
    
    loadCustomers();
  }, [hasPermission, navigate]);

  const loadCustomers = async () => {
    try {
      const customersData = await OrderService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleCreateOrder = async (data: OrderFormData) => {
    try {
      setLoading(true);
      await OrderService.createOrder(data);
      navigate('/orders', { 
        state: { message: 'Order created successfully!' }
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/orders');
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
            <p className="text-gray-600">Add a new delivery order to the system</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
          <div className="text-sm text-gray-500">Available Customers</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">$25</div>
          <div className="text-sm text-gray-500">Default Delivery Fee</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">8%</div>
          <div className="text-sm text-gray-500">Tax Rate</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">24/7</div>
          <div className="text-sm text-gray-500">Service Hours</div>
        </div>
      </div>

      {/* Order Creation Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Order Creation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div>• Select existing customer or enter new details</div>
            <div>• Ensure accurate pickup and delivery addresses</div>
            <div>• Add item weights for proper vehicle assignment</div>
          </div>
          <div className="space-y-2">
            <div>• Set appropriate priority based on urgency</div>
            <div>• Include special instructions for delivery</div>
            <div>• Enable WhatsApp tracking for better communication</div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={handleClose}
        onSubmit={handleCreateOrder}
        customers={customers}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Creating order...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}