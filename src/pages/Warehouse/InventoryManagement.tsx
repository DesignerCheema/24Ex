import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CubeIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { WarehouseService } from '../../services/warehouseService';
import { InventoryItem, InventoryFormData } from '../../types/warehouse';
import InventoryForm from '../../components/Warehouse/InventoryForm';

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInventoryItems();
    loadWarehouses();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const items = await WarehouseService.getAllInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const warehousesData = await WarehouseService.getAllWarehouses();
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateItem = async (data: InventoryFormData) => {
    try {
      setLoading(true);
      const newItem = await WarehouseService.createInventoryItem(data);
      setInventoryItems([newItem, ...inventoryItems]);
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      alert('Failed to create inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (data: InventoryFormData) => {
    if (!editingItem) return;

    try {
      setLoading(true);
      const updatedItem = await WarehouseService.updateInventoryItem(editingItem.id, data);
      setInventoryItems(inventoryItems.map(item => item.id === editingItem.id ? updatedItem : item));
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      alert('Failed to update inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'out_of_stock';
    if (item.quantity <= item.reorderPoint) return 'low_stock';
    if (item.quantity >= item.maxStock) return 'overstock';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overstock':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const inventoryStats = {
    total: inventoryItems.length,
    lowStock: inventoryItems.filter(item => getStockStatus(item) === 'low_stock').length,
    outOfStock: inventoryItems.filter(item => getStockStatus(item) === 'out_of_stock').length,
    totalValue: inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/warehouse')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Manage stock levels and inventory items</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsInventoryFormOpen(true);
          }}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.total}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">${inventoryStats.totalValue.toLocaleString()}</p>
            </div>
            <div className="text-green-600 text-2xl">$</div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="discontinued">Discontinued</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku} • {item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStockStatusColor(stockStatus)}`}>
                        {stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                      <div className="text-xs text-gray-500">Min: {item.minStock} | Max: {item.maxStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location.fullLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(item.quantity * item.cost).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Form Modal */}
      <InventoryForm
        isOpen={isInventoryFormOpen}
        onClose={() => {
          setIsInventoryFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
        warehouses={warehouses}
        initialData={editingItem}
      />
    </div>
  );
}