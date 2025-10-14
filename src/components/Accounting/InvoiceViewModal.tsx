import React from 'react';
import { XMarkIcon, DocumentTextIcon, CreditCardIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { Invoice } from '../../services/accountingService';
import { format } from 'date-fns';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function InvoiceViewModal({ isOpen, onClose, invoice }: InvoiceViewModalProps) {
  if (!isOpen || !invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
            <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-lg text-gray-600">{invoice.invoiceNumber}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>

          {/* Company and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">From:</h3>
              <div className="text-gray-700">
                <div className="font-semibold text-xl text-blue-600">24EX Delivery</div>
                <div>123 Business Street</div>
                <div>New York, NY 10001</div>
                <div>United States</div>
                <div className="mt-2">
                  <div>Phone: +1 (555) 123-4567</div>
                  <div>Email: billing@24ex.com</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="text-gray-700">
                <div className="font-semibold">{invoice.customerName}</div>
                <div>{invoice.customerEmail}</div>
                {invoice.orderNumber && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">Related Order:</div>
                    <div className="font-medium">{invoice.orderNumber}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Issue Date</div>
                <div className="font-medium text-gray-900">{format(invoice.issueDate, 'MMM dd, yyyy')}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Due Date</div>
                <div className="font-medium text-gray-900">{format(invoice.dueDate, 'MMM dd, yyyy')}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Payment Terms</div>
                <div className="font-medium text-gray-900">{invoice.paymentTerms}</div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-${invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium text-gray-900">${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">${invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">${invoice.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="text-red-600">${invoice.remainingAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {invoice.paidDate && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 mb-2">Payment Information</h3>
              <div className="text-sm text-green-800">
                <div>Paid on: {format(invoice.paidDate, 'PPP')}</div>
                <div>Amount: ${invoice.paidAmount.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
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
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}