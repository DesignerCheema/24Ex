import React, { useState, useEffect, useMemo } from 'react';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Warehouse, InventoryItem, PickingTask, WarehouseFormData, InventoryFormData } from '../types/warehouse';
import { WarehouseService } from '../services/warehouseService';
import WarehouseForm from '../components/Warehouse/WarehouseForm';
import InventoryForm from '../components/Warehouse/InventoryForm';
import PickingTaskCard from '../components/Warehouse/PickingTaskCard';
import ReceivingTaskCard from '../components/Warehouse/ReceivingTaskCard';
import ReceivingForm from '../components/Warehouse/ReceivingForm';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'warehouses' | 'inventory' | 'picking' | 'receiving'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [isWarehouseFormOpen, setIsWarehouseFormOpen] = useState(false);
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [isReceivingFormOpen, setIsReceivingFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data states
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [pickingTasks, setPickingTasks] = useState<PickingTask[]>([]);
  const [receivingTasks, setReceivingTasks] = useState<any[]>([]);

  const { hasPermission } = useAuth();

  // Load data on component mount
  useEffect(() => {
    loadWarehouses();
    loadInventoryItems();
    loadPickingTasks();
    loadReceivingTasks();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await WarehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      // Mock data fallback
      setWarehouses([
        {
          id: '1',
          name: 'Main Distribution Center',
          code: 'WH001',
          address: {
            street: '1000 Industrial Blvd',
            city: 'Newark',
            state: 'NJ',
            country: 'USA',
            zipCode: '07102'
          },
          capacity: 50000,
          currentUtilization: 35000,
          zones: [],
          manager: 'Robert Davis',
          contactInfo: {
            phone: '+1-555-0123',
            email: 'robert.davis@24ex.com'
          },
          operatingHours: {
            open: '08:00',
            close: '18:00',
            timezone: 'America/New_York'
          },
          status: 'active',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const data = await WarehouseService.getAllInventoryItems();
      setInventoryItems(data);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      // Mock data fallback
      setInventoryItems([
        {
          id: '1',
          sku: 'ELEC-001',
          name: 'Laptop Computer',
          description: 'High-performance laptop for business use',
          category: 'Electronics',
          brand: 'TechBrand',
          quantity: 150,
          reservedQuantity: 25,
          availableQuantity: 125,
          minStock: 20,
          maxStock: 200,
          reorderPoint: 30,
          reorderQuantity: 50,
          location: {
            warehouseId: '1',
            zoneId: 'storage',
            aisle: 'A',
            rack: '01',
            shelf: '15',
            bin: '01',
            fullLocation: 'WH001-A-01-15-01'
          },
          dimensions: {
            length: 35,
            width: 25,
            height: 3,
            weight: 2.5
          },
          cost: 800,
          sellingPrice: 1200,
          supplier: 'Tech Supplier Inc',
          status: 'active',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          sku: 'ELEC-002',
          name: 'Smartphone',
          description: 'Latest model smartphone with advanced features',
          category: 'Electronics',
          brand: 'PhoneBrand',
          quantity: 75,
          reservedQuantity: 15,
          availableQuantity: 60,
          minStock: 50,
          maxStock: 300,
          reorderPoint: 75,
          reorderQuantity: 100,
          location: {
            warehouseId: '1',
            zoneId: 'storage',
            aisle: 'A',
            rack: '02',
            shelf: '08',
            bin: '01',
            fullLocation: 'WH001-A-02-08-01'
          },
          dimensions: {
            length: 15,
            width: 7,
            height: 1,
            weight: 0.3
          },
          cost: 400,
          sellingPrice: 800,
          supplier: 'Mobile Supplier Ltd',
          status: 'active',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-16')
        }
      ]);
    }
  };

  const loadPickingTasks = async () => {
    try {
      const data = await WarehouseService.getPickingTasks();
      setPickingTasks(data);
    } catch (error) {
      console.error('Failed to load picking tasks:', error);
      // Mock data fallback
      setPickingTasks([
        {
          id: '1',
          orderId: 'ORD-2024-001',
          warehouseId: '1',
          assignedTo: 'John Picker',
          status: 'in_progress',
          priority: 'high',
          items: [
            {
              id: '1',
              itemId: '1',
              sku: 'ELEC-001',
              name: 'Laptop Computer',
              quantityRequested: 2,
              quantityPicked: 1,
              location: {
                warehouseId: '1',
                zoneId: 'storage',
                aisle: 'A',
                rack: '01',
                shelf: '15',
                bin: '01',
                fullLocation: 'WH001-A-01-15-01'
              },
              status: 'picked'
            }
          ],
          estimatedTime: 15,
          actualTime: 10,
          createdAt: new Date('2024-01-16T08:00:00'),
          startedAt: new Date('2024-01-16T08:30:00')
        }
      ]);
    }
  };

  const loadReceivingTasks = async () => {
    try {
      const data = await WarehouseService.getReceivingTasks();
      setReceivingTasks(data);
    } catch (error) {
      console.error('Failed to load receiving tasks:', error);
    }
  };
  // Filtered data
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(warehouse => {
      const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [warehouses, searchTerm, statusFilter]);

  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesWarehouse = warehouseFilter === 'all' || item.location.warehouseId === warehouseFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'low_stock') {
        matchesStatus = item.quantity <= item.reorderPoint;
      } else if (statusFilter === 'out_of_stock') {
        matchesStatus = item.quantity === 0;
      } else if (statusFilter === 'active') {
        matchesStatus = item.status === 'active';
      }
      
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [inventoryItems, searchTerm, warehouseFilter, statusFilter]);

  const filteredPickingTasks = useMemo(() => {
    return pickingTasks.filter(task => {
      const matchesSearch = task.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesWarehouse = warehouseFilter === 'all' || task.warehouseId === warehouseFilter;
      
      return matchesSearch && matchesStatus && matchesWarehouse;
    });
  }, [pickingTasks, searchTerm, statusFilter, warehouseFilter]);

  const filteredReceivingTasks = useMemo(() => {
    return receivingTasks.filter(task => {
      const matchesSearch = task.purchaseOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.returnOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesWarehouse = warehouseFilter === 'all' || task.warehouseId === warehouseFilter;
      
      return matchesSearch && matchesStatus && matchesWarehouse;
    });
  }, [receivingTasks, searchTerm, statusFilter, warehouseFilter]);
  // Event handlers
  const handleCreateWarehouse = async (data: WarehouseFormData) => {
    try {
      setLoading(true);
      const newWarehouse = await WarehouseService.createWarehouse(data);
      setWarehouses([...warehouses, newWarehouse]);
    } catch (error) {
      console.error('Failed to create warehouse:', error);
      alert('Failed to create warehouse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWarehouse = async (data: WarehouseFormData) => {
    if (!editingWarehouse) return;

    try {
      setLoading(true);
      const updatedWarehouse = await WarehouseService.updateWarehouse(editingWarehouse.id, data);
      setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? updatedWarehouse : w));
      setEditingWarehouse(null);
    } catch (error) {
      console.error('Failed to update warehouse:', error);
      alert('Failed to update warehouse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        setLoading(true);
        await WarehouseService.deleteWarehouse(warehouseId);
        setWarehouses(warehouses.filter(w => w.id !== warehouseId));
      } catch (error) {
        console.error('Failed to delete warehouse:', error);
        alert('Failed to delete warehouse. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateInventoryItem = async (data: InventoryFormData) => {
    try {
      setLoading(true);
      const newItem = await WarehouseService.createInventoryItem(data);
      setInventoryItems([...inventoryItems, newItem]);
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      alert('Failed to create inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventoryItem = async (data: InventoryFormData) => {
    if (!editingInventoryItem) return;

    try {
      setLoading(true);
      const updatedItem = await WarehouseService.updateInventoryItem(editingInventoryItem.id, data);
      setInventoryItems(inventoryItems.map(item => item.id === editingInventoryItem.id ? updatedItem : item));
      setEditingInventoryItem(null);
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      alert('Failed to update inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        setLoading(true);
        await WarehouseService.deleteInventoryItem(itemId);
        setInventoryItems(inventoryItems.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
        alert('Failed to delete inventory item. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignPickingTask = async (taskId: string, userId: string) => {
    try {
      const updatedTask = await WarehouseService.updatePickingTask(taskId, {
        assignedTo: userId,
        status: 'assigned'
      });
      setPickingTasks(pickingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to assign picking task:', error);
      alert('Failed to assign picking task. Please try again.');
    }
  };

  const handleStartPickingTask = async (taskId: string) => {
    try {
      const updatedTask = await WarehouseService.updatePickingTask(taskId, {
        status: 'in_progress',
        startedAt: new Date()
      });
      setPickingTasks(pickingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to start picking task:', error);
      alert('Failed to start picking task. Please try again.');
    }
  };

  const handleCompletePickingTask = async (taskId: string) => {
    try {
      const updatedTask = await WarehouseService.updatePickingTask(taskId, {
        status: 'completed',
        completedAt: new Date()
      });
      setPickingTasks(pickingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to complete picking task:', error);
      alert('Failed to complete picking task. Please try again.');
    }
  };

  // Calculate statistics
  const warehouseStats = {
    total: warehouses.length,
    active: warehouses.filter(w => w.status === 'active').length,
    totalCapacity: warehouses.reduce((sum, w) => sum + w.capacity, 0),
    totalUtilization: warehouses.reduce((sum, w) => sum + w.currentUtilization, 0)
  };

  const inventoryStats = {
    totalItems: inventoryItems.length,
    totalValue: inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
    lowStock: inventoryItems.filter(item => item.quantity <= item.reorderPoint).length,
    outOfStock: inventoryItems.filter(item => item.quantity === 0).length
  };

  const pickingStats = {
    total: pickingTasks.length,
    pending: pickingTasks.filter(task => task.status === 'pending').length,
    inProgress: pickingTasks.filter(task => task.status === 'in_progress').length,
    completed: pickingTasks.filter(task => task.status === 'completed').length
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'warehouses', label: 'Warehouses', icon: BuildingStorefrontIcon },
    { id: 'inventory', label: 'Inventory', icon: CubeIcon },
    { id: 'picking', label: 'Picking Tasks', icon: ClipboardDocumentListIcon },
    { id: 'receiving', label: 'Receiving', icon: TruckIcon }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600">Manage warehouses, inventory, and operations</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'warehouses' && hasPermission('warehouses', 'create') && (
            <button
              onClick={() => {
                setEditingWarehouse(null);
                setIsWarehouseFormOpen(true);
              }}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Warehouse</span>
            </button>
          )}
          
          {activeTab === 'inventory' && hasPermission('inventory', 'create') && (
            <button
              onClick={() => {
                setEditingInventoryItem(null);
                setIsInventoryFormOpen(true);
              }}
              className="bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          )}
          
          {activeTab === 'receiving' && hasPermission('receiving', 'create') && (
            <button
              onClick={() => setIsReceivingFormOpen(true)}
              className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-purple-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Receiving Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                  <p className="text-2xl font-bold text-gray-900">{warehouseStats.total}</p>
                  <p className="text-sm text-green-600">{warehouseStats.active} active</p>
                </div>
                <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalItems}</p>
                  <p className="text-sm text-yellow-600">{inventoryStats.lowStock} low stock</p>
                </div>
                <CubeIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">${(inventoryStats.totalValue / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-gray-500">Total cost value</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{pickingStats.inProgress}</p>
                  <p className="text-sm text-blue-600">{pickingStats.pending} pending</p>
                </div>
                <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receiving Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{receivingStats.inProgress}</p>
                  <p className="text-sm text-purple-600">{receivingStats.pending} pending</p>
                </div>
                <TruckIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
              <div className="space-y-3">
                {inventoryItems
                  .filter(item => item.quantity <= item.reorderPoint)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-yellow-600">
                          {item.quantity} / {item.reorderPoint}
                        </div>
                        <div className="text-xs text-gray-500">Current / Reorder</div>
                      </div>
                    </div>
                  ))}
                {inventoryItems.filter(item => item.quantity <= item.reorderPoint).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    All items are well stocked
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Picking Tasks</h3>
              <div className="space-y-3">
                {pickingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Order #{task.orderId}</div>
                      <div className="text-sm text-gray-500">
                        {task.items.length} items • {task.assignedTo || 'Unassigned'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        task.status === 'completed' ? 'text-green-600' :
                        task.status === 'in_progress' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(task.createdAt, 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
                {pickingTasks.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <ClipboardDocumentListIcon className="h-8 w-8 mx-auto mb-2" />
                    No picking tasks available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search warehouses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWarehouses.map((warehouse) => (
              <div key={warehouse.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                    <p className="text-sm text-gray-500">{warehouse.code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    warehouse.status === 'active' ? 'bg-green-100 text-green-800' :
                    warehouse.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {warehouse.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Utilization</span>
                      <span className="font-medium">
                        {((warehouse.currentUtilization / warehouse.capacity) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(warehouse.currentUtilization / warehouse.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span className="font-medium text-gray-900">{warehouse.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-medium text-gray-900">{warehouse.capacity.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium text-gray-900">{warehouse.address.city}, {warehouse.address.state}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3 border-t border-gray-200">
                    <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      View
                    </button>
                    {hasPermission('warehouses', 'update') && (
                      <button
                        onClick={() => {
                          setEditingWarehouse(warehouse);
                          setIsWarehouseFormOpen(true);
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                    )}
                    {hasPermission('warehouses', 'delete') && (
                      <button
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
                        className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWarehouses.length === 0 && (
            <div className="text-center py-12">
              <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No warehouses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or add a new warehouse.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Items</option>
                  <option value="active">Active</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          <div className="text-sm text-gray-500">{item.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.location.fullLocation}</div>
                        <div className="text-sm text-gray-500">
                          {warehouses.find(w => w.id === item.location.warehouseId)?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.quantity} / {item.maxStock}
                        </div>
                        <div className="text-sm text-gray-500">
                          Available: {item.availableQuantity}
                        </div>
                        {item.quantity <= item.reorderPoint && (
                          <div className="text-xs text-red-600 font-medium">
                            Below reorder point
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.quantity * item.cost).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Unit: ${item.cost}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.quantity === 0 ? 'bg-red-100 text-red-800' :
                          item.quantity <= item.reorderPoint ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.quantity === 0 ? 'Out of Stock' :
                           item.quantity <= item.reorderPoint ? 'Low Stock' :
                           'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {hasPermission('inventory', 'update') && (
                            <button
                              onClick={() => {
                                setEditingInventoryItem(item);
                                setIsInventoryFormOpen(true);
                              }}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission('inventory', 'delete') && (
                            <button
                              onClick={() => handleDeleteInventoryItem(item.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInventoryItems.length === 0 && (
              <div className="text-center py-12">
                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or add a new item.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Picking Tasks Tab */}
      {activeTab === 'picking' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Picking Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPickingTasks.map((task) => (
              <PickingTaskCard
                key={task.id}
                task={task}
                onAssign={handleAssignPickingTask}
                onStart={handleStartPickingTask}
                onComplete={handleCompletePickingTask}
                onViewDetails={(task) => console.log('View details:', task)}
              />
            ))}
          </div>

          {filteredPickingTasks.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No picking tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Receiving Tab */}
      {activeTab === 'receiving' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search receiving tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="discrepancy">Discrepancy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Receiving Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceivingTasks.map((task) => (
              <ReceivingTaskCard
                key={task.id}
                task={task}
                onAssign={handleAssignReceivingTask}
                onStart={handleStartReceivingTask}
                onComplete={handleCompleteReceivingTask}
                onViewDetails={(task) => console.log('View details:', task)}
              />
            ))}
          </div>

          {filteredReceivingTasks.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No receiving tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or create a new receiving task.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Forms */}
      <WarehouseForm
        isOpen={isWarehouseFormOpen}
        onClose={() => {
          setIsWarehouseFormOpen(false);
          setEditingWarehouse(null);
        }}
        onSubmit={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
        initialData={editingWarehouse ? {
          name: editingWarehouse.name,
          code: editingWarehouse.code,
          address: editingWarehouse.address,
          capacity: editingWarehouse.capacity,
          manager: editingWarehouse.manager,
          contactInfo: editingWarehouse.contactInfo,
          operatingHours: editingWarehouse.operatingHours,
        } : undefined}
      />

      <InventoryForm
        isOpen={isInventoryFormOpen}
        onClose={() => {
          setIsInventoryFormOpen(false);
          setEditingInventoryItem(null);
        }}
        onSubmit={editingInventoryItem ? handleUpdateInventoryItem : handleCreateInventoryItem}
        warehouses={warehouses}
        initialData={editingInventoryItem ? {
          sku: editingInventoryItem.sku,
          name: editingInventoryItem.name,
          description: editingInventoryItem.description,
          category: editingInventoryItem.category,
          brand: editingInventoryItem.brand,
          quantity: editingInventoryItem.quantity,
          minStock: editingInventoryItem.minStock,
          maxStock: editingInventoryItem.maxStock,
          reorderPoint: editingInventoryItem.reorderPoint,
          reorderQuantity: editingInventoryItem.reorderQuantity,
          location: editingInventoryItem.location,
          dimensions: editingInventoryItem.dimensions,
          cost: editingInventoryItem.cost,
          sellingPrice: editingInventoryItem.sellingPrice,
          supplier: editingInventoryItem.supplier,
          expiryDate: editingInventoryItem.expiryDate,
          batchNumber: editingInventoryItem.batchNumber,
        } : undefined}
      />

      <ReceivingForm
        isOpen={isReceivingFormOpen}
        onClose={() => setIsReceivingFormOpen(false)}
        onSubmit={handleCreateReceivingTask}
        warehouses={warehouses}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}