import { supabase } from '../lib/supabase';
import { Order } from '../types';

export interface WhatsAppTrackingData {
  orderId: string;
  whatsappNumber: string;
  enabled: boolean;
  lastNotificationSent?: Date;
  notificationCount: number;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'status_update' | 'delivery_notification' | 'issue_alert';
  orderId: string;
  timestamp: Date;
}

export class WhatsAppService {
  private static readonly WHATSAPP_API_URL = 'https://api.whatsapp.com/send'; // Mock URL
  
  static async enableTracking(orderId: string, whatsappNumber: string): Promise<WhatsAppTrackingData> {
    try {
      // Validate phone number format
      const cleanNumber = this.cleanPhoneNumber(whatsappNumber);
      if (!this.isValidPhoneNumber(cleanNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Store WhatsApp tracking preference
      const trackingData: WhatsAppTrackingData = {
        orderId,
        whatsappNumber: cleanNumber,
        enabled: true,
        notificationCount: 0
      };

      // Send welcome message
      await this.sendWelcomeMessage(cleanNumber, orderId);

      return trackingData;
    } catch (error) {
      console.error('Error enabling WhatsApp tracking:', error);
      throw error;
    }
  }

  static async disableTracking(orderId: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`WhatsApp tracking disabled for order ${orderId}`);
    } catch (error) {
      console.error('Error disabling WhatsApp tracking:', error);
      throw error;
    }
  }

  static async sendOrderStatusUpdate(order: Order, whatsappNumber: string): Promise<void> {
    try {
      const message = this.generateStatusUpdateMessage(order);
      await this.sendMessage(whatsappNumber, message, 'status_update', order.id);
    } catch (error) {
      console.error('Error sending status update:', error);
      throw error;
    }
  }

  static async sendDeliveryNotification(order: Order, whatsappNumber: string): Promise<void> {
    try {
      const message = this.generateDeliveryMessage(order);
      await this.sendMessage(whatsappNumber, message, 'delivery_notification', order.id);
    } catch (error) {
      console.error('Error sending delivery notification:', error);
      throw error;
    }
  }

  static async sendIssueAlert(order: Order, whatsappNumber: string, issue: string): Promise<void> {
    try {
      const message = this.generateIssueMessage(order, issue);
      await this.sendMessage(whatsappNumber, message, 'issue_alert', order.id);
    } catch (error) {
      console.error('Error sending issue alert:', error);
      throw error;
    }
  }

  private static async sendWelcomeMessage(whatsappNumber: string, orderId: string): Promise<void> {
    const message = `🚚 *24EX Delivery - Tracking Enabled*

Hi! You've successfully enabled WhatsApp tracking for your order.

You'll receive automatic updates when:
✅ Your order status changes
🚛 Your package is out for delivery
📦 Your package is delivered
⚠️ Any delivery issues occur

Order ID: ${orderId}
Track online: ${window.location.origin}/track

Thank you for choosing 24EX Delivery! 🙏`;

    await this.sendMessage(whatsappNumber, message, 'status_update', orderId);
  }

  private static generateStatusUpdateMessage(order: Order): string {
    const statusEmojis = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚛',
      delivered: '✅',
      cancelled: '❌'
    };

    const emoji = statusEmojis[order.status as keyof typeof statusEmojis] || '📋';

    return `${emoji} *Order Update - ${order.orderNumber}*

Status: *${order.status.toUpperCase()}*
Tracking: ${order.trackingNumber}

${this.getStatusDescription(order.status)}

${order.deliveryDate ? `Expected Delivery: ${order.deliveryDate.toLocaleDateString()}` : ''}

Track your order: ${window.location.origin}/track

24EX Delivery Services`;
  }

  private static generateDeliveryMessage(order: Order): string {
    return `🎉 *Package Delivered - ${order.orderNumber}*

Your order has been successfully delivered!

📦 Items: ${order.items.length} item(s)
📍 Delivered to: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}
⏰ Delivered at: ${new Date().toLocaleString()}

Thank you for choosing 24EX Delivery! 

Rate your experience: ${window.location.origin}/feedback

24EX Delivery Services`;
  }

  private static generateIssueMessage(order: Order, issue: string): string {
    return `⚠️ *Delivery Issue - ${order.orderNumber}*

We encountered an issue with your delivery:

${issue}

Our team is working to resolve this. We'll update you shortly.

For immediate assistance:
📞 Call: +1 (555) 123-4567
💬 WhatsApp: Reply to this message

Track your order: ${window.location.origin}/track

24EX Delivery Services`;
  }

  private static getStatusDescription(status: string): string {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being processed.';
      case 'processing':
        return 'Your order is being prepared for shipment.';
      case 'shipped':
        return 'Your order is on the way to you!';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      default:
        return 'Order status updated.';
    }
  }

  private static async sendMessage(
    to: string, 
    message: string, 
    type: WhatsAppMessage['type'], 
    orderId: string
  ): Promise<void> {
    try {
      // In a real implementation, this would call WhatsApp Business API
      // For now, we'll simulate the API call
      
      const messageData: WhatsAppMessage = {
        to,
        message,
        type,
        orderId,
        timestamp: new Date()
      };

      console.log('Sending WhatsApp message:', messageData);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, you would use something like:
      // const response = await fetch('https://api.whatsapp.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: to,
      //     type: 'text',
      //     text: { body: message }
      //   })
      // });
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  private static cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    return phoneNumber.replace(/[^\d+]/g, '');
  }

  private static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation for international phone numbers
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  static async getTrackingHistory(orderId: string): Promise<any[]> {
    // Mock tracking history
    return [
      {
        id: '1',
        status: 'pending',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        location: 'Warehouse - New York',
        description: 'Order received and processing started'
      },
      {
        id: '2',
        status: 'processing',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: 'Warehouse - New York',
        description: 'Items picked and packed'
      },
      {
        id: '3',
        status: 'shipped',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Distribution Center - Brooklyn',
        description: 'Package dispatched for delivery'
      }
    ];
  }

  static async updateOrderStatus(orderId: string, newStatus: string, location?: string): Promise<void> {
    try {
      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Get order with WhatsApp tracking info
      const order = await this.getOrderById(orderId);
      if (!order) return;

      // Check if WhatsApp tracking is enabled for this order
      const whatsappNumber = await this.getWhatsAppNumber(orderId);
      if (whatsappNumber) {
        await this.sendOrderStatusUpdate(order, whatsappNumber);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  private static async getWhatsAppNumber(orderId: string): Promise<string | null> {
    // In a real implementation, this would query a whatsapp_tracking table
    // For now, return null (no WhatsApp tracking)
    return null;
  }
}