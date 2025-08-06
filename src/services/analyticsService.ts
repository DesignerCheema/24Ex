import { supabase } from '../lib/supabase';
import { Order, Customer } from '../types';
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  subMonths, 
  eachDayOfInterval, 
  eachMonthOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  differenceInHours,
  differenceInDays
} from 'date-fns';

export interface AnalyticsData {
  overview: OverviewMetrics;
  orderAnalytics: OrderAnalytics;
  deliveryAnalytics: DeliveryAnalytics;
  customerAnalytics: CustomerAnalytics;
  financialAnalytics: FinancialAnalytics;
  operationalAnalytics: OperationalAnalytics;
}

export interface OverviewMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  orderGrowth: number;
  revenueGrowth: number;
  customerGrowth: number;
  conversionRate: number;
}

export interface OrderAnalytics {
  dailyOrders: {
    date: string;
    orders: number;
    revenue: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  priorityDistribution: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  hourlyDistribution: {
    hour: string;
    orders: number;
  }[];
  categoryBreakdown: {
    category: string;
    orders: number;
    revenue: number;
  }[];
}

export interface DeliveryAnalytics {
  deliveryPerformance: {
    onTime: number;
    late: number;
    failed: number;
    onTimePercentage: number;
  };
  averageDeliveryTime: number;
  deliveryTimeDistribution: {
    timeRange: string;
    count: number;
  }[];
  geographicDistribution: {
    city: string;
    state: string;
    orders: number;
    avgDeliveryTime: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    deliveries: number;
    onTimeRate: number;
    avgTime: number;
  }[];
}

export interface CustomerAnalytics {
  customerSegmentation: {
    tier: string;
    count: number;
    revenue: number;
    avgOrderValue: number;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: Date;
  }[];
  customerRetention: {
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
  };
  customerLifetimeValue: {
    average: number;
    median: number;
    top10Percent: number;
  };
}

export interface FinancialAnalytics {
  monthlyRevenue: {
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }[];
  profitMargins: {
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
  };
  costBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  paymentMethodAnalysis: {
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
}

export interface OperationalAnalytics {
  warehouseUtilization: {
    warehouseId: string;
    warehouseName: string;
    utilization: number;
    capacity: number;
    efficiency: number;
  }[];
  inventoryTurnover: {
    category: string;
    turnoverRate: number;
    daysOnHand: number;
  }[];
  pickingEfficiency: {
    averagePickTime: number;
    pickAccuracy: number;
    tasksCompleted: number;
  };
  transportEfficiency: {
    fuelCostPerKm: number;
    averageUtilization: number;
    maintenanceCostRatio: number;
  };
}

export class AnalyticsService {
  static async getAnalyticsData(dateRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    try {
      const [orders, customers] = await Promise.all([
        this.getOrdersData(),
        this.getCustomersData()
      ]);

      const overview = this.calculateOverviewMetrics(orders, customers, dateRange);
      const orderAnalytics = this.calculateOrderAnalytics(orders, dateRange);
      const deliveryAnalytics = this.calculateDeliveryAnalytics(orders, dateRange);
      const customerAnalytics = this.calculateCustomerAnalytics(orders, customers, dateRange);
      const financialAnalytics = this.calculateFinancialAnalytics(orders, dateRange);
      const operationalAnalytics = this.calculateOperationalAnalytics(orders, dateRange);

      return {
        overview,
        orderAnalytics,
        deliveryAnalytics,
        customerAnalytics,
        financialAnalytics,
        operationalAnalytics
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  private static async getOrdersData(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: {
          id: order.customers.id,
          name: order.customers.name,
          email: order.customers.email,
          phone: order.customers.phone,
          company: order.customers.company,
          tier: order.customers.tier,
          address: order.customers.address,
        },
        items: order.items,
        status: order.status,
        priority: order.priority,
        paymentMethod: order.payment_method,
        deliveryAddress: order.delivery_address,
        pickupAddress: order.pickup_address,
        trackingNumber: order.tracking_number,
        totalAmount: parseFloat(order.total_amount),
        deliveryFee: parseFloat(order.delivery_fee),
        tax: parseFloat(order.tax),
        discount: parseFloat(order.discount),
        deliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
        specialInstructions: order.special_instructions,
        notes: order.notes,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching orders for analytics:', error);
      return [];
    }
  }

  private static async getCustomersData(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        tier: customer.tier,
        address: customer.address,
      }));
    } catch (error) {
      console.error('Error fetching customers for analytics:', error);
      return [];
    }
  }

  private static calculateOverviewMetrics(orders: Order[], customers: Customer[], dateRange: string): OverviewMetrics {
    const now = new Date();
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const periodStart = subDays(now, daysBack);
    const prevPeriodStart = subDays(periodStart, daysBack);

    const currentPeriodOrders = orders.filter(order => new Date(order.createdAt) >= periodStart);
    const prevPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= prevPeriodStart && orderDate < periodStart;
    });

    const totalOrders = currentPeriodOrders.length;
    const totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = new Set(currentPeriodOrders.map(order => order.customer.id)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const orderGrowth = prevPeriodOrders.length > 0 
      ? ((totalOrders - prevPeriodOrders.length) / prevPeriodOrders.length) * 100 
      : 0;

    const prevRevenue = prevPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const prevCustomers = new Set(prevPeriodOrders.map(order => order.customer.id)).size;
    const customerGrowth = prevCustomers > 0 ? ((totalCustomers - prevCustomers) / prevCustomers) * 100 : 0;

    const deliveredOrders = currentPeriodOrders.filter(order => order.status === 'delivered').length;
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      averageOrderValue,
      orderGrowth,
      revenueGrowth,
      customerGrowth,
      conversionRate
    };
  }

  private static calculateOrderAnalytics(orders: Order[], dateRange: string): OrderAnalytics {
    const now = new Date();
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const periodStart = subDays(now, daysBack);
    
    const periodOrders = orders.filter(order => new Date(order.createdAt) >= periodStart);

    // Daily orders
    const days = eachDayOfInterval({ start: periodStart, end: now });
    const dailyOrders = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayOrders = periodOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      return {
        date: format(day, 'MMM dd'),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      };
    });

    // Status distribution
    const statusCounts = periodOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / periodOrders.length) * 100
    }));

    // Priority distribution
    const priorityCounts = periodOrders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      percentage: (count / periodOrders.length) * 100
    }));

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = periodOrders.filter(order => new Date(order.createdAt).getHours() === hour);
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: hourOrders.length
      };
    });

    // Category breakdown
    const categoryBreakdown = periodOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        if (!acc[item.category]) {
          acc[item.category] = { orders: 0, revenue: 0 };
        }
        acc[item.category].orders += 1;
        acc[item.category].revenue += item.value * item.quantity;
      });
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
      category,
      orders: data.orders,
      revenue: data.revenue
    }));

    return {
      dailyOrders,
      statusDistribution,
      priorityDistribution,
      hourlyDistribution,
      categoryBreakdown: categoryBreakdownArray
    };
  }

  private static calculateDeliveryAnalytics(orders: Order[], dateRange: string): DeliveryAnalytics {
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const shippedOrders = orders.filter(order => order.status === 'shipped');
    const failedOrders = orders.filter(order => order.status === 'cancelled');

    // Calculate on-time delivery
    const onTimeDeliveries = deliveredOrders.filter(order => {
      if (order.deliveryDate && order.actualDeliveryTime) {
        return new Date(order.actualDeliveryTime) <= new Date(order.deliveryDate);
      }
      return false;
    }).length;

    const deliveryPerformance = {
      onTime: onTimeDeliveries,
      late: deliveredOrders.length - onTimeDeliveries,
      failed: failedOrders.length,
      onTimePercentage: deliveredOrders.length > 0 ? (onTimeDeliveries / deliveredOrders.length) * 100 : 0
    };

    // Average delivery time
    const deliveryTimes = deliveredOrders
      .filter(order => order.actualDeliveryTime)
      .map(order => {
        const created = new Date(order.createdAt);
        const delivered = new Date(order.actualDeliveryTime!);
        return differenceInHours(delivered, created);
      });

    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
      : 0;

    // Delivery time distribution
    const deliveryTimeDistribution = [
      { timeRange: '< 2 hours', count: deliveryTimes.filter(time => time < 2).length },
      { timeRange: '2-4 hours', count: deliveryTimes.filter(time => time >= 2 && time < 4).length },
      { timeRange: '4-8 hours', count: deliveryTimes.filter(time => time >= 4 && time < 8).length },
      { timeRange: '8-24 hours', count: deliveryTimes.filter(time => time >= 8 && time < 24).length },
      { timeRange: '> 24 hours', count: deliveryTimes.filter(time => time >= 24).length }
    ];

    // Geographic distribution
    const geographicData = orders.reduce((acc, order) => {
      const city = order.deliveryAddress.city;
      const state = order.deliveryAddress.state;
      const key = `${city}, ${state}`;
      
      if (!acc[key]) {
        acc[key] = { city, state, orders: 0, totalDeliveryTime: 0, deliveredCount: 0 };
      }
      
      acc[key].orders += 1;
      
      if (order.status === 'delivered' && order.actualDeliveryTime) {
        const deliveryTime = differenceInHours(new Date(order.actualDeliveryTime), new Date(order.createdAt));
        acc[key].totalDeliveryTime += deliveryTime;
        acc[key].deliveredCount += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const geographicDistribution = Object.values(geographicData).map((data: any) => ({
      city: data.city,
      state: data.state,
      orders: data.orders,
      avgDeliveryTime: data.deliveredCount > 0 ? data.totalDeliveryTime / data.deliveredCount : 0
    }));

    // Mock agent performance data
    const agentPerformance = [
      { agentId: '1', agentName: 'Mike Wilson', deliveries: 45, onTimeRate: 94.2, avgTime: 2.1 },
      { agentId: '2', agentName: 'Lisa Chen', deliveries: 38, onTimeRate: 96.8, avgTime: 1.9 },
      { agentId: '3', agentName: 'John Smith', deliveries: 42, onTimeRate: 91.5, avgTime: 2.4 }
    ];

    return {
      deliveryPerformance,
      averageDeliveryTime,
      deliveryTimeDistribution,
      geographicDistribution,
      agentPerformance
    };
  }

  private static calculateCustomerAnalytics(orders: Order[], customers: Customer[], dateRange: string): CustomerAnalytics {
    // Customer segmentation by tier
    const tierData = customers.reduce((acc, customer) => {
      if (!acc[customer.tier]) {
        acc[customer.tier] = { count: 0, revenue: 0, orders: 0 };
      }
      acc[customer.tier].count += 1;
      
      const customerOrders = orders.filter(order => order.customer.id === customer.id);
      const customerRevenue = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      acc[customer.tier].revenue += customerRevenue;
      acc[customer.tier].orders += customerOrders.length;
      
      return acc;
    }, {} as Record<string, any>);

    const customerSegmentation = Object.entries(tierData).map(([tier, data]) => ({
      tier,
      count: data.count,
      revenue: data.revenue,
      avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
    }));

    // Top customers
    const customerSpending = customers.map(customer => {
      const customerOrders = orders.filter(order => order.customer.id === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      return {
        customerId: customer.id,
        customerName: customer.name,
        orderCount: customerOrders.length,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : new Date(0)
      };
    });

    const topCustomers = customerSpending
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Customer retention
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const newCustomers = customers.filter(customer => {
      const firstOrder = orders
        .filter(order => order.customer.id === customer.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      return firstOrder && new Date(firstOrder.createdAt) >= thirtyDaysAgo;
    }).length;

    const returningCustomers = customers.filter(customer => {
      const customerOrders = orders.filter(order => order.customer.id === customer.id);
      return customerOrders.length > 1;
    }).length;

    const retentionRate = customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0;

    // Customer lifetime value
    const lifetimeValues = customerSpending.map(customer => customer.totalSpent).sort((a, b) => b - a);
    const average = lifetimeValues.length > 0 ? lifetimeValues.reduce((sum, val) => sum + val, 0) / lifetimeValues.length : 0;
    const median = lifetimeValues.length > 0 ? lifetimeValues[Math.floor(lifetimeValues.length / 2)] : 0;
    const top10Percent = lifetimeValues.length > 0 ? lifetimeValues.slice(0, Math.ceil(lifetimeValues.length * 0.1)).reduce((sum, val) => sum + val, 0) / Math.ceil(lifetimeValues.length * 0.1) : 0;

    return {
      customerSegmentation,
      topCustomers,
      customerRetention: {
        newCustomers,
        returningCustomers,
        retentionRate
      },
      customerLifetimeValue: {
        average,
        median,
        top10Percent
      }
    };
  }

  private static calculateFinancialAnalytics(orders: Order[], dateRange: string): FinancialAnalytics {
    const months = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 6)),
      end: endOfMonth(new Date())
    });

    const monthlyRevenue = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const revenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Calculate growth compared to previous month
      const prevMonth = subMonths(month, 1);
      const prevMonthStart = startOfMonth(prevMonth);
      const prevMonthEnd = endOfMonth(prevMonth);
      
      const prevMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= prevMonthStart && orderDate <= prevMonthEnd;
      });
      
      const prevRevenue = prevMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

      return {
        month: format(month, 'MMM yyyy'),
        revenue,
        orders: monthOrders.length,
        growth
      };
    });

    // Profit margins (mock calculation)
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCosts = orders.reduce((sum, order) => {
      const itemCosts = order.items.reduce((itemSum, item) => itemSum + (item.value * 0.6 * item.quantity), 0); // 60% cost ratio
      return sum + itemCosts + order.deliveryFee * 0.8; // 80% of delivery fee as cost
    }, 0);

    const grossProfit = totalRevenue - totalCosts;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const operatingCosts = totalRevenue * 0.15; // 15% operating costs
    const netProfit = grossProfit - operatingCosts;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Cost breakdown
    const costBreakdown = [
      { category: 'Cost of Goods', amount: totalCosts * 0.7, percentage: 70 },
      { category: 'Delivery Costs', amount: totalCosts * 0.2, percentage: 20 },
      { category: 'Operating Expenses', amount: totalCosts * 0.1, percentage: 10 }
    ];

    // Payment method analysis
    const paymentMethodCounts = orders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || { count: 0, amount: 0 });
      acc[order.paymentMethod].count += 1;
      acc[order.paymentMethod].amount += order.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const totalPaymentAmount = Object.values(paymentMethodCounts).reduce((sum, data) => sum + data.amount, 0);
    const paymentMethodAnalysis = Object.entries(paymentMethodCounts).map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount,
      percentage: totalPaymentAmount > 0 ? (data.amount / totalPaymentAmount) * 100 : 0
    }));

    return {
      monthlyRevenue,
      profitMargins: {
        grossProfit,
        grossMargin,
        netProfit,
        netMargin
      },
      costBreakdown,
      paymentMethodAnalysis
    };
  }

  private static calculateOperationalAnalytics(orders: Order[], dateRange: string): OperationalAnalytics {
    // Mock warehouse utilization data
    const warehouseUtilization = [
      {
        warehouseId: '1',
        warehouseName: 'Main Distribution Center',
        utilization: 75,
        capacity: 50000,
        efficiency: 92
      }
    ];

    // Inventory turnover by category
    const categoryData = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        if (!acc[item.category]) {
          acc[item.category] = { totalSold: 0, orderCount: 0 };
        }
        acc[item.category].totalSold += item.quantity;
        acc[item.category].orderCount += 1;
      });
      return acc;
    }, {} as Record<string, any>);

    const inventoryTurnover = Object.entries(categoryData).map(([category, data]) => ({
      category,
      turnoverRate: data.totalSold / 30, // Mock calculation
      daysOnHand: 30 / (data.totalSold / 30) // Mock calculation
    }));

    // Picking efficiency (mock data)
    const pickingEfficiency = {
      averagePickTime: 12, // minutes
      pickAccuracy: 98.5, // percentage
      tasksCompleted: orders.filter(o => o.status !== 'pending').length
    };

    // Transport efficiency (mock data)
    const transportEfficiency = {
      fuelCostPerKm: 0.15,
      averageUtilization: 78,
      maintenanceCostRatio: 0.12
    };

    return {
      warehouseUtilization,
      inventoryTurnover,
      pickingEfficiency,
      transportEfficiency
    };
  }

  static async exportAnalyticsReport(data: AnalyticsData, format: 'pdf' | 'excel'): Promise<void> {
    // This would integrate with existing export utilities
    console.log(`Exporting analytics report as ${format}`);
  }
}