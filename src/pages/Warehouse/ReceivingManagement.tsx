import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArchiveBoxIcon, 
  ArrowLeftIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { WarehouseService } from '../../services/warehouseService';
import { ReceivingTask, ReceivingFormData } from '../../types/warehouse';
import ReceivingForm from '../../components/Warehouse/ReceivingForm';
import ReceivingTaskCard from '../../components/Warehouse/ReceivingTaskCard';

export default function ReceivingManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [receivingTasks, setReceivingTasks] = useState<ReceivingTask[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isReceivingFormOpen, setIsReceivingFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadReceivingTasks();
    loadWarehouses();
  }, []);

  const loadReceivingTasks = async () => {
    try {
      setLoading(true);
      const tasks = await WarehouseService.getReceivingTasks();
      setReceivingTasks(tasks);
    } catch (error) {
      console.error('Failed to load receiving tasks:', error);
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

  const filteredTasks = receivingTasks.filter(task => {
    const matchesSearch = (task.purchaseOrderId && task.purchaseOrderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         task.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateTask = async (data: ReceivingFormData) => {
    try {
      setLoading(true);
      const newTask = await WarehouseService.createReceivingTask(data);
      setReceivingTasks([newTask, ...receivingTasks]);
    } catch (error) {
      console.error('Failed to create receiving task:', error);
      alert('Failed to create receiving task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const updatedTask = await WarehouseService.updateReceivingTask(taskId, {
        assignedTo: 'Current User',
        status: 'pending'
      });
      setReceivingTasks(receivingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const updatedTask = await WarehouseService.updateReceivingTask(taskId, {
        status: 'in_progress'
      });
      setReceivingTasks(receivingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const updatedTask = await WarehouseService.updateReceivingTask(taskId, {
        status: 'completed',
        receivedDate: new Date()
      });
      setReceivingTasks(receivingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleViewDetails = (task: ReceivingTask) => {
    alert(`Viewing details for receiving task: ${task.id}`);
  };

  const receivingStats = {
    total: receivingTasks.length,
    pending: receivingTasks.filter(t => t.status === 'pending').length,
    inProgress: receivingTasks.filter(t => t.status === 'in_progress').length,
    completed: receivingTasks.filter(t => t.status === 'completed').length
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
            <h1 className="text-2xl font-bold text-gray-900">Receiving Management</h1>
            <p className="text-gray-600">Manage incoming inventory and returns</p>
          </div>
        </div>
        <button
          onClick={() => setIsReceivingFormOpen(true)}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Receiving Task</span>
        </button>
      </div>

      {/* Receiving Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{receivingStats.total}</p>
            </div>
            <ArchiveBoxIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{receivingStats.pending}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{receivingStats.inProgress}</p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{receivingStats.completed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
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
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <ReceivingTaskCard
                key={task.id}
                task={task}
                onAssign={handleAssignTask}
                onStart={handleStartTask}
                onComplete={handleCompleteTask}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receiving tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or create a new receiving task.
            </p>
          </div>
        )}
      </div>

      {/* Receiving Form Modal */}
      <ReceivingForm
        isOpen={isReceivingFormOpen}
        onClose={() => setIsReceivingFormOpen(false)}
        onSubmit={handleCreateTask}
        warehouses={warehouses}
      />
    </div>
  );
}