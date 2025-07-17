import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ReturnFormData, Order } from '../../types';
import { ReturnsService } from '../../services/returnsService';

interface ReturnFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReturnFormData) => void;
}

export default function ReturnForm({ isOpen, onClose, onSubmit }: ReturnFormProps) {
  const [eligibleOrders, setEligibleOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ReturnFormData>({
    defaultValues: {
      items: [{ itemId: '', name: '', quantity: 1, reason: '', condition: 'new', refundAmount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedOrderId = watch('orderId');

  useEffect(() => {
    if (isOpen) {
      loadEligibleOrders();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchedOrderId) {
      const order = eligibleOrders.find(o => o.id === watchedOrderId);
      setSelectedOrder(order || null);
      
      if (order) {
        // Reset items array and populate with order items
        setValue('items', order.items.map(item => ({
          itemId: item.id,
          name: item.name,
          quantity: 1,
          reason: '',
          condition: 'new' as const,
          refundAmount: item.value
        })));
      }
    }
  }, [watchedOrderId, eligibleOrders, setValue]);

  const loadEligibleOrders = async () => {
    try {
      const orders = await ReturnsService.getEligibleOrders();
      setEligibleOrders(orders);
    } catch (error) {
      console.error('Failed to load eligible orders:', error);
    }
  };

  const handleFormSubmit = (data: ReturnFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Return Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order *</label>
              <select
                {...register('orderId', { required: 'Order is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an order</option>
                {eligibleOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {order.customer.name} (${order.totalAmount})
                  </option>
                ))}
              </select>
              {errors.orderId && (
                <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Return Reason *</label>
              <select
                {...register('reason', { required: 'Reason is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a reason</option>
                <option value="Damaged during shipping">Damaged during shipping</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Not as described">Not as described</option>
                <option value="Defective product">Defective product</option>
                <option value="Changed mind">Changed mind</option>
                <option value="Size/fit issues">Size/fit issues</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>
          </div>

          {selectedOrder && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Customer:</span> {selectedOrder.customer.name}
                </div>
                <div>
                  <span className="font-medium">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span> ${selectedOrder.totalAmount}
                </div>
              </div>
            </div>
          )}

          {/* Return Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items to Return</h3>
              {selectedOrder && (
                <button
                  type="button"
                  onClick={() => append({ itemId: '', name: '', quantity: 1, reason: '', condition: 'new', refundAmount: 0 })}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Item *</label>
                    <select
                      {...register(`items.${index}.itemId`, { required: 'Item is required' })}
                      onChange={(e) => {
                        const selectedItem = selectedOrder?.items.find(item => item.id === e.target.value);
                        if (selectedItem) {
                          setValue(`items.${index}.name`, selectedItem.name);
                          setValue(`items.${index}.refundAmount`, selectedItem.value);
                        }
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select item</option>
                      {selectedOrder?.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (${item.value})
                        </option>
                      ))}
                    </select>
                    {errors.items?.[index]?.itemId && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.itemId?.message}</p>
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
                    <label className="block text-sm font-medium text-gray-700">Condition *</label>
                    <select
                      {...register(`items.${index}.condition`, { required: 'Condition is required' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="new">New/Unused</option>
                      <option value="used">Used</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Refund Amount ($) *</label>
                    <input
                      {...register(`items.${index}.refundAmount`, {
                        required: 'Refund amount is required',
                        min: { value: 0, message: 'Refund amount cannot be negative' },
                      })}
                      type="number"
                      step="0.01"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.items?.[index]?.refundAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.refundAmount?.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Item-specific Reason</label>
                    <input
                      {...register(`items.${index}.reason`)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Screen cracked, Wrong color"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information about the return..."
            />
          </div>

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
              Create Return Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}