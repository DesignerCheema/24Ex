import React from 'react';
import { XMarkIcon, MapPinIcon, TruckIcon, CreditCardIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Order } from '../../types';
import { format } from 'date-fns';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderViewModal({ isOpen, onClose, order }: OrderViewModalProps) {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status and Priority */}
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(order.priority)}`}>
              {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
            </div>
            <div className="text-sm text-gray-500">
              Tracking: <span className="font-medium text-gray-900">{order.trackingNumber}</span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{order.customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{order.customer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{order.customer.phone}</p>
              </div>
              {order.customer.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="text-sm text-gray-900">{order.customer.company}</p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Pickup Address</h3>
              </div>
              <div className="text-sm text-gray-700">
                <p>{order.pickupAddress.street}</p>
                <p>{order.pickupAddress.city}, {order.pickupAddress.state} {order.pickupAddress.zipCode}</p>
                <p>{order.pickupAddress.country}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <TruckIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Delivery Address</h3>
              </div>
              <div className="text-sm text-gray-700">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                <p>{order.deliveryAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.category}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.weight}kg</td>
                      <td className="px-4 py-2 text-sm text-gray-900">${item.value.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ${(item.value * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                </div>
                {order.deliveryDate && (
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {format(order.deliveryDate, 'PPP p')}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {format(order.createdAt, 'PPP p')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {format(order.updatedAt, 'PPP p')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ${(order.totalAmount - order.deliveryFee - order.tax + order.discount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium text-gray-900">${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Special Instructions</h3>
              <p className="text-sm text-gray-700">{order.specialInstructions}</p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.open(`/track?id=${order.trackingNumber}`, '_blank')}
            className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Share Tracking
          </button>
          <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
}