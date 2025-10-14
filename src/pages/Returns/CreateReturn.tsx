import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import ReturnForm from '../../components/Returns/ReturnForm';
import { ReturnFormData } from '../../types';
import { ReturnsService } from '../../services/returnsService';

export default function CreateReturn() {
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateReturn = async (data: ReturnFormData) => {
    try {
      setLoading(true);
      await ReturnsService.createReturn(data);
      navigate('/returns', { 
        state: { message: 'Return request created successfully!' }
      });
    } catch (error) {
      console.error('Failed to create return:', error);
      alert('Failed to create return request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/returns');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/returns')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Return Request</h1>
            <p className="text-gray-600">Process a new return request</p>
          </div>
        </div>
      </div>

      {/* Return Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">Return Policy Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
          <div className="space-y-2">
            <div>• Returns must be initiated within 30 days</div>
            <div>• Items must be in original condition</div>
            <div>• Original packaging required for electronics</div>
          </div>
          <div className="space-y-2">
            <div>• Refund processing takes 3-5 business days</div>
            <div>• Return shipping costs may apply</div>
            <div>• Damaged items require photo evidence</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">30</div>
          <div className="text-sm text-gray-500">Days Return Window</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">95%</div>
          <div className="text-sm text-gray-500">Approval Rate</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">3-5</div>
          <div className="text-sm text-gray-500">Days Processing</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">2.1%</div>
          <div className="text-sm text-gray-500">Return Rate</div>
        </div>
      </div>

      {/* Return Form */}
      <ReturnForm
        isOpen={isReturnFormOpen}
        onClose={handleClose}
        onSubmit={handleCreateReturn}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Creating return request...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}