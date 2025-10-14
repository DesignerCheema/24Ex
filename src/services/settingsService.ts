import { supabase } from '../lib/supabase';

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  companyAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  businessHours: {
    open: string;
    close: string;
    timezone: string;
    workingDays: string[];
  };
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  language: string;
  theme: 'light' | 'dark' | 'auto';
  defaultDeliveryFee: number;
  taxRate: number;
  orderNumberPrefix: string;
  invoiceNumberPrefix: string;
  trackingNumberPrefix: string;
}

export interface NotificationSettings {
  emailNotifications: {
    orderCreated: boolean;
    orderStatusChanged: boolean;
    deliveryCompleted: boolean;
    paymentReceived: boolean;
    lowStock: boolean;
    systemAlerts: boolean;
  };
  smsNotifications: {
    orderCreated: boolean;
    deliveryUpdates: boolean;
    urgentAlerts: boolean;
  };
  pushNotifications: {
    realTimeUpdates: boolean;
    dailySummary: boolean;
    weeklyReports: boolean;
  };
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  sessionSettings: {
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: ('sms' | 'email' | 'app')[];
  };
  ipWhitelist: {
    enabled: boolean;
    allowedIPs: string[];
  };
  auditLog: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
  apiSecurity: {
    rateLimiting: boolean;
    requestsPerMinute: number;
    requireApiKey: boolean;
  };
}

export interface BackupSettings {
  id: string;
  name: string;
  createdAt: Date;
  size: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'in_progress' | 'failed';
}

export class SettingsService {
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      // In a real implementation, this would come from a settings table
      // For now, return default settings
      return {
        companyName: '24EX Delivery Services',
        companyAddress: {
          street: '123 Business Street',
          city: 'New York',
          state: 'NY',
          country: 'United States',
          zipCode: '10001'
        },
        contactInfo: {
          phone: '+1 (555) 123-4567',
          email: 'contact@24ex.com',
          website: 'https://24ex.com'
        },
        businessHours: {
          open: '08:00',
          close: '18:00',
          timezone: 'America/New_York',
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        language: 'en',
        theme: 'light',
        defaultDeliveryFee: 25,
        taxRate: 8.0,
        orderNumberPrefix: 'ORD',
        invoiceNumberPrefix: 'INV',
        trackingNumberPrefix: 'TR'
      };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  static async updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
    try {
      // In a real implementation, this would update a settings table
      console.log('Updating system settings:', settings);
      return settings;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      return {
        emailNotifications: {
          orderCreated: true,
          orderStatusChanged: true,
          deliveryCompleted: true,
          paymentReceived: true,
          lowStock: true,
          systemAlerts: true
        },
        smsNotifications: {
          orderCreated: false,
          deliveryUpdates: true,
          urgentAlerts: true
        },
        pushNotifications: {
          realTimeUpdates: true,
          dailySummary: true,
          weeklyReports: false
        },
        notificationFrequency: 'immediate',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  }

  static async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    try {
      console.log('Updating notification settings:', settings);
      return settings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  static async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      return {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          expirationDays: 90
        },
        sessionSettings: {
          sessionTimeout: 480, // 8 hours
          maxConcurrentSessions: 3,
          requireReauth: false
        },
        twoFactorAuth: {
          enabled: false,
          required: false,
          methods: ['email']
        },
        ipWhitelist: {
          enabled: false,
          allowedIPs: []
        },
        auditLog: {
          enabled: true,
          retentionDays: 365,
          logLevel: 'detailed'
        },
        apiSecurity: {
          rateLimiting: true,
          requestsPerMinute: 100,
          requireApiKey: true
        }
      };
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  }

  static async updateSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    try {
      console.log('Updating security settings:', settings);
      return settings;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  static async getBackups(): Promise<BackupSettings[]> {
    try {
      // Mock backup data
      return [
        {
          id: '1',
          name: 'Daily Backup - ' + new Date().toLocaleDateString(),
          createdAt: new Date(),
          size: '2.4 GB',
          type: 'automatic',
          status: 'completed'
        },
        {
          id: '2',
          name: 'Manual Backup - Pre-Update',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          size: '2.3 GB',
          type: 'manual',
          status: 'completed'
        },
        {
          id: '3',
          name: 'Weekly Backup',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          size: '2.1 GB',
          type: 'automatic',
          status: 'completed'
        }
      ];
    } catch (error) {
      console.error('Error fetching backups:', error);
      throw error;
    }
  }

  static async createBackup(): Promise<BackupSettings> {
    try {
      // Mock backup creation
      const newBackup: BackupSettings = {
        id: Date.now().toString(),
        name: 'Manual Backup - ' + new Date().toLocaleString(),
        createdAt: new Date(),
        size: '2.4 GB',
        type: 'manual',
        status: 'completed'
      };

      return newBackup;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  static async restoreBackup(backupId: string): Promise<void> {
    try {
      console.log('Restoring backup:', backupId);
      // Mock restore process
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  static async deleteBackup(backupId: string): Promise<void> {
    try {
      console.log('Deleting backup:', backupId);
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  static async getSystemHealth(): Promise<{
    database: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    backup: 'healthy' | 'warning' | 'error';
    uptime: string;
    version: string;
  }> {
    try {
      return {
        database: 'healthy',
        storage: 'healthy',
        api: 'healthy',
        backup: 'healthy',
        uptime: '15 days, 4 hours',
        version: '2.1.0'
      };
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }
}