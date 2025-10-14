import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import UserForm from '../../components/Users/UserForm';
import { UserFormData, UserService } from '../../services/userService';

export default function AddUser() {
  const [isUserFormOpen, setIsUserFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateUser = async (data: UserFormData) => {
    try {
      setLoading(true);
      await UserService.createUser(data);
      navigate('/users', { 
        state: { message: `User ${data.name} created successfully!` }
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/users');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="text-gray-600">Create a new staff account</p>
          </div>
        </div>
      </div>

      {/* User Creation Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">User Creation Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div>• Choose appropriate role based on responsibilities</div>
            <div>• Provide accurate contact information</div>
            <div>• Default permissions will be applied automatically</div>
          </div>
          <div className="space-y-2">
            <div>• User will receive welcome email with login credentials</div>
            <div>• Permissions can be customized after creation</div>
            <div>• Account can be activated/deactivated as needed</div>
          </div>
        </div>
      </div>

      {/* Role Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900">Administrator</h4>
            <p className="text-sm text-red-700">Full system access and control</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">Dispatcher</h4>
            <p className="text-sm text-blue-700">Order and delivery coordination</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900">Delivery Agent</h4>
            <p className="text-sm text-green-700">Field delivery operations</p>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900">Warehouse Staff</h4>
            <p className="text-sm text-yellow-700">Inventory and warehouse management</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900">Accounting</h4>
            <p className="text-sm text-purple-700">Financial operations and reporting</p>
          </div>
        </div>
      </div>

      {/* User Form */}
      <UserForm
        isOpen={isUserFormOpen}
        onClose={handleClose}
        onSubmit={handleCreateUser}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Creating user...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}