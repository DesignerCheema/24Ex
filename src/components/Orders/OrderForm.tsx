import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { OrderFormData } from '../../types';
import { Customer } from '../../types';
import WhatsAppTrackingWidget from '../WhatsApp/WhatsAppTrackingWidget';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => void;
  initialData?: Partial<OrderFormData>;
  customers?: Customer[];
}

export default function OrderForm({ isOpen, onClose, onSubmit, initialData, customers = [] }: OrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<OrderFormData>({
    defaultValues: {
      items: [{ name: '', quantity: 1, weight: 0, value: 0, category: '', description: '' }],
      priority: 'medium',
      paymentMethod: 'prepaid',
      deliveryFee: 25,
      discount: 0,
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setValue('customer.name', customer.name);
      setValue('customer.email', customer.email);
      setValue('customer.phone', customer.phone);
      setValue('customer.company', customer.company);
      setSelectedCustomer(customerId);
    }
  };

  const handleFormSubmit = (data: OrderFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Order' : 'Create New Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a customer or enter new details</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  {...register('customer.name', { required: 'Customer name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.customer?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  {...register('customer.email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.customer?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  {...register('customer.phone', { required: 'Phone is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.customer?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  {...register('customer.company')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                <input
                  {...register('deliveryAddress.street', { required: 'Street address is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.deliveryAddress?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.street.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  {...register('deliveryAddress.city', { required: 'City is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.deliveryAddress?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.city.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <input
                  {...register('deliveryAddress.state', { required: 'State is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.deliveryAddress?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.state.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country *</label>
                <input
                  {...register('deliveryAddress.country', { required: 'Country is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.deliveryAddress?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.country.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
                <input
                  {...register('deliveryAddress.zipCode', { required: 'ZIP code is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.deliveryAddress?.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pickup Address */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                <input
                  {...register('pickupAddress.street', { required: 'Pickup address is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.pickupAddress?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.street.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  {...register('pickupAddress.city', { required: 'City is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <input
                  {...register('pickupAddress.state', { required: 'State is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country *</label>
                <input
                  {...register('pickupAddress.country', { required: 'Country is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
                <input
                  {...register('pickupAddress.zipCode', { required: 'ZIP code is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={() => append({ name: '', quantity: 1, weight: 0, value: 0, category: '', description: '' })}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      {...register(`items.${index}.name`, { required: 'Item name is required' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.items?.[index]?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.name?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select
                      {...register(`items.${index}.category`, { required: 'Category is required' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Books">Books</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
                    <input
                      {...register(`items.${index}.weight`, {
                        required: 'Weight is required',
                        min: { value: 0.1, message: 'Weight must be greater than 0' },
                      })}
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value ($) *</label>
                    <input
                      {...register(`items.${index}.value`, {
                        required: 'Value is required',
                        min: { value: 0.01, message: 'Value must be greater than 0' },
                      })}
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      {...register(`items.${index}.description`)}
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority *</label>
                <select
                  {...register('priority', { required: 'Priority is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
                <select
                  {...register('paymentMethod', { required: 'Payment method is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="prepaid">Prepaid</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                <input
                  {...register('deliveryDate')}
                  type="datetime-local"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Fee ($)</label>
                <input
                  {...register('deliveryFee', {
                    min: { value: 0, message: 'Delivery fee cannot be negative' },
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
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
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                <textarea
                  {...register('specialInstructions')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Tracking Option */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Notifications</h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableWhatsApp"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="enableWhatsApp" className="text-sm text-gray-700">
                Enable WhatsApp tracking notifications for this order
              </label>
            </div>
            <p className="text-xs text-green-600 mt-2">
              Customer will receive real-time updates on their WhatsApp
            </p>
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
              {initialData ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}