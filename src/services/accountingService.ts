import { supabase } from '../lib/supabase';
import { Order, Customer } from '../types';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paidAmount: number;
  remainingAmount: number;
  paymentTerms: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'cash' | 'check' | 'other';
  paymentDate: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  averagePaymentTime: number;
  paymentMethodBreakdown: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
    growth: number;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    totalSpent: number;
    orderCount: number;
  }[];
}

export interface InvoiceFormData {
  customerId: string;
  orderId?: string;
  items: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }[];
  dueDate: Date;
  paymentTerms: string;
  notes?: string;
  discount?: number;
}

export class AccountingService {
  static async getAllInvoices(): Promise<Invoice[]> {
    try {
      // Get orders with customer data to generate invoices
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate invoices from orders
      const invoices: Invoice[] = orders.map((order, index) => {
        const invoiceNumber = `INV-${new Date(order.created_at).getFullYear()}-${String(index + 1).padStart(4, '0')}`;
        const subtotal = parseFloat(order.total_amount) - parseFloat(order.delivery_fee) - parseFloat(order.tax) + parseFloat(order.discount);
        const tax = parseFloat(order.tax);
        const discount = parseFloat(order.discount);
        const totalAmount = parseFloat(order.total_amount);
        
        // Determine payment status based on order status
        let invoiceStatus: Invoice['status'] = 'draft';
        let paidAmount = 0;
        let paidDate: Date | undefined;

        if (order.status === 'delivered') {
          if (order.payment_method === 'prepaid') {
            invoiceStatus = 'paid';
            paidAmount = totalAmount;
            paidDate = new Date(order.created_at);
          } else if (order.payment_method === 'cod') {
            invoiceStatus = 'paid';
            paidAmount = totalAmount;
            paidDate = new Date(order.updated_at);
          } else {
            invoiceStatus = 'sent';
          }
        } else if (order.status === 'cancelled') {
          invoiceStatus = 'cancelled';
        } else {
          invoiceStatus = 'sent';
        }

        // Check if overdue
        const dueDate = new Date(order.created_at);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms
        if (invoiceStatus === 'sent' && new Date() > dueDate) {
          invoiceStatus = 'overdue';
        }

        return {
          id: `inv-${order.id}`,
          invoiceNumber,
          customerId: order.customer_id,
          customerName: order.customers.name,
          customerEmail: order.customers.email,
          orderId: order.id,
          orderNumber: order.order_number,
          items: order.items.map((item: any, itemIndex: number) => ({
            id: `item-${order.id}-${itemIndex}`,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.value,
            totalPrice: item.value * item.quantity
          })),
          subtotal,
          tax,
          discount,
          totalAmount,
          status: invoiceStatus,
          issueDate: new Date(order.created_at),
          dueDate,
          paidDate,
          paidAmount,
          remainingAmount: totalAmount - paidAmount,
          paymentTerms: 'Net 30',
          notes: order.notes,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at)
        };
      });

      return invoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = await this.getAllInvoices();
    return invoices.find(invoice => invoice.id === id) || null;
  }

  static async createInvoice(data: InvoiceFormData): Promise<Invoice> {
    try {
      // Get customer data
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.customerId)
        .single();

      if (!customer) throw new Error('Customer not found');

      // Get order data if orderId is provided
      let order = null;
      if (data.orderId) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', data.orderId)
          .single();
        order = orderData;
      }

      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const discount = data.discount || 0;
      const tax = (subtotal - discount) * 0.08; // 8% tax
      const totalAmount = subtotal + tax - discount;

      // Generate invoice number
      const invoiceCount = (await this.getAllInvoices()).length;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        customerId: data.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        orderId: data.orderId || '',
        orderNumber: order?.order_number || '',
        items: data.items.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        })),
        subtotal,
        tax,
        discount,
        totalAmount,
        status: 'draft',
        issueDate: new Date(),
        dueDate: data.dueDate,
        paidAmount: 0,
        remainingAmount: totalAmount,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  static async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    const invoices = await this.getAllInvoices();
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) throw new Error('Invoice not found');

    return {
      ...invoice,
      status,
      updatedAt: new Date()
    };
  }

  static async recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      ...payment,
      createdAt: new Date()
    };

    // Update invoice status and paid amount
    const invoices = await this.getAllInvoices();
    const invoice = invoices.find(inv => inv.id === payment.invoiceId);
    
    if (invoice) {
      const newPaidAmount = invoice.paidAmount + payment.amount;
      const newRemainingAmount = invoice.totalAmount - newPaidAmount;
      
      let newStatus: Invoice['status'] = 'partial';
      if (newRemainingAmount <= 0) {
        newStatus = 'paid';
      }

      // In a real implementation, you would update the database here
    }

    return newPayment;
  }

  static async getPayments(invoiceId?: string): Promise<Payment[]> {
    // Mock payment data based on invoices
    const invoices = await this.getAllInvoices();
    const payments: Payment[] = [];

    invoices
      .filter(inv => inv.status === 'paid' && (!invoiceId || inv.id === invoiceId))
      .forEach(invoice => {
        payments.push({
          id: `pay-${invoice.id}`,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          paymentMethod: invoice.orderNumber.includes('COD') ? 'cash' : 'card',
          paymentDate: invoice.paidDate || invoice.dueDate,
          reference: `REF-${invoice.invoiceNumber}`,
          createdAt: invoice.paidDate || invoice.dueDate
        });
      });

    return payments;
  }

  static async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const invoices = await this.getAllInvoices();
      const payments = await this.getPayments();

      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
      const totalOutstanding = invoices
        .filter(inv => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.remainingAmount, 0);
      const totalOverdue = invoices
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.remainingAmount, 0);

      // Calculate average payment time
      const paidInvoices = invoices.filter(inv => inv.paidDate);
      const averagePaymentTime = paidInvoices.length > 0
        ? paidInvoices.reduce((sum, inv) => {
            const daysDiff = Math.abs(new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime()) / (1000 * 60 * 60 * 24);
            return sum + daysDiff;
          }, 0) / paidInvoices.length
        : 0;

      // Payment method breakdown
      const paymentMethodCounts = payments.reduce((acc, payment) => {
        acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);

      const paymentMethodBreakdown = Object.entries(paymentMethodCounts).map(([method, amount]) => ({
        method: method.replace('_', ' '),
        amount,
        percentage: (amount / totalPaid) * 100
      }));

      // Monthly revenue
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(new Date(), 5 - i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthRevenue = payments
          .filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= monthStart && paymentDate <= monthEnd;
          })
          .reduce((sum, payment) => sum + payment.amount, 0);

        const prevMonth = subMonths(month, 1);
        const prevMonthStart = startOfMonth(prevMonth);
        const prevMonthEnd = endOfMonth(prevMonth);
        
        const prevMonthRevenue = payments
          .filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= prevMonthStart && paymentDate <= prevMonthEnd;
          })
          .reduce((sum, payment) => sum + payment.amount, 0);

        const growth = prevMonthRevenue > 0 ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

        return {
          month: format(month, 'MMM yyyy'),
          revenue: monthRevenue,
          growth
        };
      });

      // Top customers
      const customerSpending = invoices.reduce((acc, invoice) => {
        if (!acc[invoice.customerId]) {
          acc[invoice.customerId] = {
            customerId: invoice.customerId,
            customerName: invoice.customerName,
            totalSpent: 0,
            orderCount: 0
          };
        }
        acc[invoice.customerId].totalSpent += invoice.paidAmount;
        acc[invoice.customerId].orderCount += 1;
        return acc;
      }, {} as Record<string, any>);

      const topCustomers = Object.values(customerSpending)
        .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      return {
        totalRevenue: totalPaid,
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        totalOverdue,
        averagePaymentTime,
        paymentMethodBreakdown,
        monthlyRevenue,
        topCustomers
      };
    } catch (error) {
      console.error('Error generating financial summary:', error);
      throw error;
    }
  }

  static async getAccountsReceivable(): Promise<{
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
  }> {
    const invoices = await this.getAllInvoices();
    const now = new Date();

    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0
    };

    invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .forEach(invoice => {
        const daysPastDue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPastDue <= 0) {
          aging.current += invoice.remainingAmount;
        } else if (daysPastDue <= 30) {
          aging.days30 += invoice.remainingAmount;
        } else if (daysPastDue <= 60) {
          aging.days60 += invoice.remainingAmount;
        } else {
          aging.days90Plus += invoice.remainingAmount;
        }
      });

    return aging;
  }

  static async exportInvoicesToPDF(invoices: Invoice[], title: string = 'Invoices Report'): Promise<void> {
    // This would integrate with the existing PDF export utility
    console.log('Exporting invoices to PDF:', invoices.length);
  }

  static async exportInvoicesToExcel(invoices: Invoice[], filename: string = 'invoices-export'): Promise<void> {
    // This would integrate with the existing Excel export utility
    console.log('Exporting invoices to Excel:', invoices.length);
  }
}