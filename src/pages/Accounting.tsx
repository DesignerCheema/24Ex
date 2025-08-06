import React, { useState, useEffect, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { AccountingService, Invoice, Payment, FinancialSummary } from '../services/accountingService';
import { format, differenceInDays } from 'date-fns';
import InvoiceForm from '../components/Accounting/InvoiceForm';
import InvoiceViewModal from '../components/Accounting/InvoiceViewModal';
import PaymentModal from '../components/Accounting/PaymentModal';
import FinancialReports from '../components/Accounting/FinancialReports';
import { useAuth } from '../contexts/AuthContext';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'reports' | 'receivables'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [accountsReceivable, setAccountsReceivable] = useState<any>(null);

  const { hasPermission } = useAuth();

  // Load data on component mount
  useEffect(() => {
    loadInvoices();
    loadPayments();
    loadFinancialSummary();
    loadAccountsReceivable();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await AccountingService.getAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await AccountingService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      const data = await AccountingService.getFinancialSummary();
      setFinancialSummary(data);
    } catch (error) {
      console.error('Failed to load financial summary:', error);
    }
  };

  const loadAccountsReceivable = async () => {
    try {
      const data = await AccountingService.getAccountsReceivable();
      setAccountsReceivable(data);
    } catch (error) {
      console.error('Failed to load accounts receivable:', error);
    }
  };

  // Filtered data
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const invoiceDate = new Date(invoice.issueDate);
        
        switch (dateFilter) {
          case 'today':
            matchesDate = invoiceDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = invoiceDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = invoiceDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchTerm, statusFilter, dateFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
      if (!invoice) return false;
      
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [payments, invoices, searchTerm]);

  // Event handlers
  const handleCreateInvoice = async (data: any) => {
    try {
      setLoading(true);
      const newInvoice = await AccountingService.createInvoice(data);
      setInvoices([newInvoice, ...invoices]);
      await loadFinancialSummary();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (data: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const newPayment = await AccountingService.recordPayment(data);
      setPayments([newPayment, ...payments]);
      
      // Update invoice status
      const updatedInvoice = await AccountingService.updateInvoiceStatus(data.invoiceId, 'paid');
      setInvoices(invoices.map(inv => inv.id === data.invoiceId ? updatedInvoice : inv));
      
      await loadFinancialSummary();
      await loadAccountsReceivable();
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      setLoading(true);
      const updatedInvoice = await AccountingService.updateInvoiceStatus(invoiceId, status);
      setInvoices(invoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
      await loadFinancialSummary();
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      alert('Failed to update invoice status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsInvoiceViewOpen(true);
  };

  const handleRecordPaymentClick = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'sent':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'reports', label: 'Financial Reports', icon: ChartBarIcon },
    { id: 'receivables', label: 'Accounts Receivable', icon: BanknotesIcon }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting Management</h1>
          <p className="text-gray-600">Manage invoices, payments, and financial reports</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'invoices' && hasPermission('invoices', 'create') && (
            <button
              onClick={() => {
                setEditingInvoice(null);
                setIsInvoiceFormOpen(true);
              }}
              className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${financialSummary.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">${financialSummary.totalOutstanding.toLocaleString()}</p>
                <p className="text-sm text-yellow-600">{invoices.filter(i => i.status === 'sent').length} invoices</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">${financialSummary.totalOverdue.toLocaleString()}</p>
                <p className="text-sm text-red-600">{invoices.filter(i => i.status === 'overdue').length} invoices</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Payment Time</p>
                <p className="text-2xl font-bold text-gray-900">{financialSummary.averagePaymentTime.toFixed(1)} days</p>
                <p className="text-sm text-blue-600">Payment terms: Net 30</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

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

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
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
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => {
                    const daysUntilDue = differenceInDays(new Date(invoice.dueDate), new Date());
                    
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                            <div className="text-sm text-gray-500">{format(invoice.issueDate, 'MMM dd, yyyy')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                            <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice.orderNumber || 'Manual'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${invoice.totalAmount.toFixed(2)}</div>
                          {invoice.remainingAmount > 0 && invoice.remainingAmount < invoice.totalAmount && (
                            <div className="text-sm text-gray-500">
                              ${invoice.remainingAmount.toFixed(2)} remaining
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{format(invoice.dueDate, 'MMM dd, yyyy')}</div>
                          {invoice.status === 'sent' && (
                            <div className={`text-sm ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                               daysUntilDue === 0 ? 'Due today' :
                               `${daysUntilDue} days remaining`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewInvoice(invoice)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Invoice"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            
                            {(invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'partial') && (
                              <button
                                onClick={() => handleRecordPaymentClick(invoice)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Record Payment"
                              >
                                <CreditCardIcon className="h-4 w-4" />
                              </button>
                            )}
                            
                            {invoice.status === 'draft' && hasPermission('invoices', 'update') && (
                              <button
                                onClick={() => handleUpdateInvoiceStatus(invoice.id, 'sent')}
                                className="text-purple-600 hover:text-purple-800 p-1"
                                title="Send Invoice"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or create a new invoice.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                <div className="text-sm text-gray-500">
                  Total: ${payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => {
                    const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                    
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">Payment #{payment.id.slice(-6)}</div>
                            {payment.reference && (
                              <div className="text-sm text-gray-500">Ref: {payment.reference}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice?.invoiceNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{invoice?.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(payment.paymentDate, 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Financial Reports Tab */}
      {activeTab === 'reports' && financialSummary && (
        <FinancialReports 
          financialSummary={financialSummary}
          invoices={invoices}
          payments={payments}
        />
      )}

      {/* Accounts Receivable Tab */}
      {activeTab === 'receivables' && accountsReceivable && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Current (0-30 days)</div>
              <div className="text-2xl font-bold text-green-600">${accountsReceivable.current.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">31-60 days</div>
              <div className="text-2xl font-bold text-yellow-600">${accountsReceivable.days30.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">61-90 days</div>
              <div className="text-2xl font-bold text-orange-600">${accountsReceivable.days60.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">90+ days</div>
              <div className="text-2xl font-bold text-red-600">${accountsReceivable.days90Plus.toLocaleString()}</div>
            </div>
          </div>

          {/* Overdue Invoices */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Overdue Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Overdue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices
                    .filter(invoice => invoice.status === 'overdue')
                    .map((invoice) => {
                      const daysOverdue = Math.abs(differenceInDays(new Date(), new Date(invoice.dueDate)));
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{invoice.customerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-red-600">${invoice.remainingAmount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-red-600">{daysOverdue} days</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleRecordPaymentClick(invoice)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Record Payment
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => {
          setIsInvoiceFormOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={handleCreateInvoice}
        initialData={editingInvoice}
      />

      <InvoiceViewModal
        isOpen={isInvoiceViewOpen}
        onClose={() => {
          setIsInvoiceViewOpen(false);
          setViewingInvoice(null);
        }}
        invoice={viewingInvoice}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentInvoice(null);
        }}
        invoice={paymentInvoice}
        onSubmit={handleRecordPayment}
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