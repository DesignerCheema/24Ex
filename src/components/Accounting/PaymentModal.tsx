import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { Invoice, Payment } from '../../services/accountingService';

interface PaymentFormData {
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  paymentDate: Date;
  reference?: string;
  notes?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (data: Omit<Payment, 'id' | 'createdAt'>) => void;
}

export default function PaymentModal({ isOpen, onClose, invoice, onSubmit }: PaymentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    defaultValues: {
      amount: invoice?.totalAmount || 0,
      paymentMethod: 'card',
      paymentDate: new Date(),
    },
  });

  const handleFormSubmit = (data: PaymentFormData) => {
    if (!invoice) return;

    onSubmit({
      invoiceId: invoice.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      reference: data.reference,
      notes: data.notes,
    });

    reset();
    onClose();
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Invoice Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Invoice</div>
            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
            <div className="text-sm text-gray-600">Customer: {invoice.customerName}</div>
            <div className="text-lg font-semibold text-gray-900 mt-2">
              Total: ${invoice.totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Amount *</label>
              <input
                {...register('amount', {
                  required: 'Payment amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                  max: { value: invoice.totalAmount, message: 'Amount cannot exceed invoice total' },
                })}
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.totalAmount}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
              <select
                {...register('paymentMethod', { required: 'Payment method is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
              <input
                {...register('paymentDate', { required: 'Payment date is required' })}
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input
                {...register('reference')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Additional payment notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}