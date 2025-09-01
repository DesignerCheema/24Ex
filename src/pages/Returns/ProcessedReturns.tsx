import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { ReturnsService } from '../../services/returnsService';
import { ReturnRequest } from '../../types';
import { format } from 'date-fns';
import ReturnViewModal from '../../components/Returns/ReturnViewModal';

export default function ProcessedReturns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReturnViewOpen, setIsReturnViewOpen] = useState(false);
  const [viewingReturn, setViewingReturn] = useState<ReturnRequest | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProcessedReturns();
  }, []);

  const loadProcessedReturns = async () => {
    try {
      setLoading(true);
      const allReturns = await ReturnsService.getAllReturns();
      const processedReturns = allReturns.filter(returnReq => 
        ['approved', 'rejected', 'processed', 'completed'].includes(returnReq.status)
      );
      setReturns(processedReturns);
    } catch (error) {
      console.error('Failed to load processed returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(returnReq => {
    const matchesSearch = returnReq.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnReq.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnReq.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || returnReq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewReturn = (returnReq: ReturnRequest) => {
    setViewingReturn(returnReq);
    setIsReturnViewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const processedStats = {
    total: returns.length,
    approved: returns.filter(r => r.status === 'approved').length,
    completed: returns.filter(r => r.status === 'completed').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    totalRefunds: returns.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.refundAmount, 0)
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
            <h1 className="text-2xl font-bold text-gray-900">Processed Returns</h1>
            <p className="text-gray-600">View completed and processed return requests</p>
          </div>
        </div>
        <button className="bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 flex items-center space-x-2">
          <DocumentArrowDownIcon className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Processed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900">{processedStats.total}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-blue-600">{processedStats.approved}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{processedStats.completed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{processedStats.rejected}</p>
            </div>
            <div className="text-red-600 text-2xl">✕</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-purple-600">${processedStats.totalRefunds.toLocaleString()}</p>
            </div>
            <div className="text-purple-600 text-2xl">$</div>
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
                  placeholder="Search processed returns..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processed Date
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(returnReq.status)}`}>
                      {returnReq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${returnReq.refundAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {returnReq.processedAt ? format(returnReq.processedAt, 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleViewReturn(returnReq)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Return"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}