import React from 'react';
import { ClockIcon, UserIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PickingTask } from '../../types/warehouse';
import { format, formatDistanceToNow } from 'date-fns';

interface PickingTaskCardProps {
  task: PickingTask;
  onAssign: (taskId: string, userId: string) => void;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onViewDetails: (task: PickingTask) => void;
}

export default function PickingTaskCard({ task, onAssign, onStart, onComplete, onViewDetails }: PickingTaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned':
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

  const completedItems = task.items.filter(item => item.status === 'picked').length;
  const totalItems = task.items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{task.orderId}</h3>
          <p className="text-sm text-gray-500">Task ID: {task.id}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{completedItems}/{totalItems} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-600">Estimated Time</div>
              <div className="font-medium">{task.estimatedTime} min</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-600">Assigned To</div>
              <div className="font-medium">{task.assignedTo || 'Unassigned'}</div>
            </div>
          </div>
        </div>

        {/* Created Time */}
        <div className="text-sm text-gray-500">
          Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
        </div>

        {/* Items Preview */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Items to Pick:</div>
          <div className="space-y-1">
            {task.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Qty: {item.quantityRequested}</span>
                  {item.status === 'picked' && (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  )}
                  {item.status === 'short' && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
            {task.items.length > 3 && (
              <div className="text-sm text-gray-500">
                +{task.items.length - 3} more items
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetails(task)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          
          {task.status === 'pending' && (
            <button
              onClick={() => onAssign(task.id, 'current-user')}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Assign to Me
            </button>
          )}
          
          {task.status === 'assigned' && (
            <button
              onClick={() => onStart(task.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Start Picking
            </button>
          )}
          
          {task.status === 'in_progress' && completedItems === totalItems && (
            <button
              onClick={() => onComplete(task.id)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              Complete Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}