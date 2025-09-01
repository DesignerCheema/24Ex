import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ReturnsService } from '../../services/returnsService';
import { ReturnRequest } from '../../types';
import { format } from 'date-fns';
import ReturnViewModal from '../../components/Returns/ReturnViewModal';

export default function PendingReturns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReturnViewOpen, setIsReturnViewOpen] = useState(false);
  const [viewingReturn, setViewingReturn] = useState<ReturnRequest | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingReturns();
  }, []);

  const loadPendingReturns = async () => {
    try {
      setLoading(true);
      const allReturns = await ReturnsService.getAllReturns();
      const pendingReturns = allReturns.filter(returnReq => 
        returnReq.status === 'pending'
      );
      setReturns(pendingReturns);
    } catch (error) {
      console.error('Failed to load pending returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(returnReq => {
    const matchesSearch = returnReq.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnReq.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnReq.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleApproveReturn = async (returnId: string) => {
    try {
      setLoading(true);
      const updatedReturn = await ReturnsService.approveReturn(returnId, 'Current User');
      setReturns(returns.filter(ret => ret.id !== returnId)); // Remove from pending list
      alert('Return approved successfully!');
    } catch (error) {
      console.error('Failed to approve return:', error);
      alert('Failed to approve return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReturn = async (returnId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setLoading(true);
      await ReturnsService.rejectReturn(returnId, 'Current User', reason);
      setReturns(returns.filter(ret => ret.id !== returnId)); // Remove from pending list
      alert('Return rejected successfully!');
    } catch (error) {
      console.error('Failed to reject return:', error);
      alert('Failed to reject return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReturn = (returnReq: ReturnRequest) => {
    setViewingReturn(returnReq);
    setIsReturnViewOpen(true);
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
            <h1 className="text-2xl font-bold text-gray-900">Pending Returns</h1>
            <p className="text-gray-600">Review and process return requests</p>
          </div>
        </div>
      </div>

      {/* Pending Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Returns</p>
              <p className="text-2xl font-bold text-yellow-600">{returns.length}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refund Value</p>
              <p className="text-2xl font-bold text-red-600">
                ${returns.reduce((sum, ret) => sum + ret.refundAmount, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-red-600 text-2xl">$</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-blue-600">2.3 days</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pending returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((returnReq) => (
                <tr key={returnReq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Return #{returnReq.id}</div>
                      <div className="text-sm text-gray-500">Order: {returnReq.orderNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{returnReq.customer.name}</div>
                      <div className="text-sm text-gray-500">{returnReq.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{returnReq.reason}</div>
                    <div className="text-sm text-gray-500">{returnReq.items.length} item(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${returnReq.refundAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(returnReq.createdAt, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewReturn(returnReq)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Return"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleApproveReturn(returnReq.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Approve Return"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRejectReturn(returnReq.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Reject Return"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReturns.length === 0 && (
          <div className="p-12 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending returns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              All return requests have been processed or try adjusting your search.
            </p>
          </div>
        )}
      </div>

      {/* Return View Modal */}
      <ReturnViewModal
        isOpen={isReturnViewOpen}
        onClose={() => {
          setIsReturnViewOpen(false);
          setViewingReturn(null);
        }}
        returnRequest={viewingReturn}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing return...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}