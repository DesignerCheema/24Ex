import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { InventoryFormData } from '../../types/warehouse';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => void;
  warehouses: any[];
  initialData?: Partial<InventoryFormData>;
}

export default function InventoryForm({ isOpen, onClose, onSubmit, warehouses, initialData }: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<InventoryFormData>({
    defaultValues: initialData || {
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
      },
      location: {
        warehouseId: '',
        zoneId: 'storage',
        aisle: 'A',
        rack: '01',
        shelf: '01',
        bin: '01',
      },
    },
  });

  const selectedWarehouse = watch('location.warehouseId');

  const handleFormSubmit = (data: InventoryFormData) => {
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
            {initialData ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU *</label>
                <input
                  {...register('sku', { required: 'SKU is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ELEC-001"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Laptop Computer"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
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
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  {...register('brand')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Apple, Samsung"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <input
                  {...register('supplier')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                <input
                  {...register('batchNumber')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., BATCH-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  {...register('expiryDate')}
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quantity Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quantity & Stock Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Quantity *</label>
                <input
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity cannot be negative' },
                  })}
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Stock *</label>
                <input
                  {...register('minStock', {
                    required: 'Minimum stock is required',
                    min: { value: 0, message: 'Minimum stock cannot be negative' },
                  })}
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.minStock && (
                  <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Stock *</label>
                <input
                  {...register('maxStock', {
                    required: 'Maximum stock is required',
                    min: { value: 1, message: 'Maximum stock must be greater than 0' },
                  })}
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.maxStock && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxStock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reorder Point *</label>
                <input
                  {...register('reorderPoint', {
                    required: 'Reorder point is required',
                    min: { value: 0, message: 'Reorder point cannot be negative' },
                  })}
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.reorderPoint && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorderPoint.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reorder Quantity *</label>
                <input
                  {...register('reorderQuantity', {
                    required: 'Reorder quantity is required',
                    min: { value: 1, message: 'Reorder quantity must be greater than 0' },
                  })}
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.reorderQuantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.reorderQuantity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Warehouse *</label>
                <select
                  {...register('location.warehouseId', { required: 'Warehouse is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
                {errors.location?.warehouseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.warehouseId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Zone *</label>
                <select
                  {...register('location.zoneId', { required: 'Zone is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="receiving">Receiving</option>
                  <option value="storage">Storage</option>
                  <option value="picking">Picking</option>
                  <option value="packing">Packing</option>
                  <option value="shipping">Shipping</option>
                  <option value="returns">Returns</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Aisle *</label>
                <input
                  {...register('location.aisle', { required: 'Aisle is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rack *</label>
                <input
                  {...register('location.rack', { required: 'Rack is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 01, 02, 03"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Shelf *</label>
                <input
                  {...register('location.shelf', { required: 'Shelf is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 01, 02, 03"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bin *</label>
                <input
                  {...register('location.bin', { required: 'Bin is required' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 01, 02, 03"
                />
              </div>
            </div>
          </div>

          {/* Dimensions & Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Length (cm)</label>
                  <input
                    {...register('dimensions.length', {
                      min: { value: 0, message: 'Length cannot be negative' },
                    })}
                    type="number"
                    step="0.1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (cm)</label>
                  <input
                    {...register('dimensions.width', {
                      min: { value: 0, message: 'Width cannot be negative' },
                    })}
                    type="number"
                    step="0.1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    {...register('dimensions.height', {
                      min: { value: 0, message: 'Height cannot be negative' },
                    })}
                    type="number"
                    step="0.1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    {...register('dimensions.weight', {
                      min: { value: 0, message: 'Weight cannot be negative' },
                    })}
                    type="number"
                    step="0.1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost Price ($) *</label>
                  <input
                    {...register('cost', {
                      required: 'Cost is required',
                      min: { value: 0, message: 'Cost cannot be negative' },
                    })}
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.cost && (
                    <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price ($) *</label>
                  <input
                    {...register('sellingPrice', {
                      required: 'Selling price is required',
                      min: { value: 0, message: 'Selling price cannot be negative' },
                    })}
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.sellingPrice.message}</p>
                  )}
                </div>
              </div>
            </div>
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
              {initialData ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}