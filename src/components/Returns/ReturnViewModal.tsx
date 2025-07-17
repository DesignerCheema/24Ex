import React from 'react';
import { XMarkIcon, ArrowUturnLeftIcon, UserIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { ReturnRequest } from '../../types';
import { format } from 'date-fns';

interface ReturnViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnRequest: ReturnRequest | null;
}

export default function ReturnViewModal({ isOpen, onClose, returnRequest }: ReturnViewModalProps) {
  if (!isOpen || !returnRequest) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case 'restock':
        return 'bg-green-100 text-green-800';
      case 'damage':
        return 'bg-red-100 text-red-800';
      case 'discard':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Return Request Details</h2>
            <p className="text-sm text-gray-500">Return #{returnRequest.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(returnRequest.status)}`}>
              {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDispositionColor(returnRequest.disposition)}`}>
              Disposition: {returnRequest.disposition}
            </div>
          </div>

          {/* Order and Customer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <ArrowUturnLeftIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-900">{returnRequest.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Reason:</span>
                  <span className="font-medium text-gray-900">{returnRequest.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {format(returnRequest.createdAt, 'PPP')}
                  </span>
                </div>
                {returnRequest.processedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed:</span>
                    <span className="font-medium text-gray-900">
                      {format(returnRequest.processedAt, 'PPP')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <UserIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{returnRequest.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{returnRequest.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{returnRequest.customer.phone}</span>
                </div>
                {returnRequest.customer.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium text-gray-900">{returnRequest.customer.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Return Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Return Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnRequest.items.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.condition === 'new' ? 'bg-green-100 text-green-800' :
                          item.condition === 'used' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.reason || '-'}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ${item.refundAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Refund Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ${returnRequest.refundAmount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Refund Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {returnRequest.items.length}
                </div>
                <div className="text-sm text-gray-600">Items Returned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {returnRequest.items.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Quantity</div>
              </div>
            </div>
          </div>

          {/* Processing Information */}
          {returnRequest.processedBy && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Processing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Processed By:</span>
                  <div className="font-medium text-gray-900">{returnRequest.processedBy}</div>
                </div>
                <div>
                  <span className="text-gray-600">Processed Date:</span>
                  <div className="font-medium text-gray-900">
                    {returnRequest.processedAt ? format(returnRequest.processedAt, 'PPP p') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {returnRequest.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{returnRequest.notes}</p>
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
          <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Print Return Details
          </button>
        </div>
      </div>
    </div>
  );
}