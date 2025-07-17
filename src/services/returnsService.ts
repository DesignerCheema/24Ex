import { ReturnRequest, ReturnFormData, Order } from '../types';
import { mockOrders } from '../data/mockData';

export class ReturnsService {
  static async getAllReturns(): Promise<ReturnRequest[]> {
    // Mock data for returns
    const mockReturns: ReturnRequest[] = [
      {
        id: '1',
        orderId: '1',
        orderNumber: 'ORD-2024-001',
        customer: {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001'
          },
          tier: 'gold',
          company: 'Tech Corp'
        },
        reason: 'Damaged during shipping',
        status: 'pending',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
        items: [
          {
            id: '1',
            itemId: '1',
            name: 'Laptop Computer',
            quantity: 1,
            reason: 'Screen cracked',
            condition: 'damaged',
            refundAmount: 1200
          }
        ],
        refundAmount: 1200,
        disposition: 'damage',
        notes: 'Customer reported damage upon delivery'
      },
      {
        id: '2',
        orderId: '2',
        orderNumber: 'ORD-2024-002',
        customer: {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1987654321',
          address: {
            street: '789 Pine St',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            zipCode: '90210'
          },
          tier: 'silver',
          company: 'Design Studio'
        },
        reason: 'Wrong item received',
        status: 'approved',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-17'),
        items: [
          {
            id: '2',
            itemId: '2',
            name: 'Smartphone',
            quantity: 1,
            reason: 'Wrong model',
            condition: 'new',
            refundAmount: 800
          }
        ],
        refundAmount: 800,
        disposition: 'restock',
        processedBy: 'Admin User',
        processedAt: new Date('2024-01-17'),
        notes: 'Customer ordered iPhone but received Samsung'
      },
      {
        id: '3',
        orderId: '3',
        orderNumber: 'ORD-2024-003',
        customer: {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          phone: '+1555123456',
          address: {
            street: '456 Oak Ave',
            city: 'Chicago',
            state: 'IL',
            country: 'USA',
            zipCode: '60601'
          },
          tier: 'platinum',
          company: 'Wilson Industries'
        },
        reason: 'Not as described',
        status: 'completed',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-18'),
        items: [
          {
            id: '3',
            itemId: '3',
            name: 'Office Chair',
            quantity: 1,
            reason: 'Different color than ordered',
            condition: 'used',
            refundAmount: 300
          }
        ],
        refundAmount: 300,
        disposition: 'discard',
        processedBy: 'Admin User',
        processedAt: new Date('2024-01-18'),
        notes: 'Refund processed successfully'
      }
    ];

    return mockReturns;
  }

  static async getReturnById(id: string): Promise<ReturnRequest | null> {
    const returns = await this.getAllReturns();
    return returns.find(returnReq => returnReq.id === id) || null;
  }

  static async createReturn(data: ReturnFormData): Promise<ReturnRequest> {
    // Find the order
    const order = mockOrders.find(o => o.id === data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const newReturn: ReturnRequest = {
      id: Date.now().toString(),
      orderId: data.orderId,
      orderNumber: order.orderNumber,
      customer: order.customer,
      reason: data.reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: data.items.map(item => ({
        id: Date.now().toString() + Math.random(),
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        reason: item.reason,
        condition: item.condition,
        refundAmount: item.refundAmount
      })),
      refundAmount: data.items.reduce((sum, item) => sum + item.refundAmount, 0),
      disposition: 'restock', // Default disposition
      notes: data.notes
    };

    return newReturn;
  }

  static async updateReturn(id: string, updates: Partial<ReturnRequest>): Promise<ReturnRequest> {
    const existingReturn = await this.getReturnById(id);
    if (!existingReturn) {
      throw new Error('Return request not found');
    }

    return {
      ...existingReturn,
      ...updates,
      updatedAt: new Date()
    };
  }

  static async deleteReturn(id: string): Promise<void> {
    // Mock delete - in real implementation, this would delete from database
    console.log(`Deleting return request ${id}`);
  }

  static async approveReturn(id: string, processedBy: string): Promise<ReturnRequest> {
    return this.updateReturn(id, {
      status: 'approved',
      processedBy,
      processedAt: new Date()
    });
  }

  static async rejectReturn(id: string, processedBy: string, reason: string): Promise<ReturnRequest> {
    return this.updateReturn(id, {
      status: 'rejected',
      processedBy,
      processedAt: new Date(),
      notes: reason
    });
  }

  static async completeReturn(id: string, processedBy: string): Promise<ReturnRequest> {
    return this.updateReturn(id, {
      status: 'completed',
      processedBy,
      processedAt: new Date()
    });
  }

  static async getEligibleOrders(): Promise<Order[]> {
    // Return orders that are delivered and within return window (e.g., 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return mockOrders.filter(order => 
      order.status === 'delivered' && 
      new Date(order.createdAt) >= thirtyDaysAgo
    );
  }
}