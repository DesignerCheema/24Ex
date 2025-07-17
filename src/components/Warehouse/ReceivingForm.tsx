import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ReceivingFormData } from '../../types/warehouse';

interface ReceivingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReceivingFormData) => void;
  warehouses: any[];
}

export default function ReceivingForm({ isOpen, onClose, onSubmit, warehouses }: ReceivingFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReceivingFormData>({
    defaultValues: {
      expectedItems: [{ sku: '', name: '', expectedQuantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expectedItems',
  });

  const handleFormSubmit = (data: ReceivingFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Receiving Task</h2>
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
              <label className="block text-sm font-medium text-gray-700">Purchase Order ID</label>
              <input
                {...register('purchaseOrderId')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., PO-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Warehouse *</label>
              <select
                {...register('warehouseId', { required: 'Warehouse is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
              {errors.warehouseId && (
                <p className="mt-1 text-sm text-red-600">{errors.warehouseId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier *</label>
              <input
                {...register('supplier', { required: 'Supplier is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Tech Supplier Inc"
              />
              {errors.supplier && (
                <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date *</label>
              <input
                {...register('scheduledDate', { required: 'Scheduled date is required' })}
                type="datetime-local"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
              )}
            </div>
          </div>

          {/* Expected Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Expected Items</h3>
              <button
                type="button"
                onClick={() => append({ sku: '', name: '', expectedQuantity: 1 })}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU *</label>
                    <input
                      {...register(`expectedItems.${index}.sku`, { required: 'SKU is required' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ELEC-001"
                    />
                    {errors.expectedItems?.[index]?.sku && (
                      <p className="mt-1 text-sm text-red-600">{errors.expectedItems[index]?.sku?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      {...register(`expectedItems.${index}.name`, { required: 'Name is required' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Laptop Computer"
                    />
                    {errors.expectedItems?.[index]?.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.expectedItems[index]?.name?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Quantity *</label>
                    <input
                      {...register(`expectedItems.${index}.expectedQuantity`, {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' },
                      })}
                      type="number"
                      min="1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.expectedItems?.[index]?.expectedQuantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.expectedItems[index]?.expectedQuantity?.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input
                      {...register(`expectedItems.${index}.batchNumber`)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., BATCH-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      {...register(`expectedItems.${index}.expiryDate`)}
                      type="date"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes or special instructions..."
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
              Create Receiving Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}