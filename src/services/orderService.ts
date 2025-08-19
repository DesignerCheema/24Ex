import { supabase } from '../lib/supabase';
import { Order, OrderFormData, Customer } from '../types';
import { WarehouseService } from './warehouseService';
import { mockOrders } from '../data/mockData';

export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      return ordersData.map(this.transformDatabaseOrder);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformDatabaseOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  static async createOrder(orderData: OrderFormData): Promise<Order> {
    try {
      // Check inventory availability and reserve stock
      const inventoryAvailable = await WarehouseService.reserveInventoryForOrder('temp-order-id');
      if (!inventoryAvailable) {
        throw new Error('Insufficient inventory for one or more items');
      }

      // First, create or get customer
      let customer = await this.findOrCreateCustomer(orderData.customer);

      // Generate order number and tracking number
      const orderCount = await this.getOrderCount();
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;
      const trackingNumber = `TR-${String(orderCount + 1).padStart(3, '0')}-${new Date().getFullYear()}`;

      // Calculate totals
      const itemsTotal = orderData.items.reduce((sum, item) => sum + (item.value * item.quantity), 0);
      const tax = itemsTotal * 0.08; // 8% tax
      const totalAmount = itemsTotal + orderData.deliveryFee + tax - orderData.discount;

      // Create order
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer.id,
          items: orderData.items,
          status: 'pending',
          priority: orderData.priority,
          payment_method: orderData.paymentMethod,
          delivery_address: orderData.deliveryAddress,
          pickup_address: orderData.pickupAddress,
          tracking_number: trackingNumber,
          total_amount: totalAmount,
          delivery_fee: orderData.deliveryFee,
          tax: tax,
          discount: orderData.discount,
          delivery_date: orderData.deliveryDate ? new Date(orderData.deliveryDate).toISOString() : null,
          special_instructions: orderData.specialInstructions,
        })
        .select(`
          *,
          customers (*)
        `)
        .single();

      if (error) throw error;

      // Create picking task for the order
      try {
        await WarehouseService.createPickingTask(data.id, '1'); // Default warehouse
      } catch (pickingError) {
        console.error('Failed to create picking task:', pickingError);
        // Don't fail the order creation if picking task fails
      }

      return this.transformDatabaseOrder(data);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async updateOrder(id: string, orderData: OrderFormData): Promise<Order> {
    try {
      // Update or create customer
      let customer = await this.findOrCreateCustomer(orderData.customer);

      // Calculate totals
      const itemsTotal = orderData.items.reduce((sum, item) => sum + (item.value * item.quantity), 0);
      const tax = itemsTotal * 0.08; // 8% tax
      const totalAmount = itemsTotal + orderData.deliveryFee + tax - orderData.discount;

      const { data, error } = await supabase
        .from('orders')
        .update({
          customer_id: customer.id,
          items: orderData.items,
          priority: orderData.priority,
          payment_method: orderData.paymentMethod,
          delivery_address: orderData.deliveryAddress,
          pickup_address: orderData.pickupAddress,
          total_amount: totalAmount,
          delivery_fee: orderData.deliveryFee,
          tax: tax,
          discount: orderData.discount,
          delivery_date: orderData.deliveryDate ? new Date(orderData.deliveryDate).toISOString() : null,
          special_instructions: orderData.specialInstructions,
        })
        .eq('id', id)
        .select(`
          *,
          customers (*)
        `)
        .single();

      if (error) throw error;

      return this.transformDatabaseOrder(data);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  static async deleteOrder(id: string): Promise<void> {
    try {
      // Release inventory reservations before deleting
      await WarehouseService.releaseInventoryReservation(id);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  static async deleteOrders(ids: string[]): Promise<void> {
    try {
      // Release inventory reservations for all orders
      for (const id of ids) {
        await WarehouseService.releaseInventoryReservation(id);
      }
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting orders:', error);
      throw error;
    }
  }

  static async getAllCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        tier: customer.tier,
        address: customer.address,
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  static async getOrderByTrackingNumber(trackingNumber: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*)
        `)
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) {
        // If not found in database, check mock data
        const mockOrder = mockOrders.find(order => order.trackingNumber === trackingNumber);
        return mockOrder || null;
      }

      return data ? this.transformDatabaseOrder(data) : null;
    } catch (error) {
      console.error('Error fetching order by tracking number:', error);
      // Fallback to mock data
      const mockOrder = mockOrders.find(order => order.trackingNumber === trackingNumber);
      return mockOrder || null;
    }
  }

  static async enableWhatsAppTracking(orderId: string, whatsappNumber: string): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Store the WhatsApp number for the order
      // 2. Set up webhook notifications
      // 3. Send confirmation message
      
      console.log(`WhatsApp tracking enabled for order ${orderId} with number ${whatsappNumber}`);
      
      // Mock API call to WhatsApp service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would integrate with WhatsApp Business API
      // or a service like Twilio WhatsApp API
    } catch (error) {
      console.error('Error enabling WhatsApp tracking:', error);
      throw error;
    }
  }

  private static async findOrCreateCustomer(customerData: OrderFormData['customer']): Promise<Customer> {
    try {
      // Try to find existing customer by email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerData.email)
        .maybeSingle();

      if (existingCustomer) {
        // Update existing customer
        const { data: updatedCustomer, error } = await supabase
          .from('customers')
          .update({
            name: customerData.name,
            phone: customerData.phone,
            company: customerData.company,
          })
          .eq('id', existingCustomer.id)
          .select('*')
          .single();

        if (error) throw error;

        return {
          id: updatedCustomer.id,
          name: updatedCustomer.name,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone,
          company: updatedCustomer.company,
          tier: updatedCustomer.tier,
          address: updatedCustomer.address,
        };
      } else {
        // Create new customer
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            company: customerData.company,
            tier: 'bronze',
            address: {}, // Will be updated with delivery address
          })
          .select('*')
          .single();

        if (error) throw error;

        return {
          id: newCustomer.id,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          company: newCustomer.company,
          tier: newCustomer.tier,
          address: newCustomer.address,
        };
      }
    } catch (error) {
      console.error('Error finding/creating customer:', error);
      throw error;
    }
  }

  private static async getOrderCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting order count:', error);
      return 0;
    }
  }

  private static transformDatabaseOrder(data: any): Order {
    return {
      id: data.id,
      orderNumber: data.order_number,
      customer: {
        id: data.customers.id,
        name: data.customers.name,
        email: data.customers.email,
        phone: data.customers.phone,
        company: data.customers.company,
        tier: data.customers.tier,
        address: data.customers.address,
      },
      items: data.items.map((item: any, index: number) => ({
        id: `item_${data.id}_${index}`,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        value: item.value,
        category: item.category,
        description: item.description,
        dimensions: { length: 0, width: 0, height: 0 },
      })),
      status: data.status,
      priority: data.priority,
      paymentMethod: data.payment_method,
      deliveryAddress: data.delivery_address,
      pickupAddress: data.pickup_address,
      trackingNumber: data.tracking_number,
      totalAmount: parseFloat(data.total_amount),
      deliveryFee: parseFloat(data.delivery_fee),
      tax: parseFloat(data.tax),
      discount: parseFloat(data.discount),
      deliveryDate: data.delivery_date ? new Date(data.delivery_date) : undefined,
      specialInstructions: data.special_instructions,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}