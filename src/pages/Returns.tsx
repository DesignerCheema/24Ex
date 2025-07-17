import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUturnLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ReturnRequest, ReturnFormData } from '../types';
import { ReturnsService } from '../services/returnsService';
import { format } from 'date-fns';
import ReturnForm from '../components/Returns/ReturnForm';
import ReturnViewModal from '../components/Returns/ReturnViewModal';
import { useAuth } from '../contexts/AuthContext';

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [isReturnViewOpen, setIsReturnViewOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<ReturnRequest | null>(null);
  const [viewingReturn, setViewingReturn] = useState<ReturnRequest | null>(null);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const returnsData = await ReturnsService.getAllReturns();
      setReturns(returnsData);
    } catch (error) {
      console.error('Failed to load returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = useMemo(() => {
    return returns.filter(returnReq => {
      const matchesSearch = returnReq.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           returnReq.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           returnReq.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           returnReq.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || returnReq.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const handleCreateReturn = async (data: ReturnFormData) => {
    try {
      setLoading(true);
      const newReturn = await ReturnsService.createReturn(data);
      setReturns([newReturn, ...returns]);
    } catch (error) {
      console.error('Failed to create return:', error);
      alert('Failed to create return request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (returnId: string) => {
    try {
      setLoading(true);
      const updatedReturn = await ReturnsService.approveReturn(returnId, 'Current User');
      setReturns(returns.map(ret => ret.id === returnId ? updatedReturn : ret));
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
      const updatedReturn = await ReturnsService.rejectReturn(returnId, 'Current User', reason);
      setReturns(returns.map(ret => ret.id === returnId ? updatedReturn : ret));
    } catch (error) {
      console.error('Failed to reject return:', error);
      alert('Failed to reject return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReturn = async (returnId: string) => {
    try {
      setLoading(true);
      const updatedReturn = await ReturnsService.completeReturn(returnId, 'Current User');
      setReturns(returns.map(ret => ret.id === returnId ? updatedReturn : ret));
    } catch (error) {
      console.error('Failed to complete return:', error);
      alert('Failed to complete return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReturn = async (returnId: string) => {
    if (window.confirm('Are you sure you want to delete this return request?')) {
      try {
        setLoading(true);
        await ReturnsService.deleteReturn(returnId);
        setReturns(returns.filter(ret => ret.id !== returnId));
      } catch (error) {
        console.error('Failed to delete return:', error);
        alert('Failed to delete return. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewReturn = (returnReq: ReturnRequest) => {
    setViewingReturn(returnReq);
    setIsReturnViewOpen(true);
  };

  const handleSelectReturn = (returnId: string) => {
    setSelectedReturns(prev => 
      prev.includes(returnId) 
        ? prev.filter(id => id !== returnId)
        : [...prev, returnId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReturns.length === filteredReturns.length) {
      setSelectedReturns([]);
    } else {
      setSelectedReturns(filteredReturns.map(ret => ret.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const returnStats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    completed: returns.filter(r => r.status === 'completed').length,
    totalRefunds: returns.reduce((sum, r) => sum + r.refundAmount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
          <p className="text-gray-600">Manage return requests and refunds</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasPermission('returns', 'create') && (
            <button
              onClick={() => setIsReturnFormOpen(true)}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Return</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">{returnStats.total}</p>
            </div>
            <ArrowUturnLeftIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{returnStats.pending}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-blue-600">{returnStats.approved}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{returnStats.completed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-red-600">${returnStats.totalRefunds.toLocaleString()}</p>
            </div>
            <ArrowUturnLeftIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReturns.length === filteredReturns.length && filteredReturns.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
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
                  Status
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
                    <input
                      type="checkbox"
                      checked={selectedReturns.includes(returnReq.id)}
                      onChange={() => handleSelectReturn(returnReq.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(returnReq.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnReq.status)}`}>
                        {returnReq.status}
                      </span>
                    </div>
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
                      
                      {returnReq.status === 'pending' && hasPermission('returns', 'update') && (
                        <>
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
                        </>
                      )}
                      
                      {returnReq.status === 'approved' && hasPermission('returns', 'update') && (
                        <button
                          onClick={() => handleCompleteReturn(returnReq.id)}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Complete Return"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {hasPermission('returns', 'delete') && (
                        <button
                          onClick={() => handleDeleteReturn(returnReq.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Return"
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

        {filteredReturns.length === 0 && (
          <div className="p-12 text-center">
            <ArrowUturnLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or create a new return request.
            </p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredReturns.length} of {returns.length} returns
            {selectedReturns.length > 0 && ` (${selectedReturns.length} selected)`}
          </div>
        </div>
      </div>

      {/* Return Form Modal */}
      <ReturnForm
        isOpen={isReturnFormOpen}
        onClose={() => setIsReturnFormOpen(false)}
        onSubmit={handleCreateReturn}
      />

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
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}