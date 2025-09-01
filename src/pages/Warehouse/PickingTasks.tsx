import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { WarehouseService } from '../../services/warehouseService';
import { PickingTask } from '../../types/warehouse';
import PickingTaskCard from '../../components/Warehouse/PickingTaskCard';

export default function PickingTasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pickingTasks, setPickingTasks] = useState<PickingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPickingTasks();
  }, []);

  const loadPickingTasks = async () => {
    try {
      setLoading(true);
      const tasks = await WarehouseService.getPickingTasks();
      setPickingTasks(tasks);
    } catch (error) {
      console.error('Failed to load picking tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = pickingTasks.filter(task => {
    const matchesSearch = task.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const updatedTask = await WarehouseService.updatePickingTask(taskId, {
        assignedTo: 'Current User',
        status: 'assigned'
      });
      setPickingTasks(pickingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const updatedTask = await WarehouseService.updatePickingTask(taskId, {
        status: 'in_progress',
        startedAt: new Date()
      });
      setPickingTasks(pickingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const updatedTask = await WarehouseService.updatePickingTask(taskId, {
        status: 'completed',
        completedAt: new Date()
      });
      setPickingTasks(pickingTasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleViewDetails = (task: PickingTask) => {
    alert(`Viewing details for picking task: ${task.id}`);
  };

  const pickingStats = {
    total: pickingTasks.length,
    pending: pickingTasks.filter(t => t.status === 'pending').length,
    assigned: pickingTasks.filter(t => t.status === 'assigned').length,
    inProgress: pickingTasks.filter(t => t.status === 'in_progress').length,
    completed: pickingTasks.filter(t => t.status === 'completed').length
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
            <h1 className="text-2xl font-bold text-gray-900">Picking Tasks</h1>
            <p className="text-gray-600">Manage order picking and fulfillment</p>
          </div>
        </div>
      </div>

      {/* Picking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{pickingStats.total}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pickingStats.pending}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-blue-600">{pickingStats.assigned}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600">{pickingStats.inProgress}</p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{pickingStats.completed}</p>
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
                  placeholder="Search picking tasks..."
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
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Picking Tasks Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <PickingTaskCard
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
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No picking tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}