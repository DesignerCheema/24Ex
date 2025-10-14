import { WhatsAppService } from './whatsappService';
import { Order } from '../types';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'status_update' | 'delivery_notification' | 'issue_alert' | 'welcome';
  template: string;
  variables: string[];
}

export class WhatsAppNotificationService {
  private static templates: NotificationTemplate[] = [
    {
      id: 'order_created',
      name: 'Order Created',
      type: 'status_update',
      template: `🎉 *Order Confirmed - {{orderNumber}}*

Thank you for your order!

📦 Items: {{itemCount}} item(s)
💰 Total: ${{totalAmount}}
🔍 Tracking: {{trackingNumber}}

We'll keep you updated on your delivery progress.

Track your order: {{trackingUrl}}

24EX Delivery Services`,
      variables: ['orderNumber', 'itemCount', 'totalAmount', 'trackingNumber', 'trackingUrl']
    },
    {
      id: 'order_shipped',
      name: 'Order Shipped',
      type: 'status_update',
      template: `🚛 *Your Order is On The Way - {{orderNumber}}*

Great news! Your package is now out for delivery.

📍 Current Location: {{currentLocation}}
⏰ Expected Delivery: {{expectedDelivery}}
🔍 Tracking: {{trackingNumber}}

Our delivery agent will contact you before arrival.

Track live: {{trackingUrl}}

24EX Delivery Services`,
      variables: ['orderNumber', 'currentLocation', 'expectedDelivery', 'trackingNumber', 'trackingUrl']
    },
    {
      id: 'order_delivered',
      name: 'Order Delivered',
      type: 'delivery_notification',
      template: `✅ *Package Delivered - {{orderNumber}}*

Your order has been successfully delivered!

📦 Items: {{itemCount}} item(s)
📍 Delivered to: {{deliveryAddress}}
⏰ Delivered at: {{deliveryTime}}
👤 Received by: {{receivedBy}}

Thank you for choosing 24EX Delivery!

Rate your experience: {{feedbackUrl}}

24EX Delivery Services`,
      variables: ['orderNumber', 'itemCount', 'deliveryAddress', 'deliveryTime', 'receivedBy', 'feedbackUrl']
    },
    {
      id: 'delivery_attempt_failed',
      name: 'Delivery Attempt Failed',
      type: 'issue_alert',
      template: `⚠️ *Delivery Attempt Failed - {{orderNumber}}*

We attempted to deliver your package but encountered an issue:

❌ Reason: {{failureReason}}
📍 Location: {{attemptLocation}}
⏰ Attempted at: {{attemptTime}}

Next Steps:
🔄 We'll attempt delivery again tomorrow
📞 Or call us to reschedule: +1 (555) 123-4567

Track your order: {{trackingUrl}}

24EX Delivery Services`,
      variables: ['orderNumber', 'failureReason', 'attemptLocation', 'attemptTime', 'trackingUrl']
    },
    {
      id: 'delivery_scheduled',
      name: 'Delivery Scheduled',
      type: 'status_update',
      template: `📅 *Delivery Scheduled - {{orderNumber}}*

Your delivery has been scheduled!

📅 Date: {{deliveryDate}}
⏰ Time Window: {{timeWindow}}
📍 Address: {{deliveryAddress}}
🚛 Agent: {{agentName}} ({{agentPhone}})

Please ensure someone is available to receive the package.

Track your order: {{trackingUrl}}

24EX Delivery Services`,
      variables: ['orderNumber', 'deliveryDate', 'timeWindow', 'deliveryAddress', 'agentName', 'agentPhone', 'trackingUrl']
    }
  ];

  static async sendNotification(
    orderId: string, 
    whatsappNumber: string, 
    templateId: string, 
    variables: Record<string, string>
  ): Promise<void> {
    try {
      const template = this.templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      let message = template.template;
      
      // Replace variables in template
      template.variables.forEach(variable => {
        const value = variables[variable] || '';
        message = message.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      });

      await WhatsAppService.sendMessage(whatsappNumber, message, template.type, orderId);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  static async sendBulkNotification(
    orders: Order[], 
    templateId: string, 
    getVariables: (order: Order) => Record<string, string>
  ): Promise<void> {
    try {
      const promises = orders.map(async (order) => {
        const whatsappNumber = await this.getOrderWhatsAppNumber(order.id);
        if (whatsappNumber) {
          const variables = getVariables(order);
          await this.sendNotification(order.id, whatsappNumber, templateId, variables);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  static async scheduleNotification(
    orderId: string,
    whatsappNumber: string,
    templateId: string,
    variables: Record<string, string>,
    scheduleTime: Date
  ): Promise<void> {
    try {
      // In a real implementation, this would use a job queue like Bull or Agenda
      const delay = scheduleTime.getTime() - Date.now();
      
      if (delay > 0) {
        setTimeout(async () => {
          await this.sendNotification(orderId, whatsappNumber, templateId, variables);
        }, delay);
      } else {
        await this.sendNotification(orderId, whatsappNumber, templateId, variables);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  static getAvailableTemplates(): NotificationTemplate[] {
    return this.templates;
  }

  static async getNotificationHistory(orderId: string): Promise<WhatsAppMessage[]> {
    // Mock notification history
    return [
      {
        to: '+1234567890',
        message: 'Order confirmed and processing started',
        type: 'status_update',
        orderId,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        to: '+1234567890',
        message: 'Package shipped and on the way',
        type: 'status_update',
        orderId,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private static async getOrderWhatsAppNumber(orderId: string): Promise<string | null> {
    try {
      // In a real implementation, this would query the database
      // For now, return null (no WhatsApp number stored)
      return null;
    } catch (error) {
      console.error('Error getting WhatsApp number:', error);
      return null;
    }
  }

  static async testWhatsAppConnection(): Promise<boolean> {
    try {
      // Test WhatsApp API connection
      console.log('Testing WhatsApp API connection...');
      
      // Mock test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }

  static async getDeliveryUpdates(orderId: string): Promise<any[]> {
    // Mock real-time delivery updates
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        location: 'Distribution Center - Brooklyn',
        status: 'Package sorted and loaded for delivery',
        coordinates: { lat: 40.6782, lng: -73.9442 }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        location: 'En route to delivery address',
        status: 'Out for delivery - Agent: Mike Wilson',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    ];
  }
}