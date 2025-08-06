import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { InvoiceFormData } from '../services/accountingService';
import { OrderService } from '../services/orderService';
import { Order, Customer } from '../types';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceFormData) => void;
  initialData?: any;
}

export default function InvoiceForm({ isOpen, onClose, onSubmit, initialData }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    defaultValues: {
      items: [{ name: '', description: '', quantity: 1, unitPrice: 0 }],
      paymentTerms: 'Net 30',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedCustomerId = watch('customerId');
  const watchedOrderId = watch('orderId');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadOrders();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchedOrderId) {
      const order = orders.find(o => o.id === watchedOrderId);
      setSelectedOrder(order || null);
      
      if (order) {
        // Auto-populate items from order
        setValue('items', order.items.map(item => ({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.value
        })));
      }
    }
  }, [watchedOrderId, orders, setValue]);

  const loadCustomers = async () => {
    try {
      const customersData = await OrderService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await OrderService.getAllOrders();
      // Only show delivered orders that don't have invoices yet
      const eligibleOrders = ordersData.filter(order => 
        order.status === 'delivered' || order.status === 'shipped'
      );
      setOrders(eligibleOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleFormSubmit = (data: InvoiceFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const calculateSubtotal = () => {
    const items = watch('items') || [];
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = watch('discount') || 0;
    return (subtotal - discount) * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = watch('discount') || 0;
    return subtotal + tax - discount;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Customer and Order Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer *</label>
              <select
                {...register('customerId', { required: 'Customer is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Related Order (Optional)</label>
              <select
                {...register('orderId')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an order (optional)</option>
                {orders
                  .filter(order => !watchedCustomerId || order.customer.id === watchedCustomerId)
                  .map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - ${order.totalAmount} ({order.status})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={() => append({ name: '', description: '', quantity: 1, unitPrice: 0 })}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Item Name *</label>
                    <input
                      {...register(`items.${index}.name`, { required: 'Item name is required' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Delivery Service"
                    />
                    {errors.items?.[index]?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.name?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      {...register(`items.${index}.quantity`, {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' },
                      })}
                      type="number"
                      min="1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price ($) *</label>
                    <input
                      {...register(`items.${index}.unitPrice`, {
                        required: 'Unit price is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' },
                      })}
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.items?.[index]?.unitPrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.unitPrice?.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      {...register(`items.${index}.description`)}
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Item description..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date *</label>
              <input
                {...register('dueDate', { required: 'Due date is required' })}
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Terms *</label>
              <select
                {...register('paymentTerms', { required: 'Payment terms are required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
              {errors.paymentTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentTerms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount ($)</label>
              <input
                {...register('discount', {
                  min: { value: 0, message: 'Discount cannot be negative' },
                })}
                type="number"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes or terms..."
              />
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Invoice Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-gray-900">-${(watch('discount') || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-medium text-gray-900">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}