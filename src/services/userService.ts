import { supabase } from '../lib/supabase';
import { User, Permission } from '../types';

export interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  phone?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.transformUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.transformUser(data) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async createUser(userData: UserFormData): Promise<User> {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: this.generateTemporaryPassword(),
        email_confirm: true
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create auth user');

      // Then create user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          permissions: userData.permissions || this.getDefaultPermissions(userData.role),
          is_active: userData.isActive !== false,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformUser(data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: Partial<UserFormData>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phone: userData.phone,
          permissions: userData.permissions,
          is_active: userData.isActive,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformUser(data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      // Delete from users table (auth user will be handled by trigger)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async deleteUsers(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting users:', error);
      throw error;
    }
  }

  static async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformUser(data);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  static async updateUserPermissions(id: string, permissions: Permission[]): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ permissions })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformUser(data);
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  static async resetUserPassword(id: string): Promise<void> {
    try {
      const user = await this.getUserById(id);
      if (!user) throw new Error('User not found');

      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: user.email
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  static async getUserActivityLog(id: string): Promise<any[]> {
    // Mock activity log - in real implementation, this would come from an audit table
    return [
      {
        id: '1',
        action: 'login',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'User logged in from 192.168.1.100',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        action: 'order_created',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        details: 'Created order ORD-2024-001',
        resource: 'orders'
      },
      {
        id: '3',
        action: 'profile_updated',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        details: 'Updated profile information',
        resource: 'profile'
      }
    ];
  }

  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentLogins: number;
    newUsersThisMonth: number;
  }> {
    try {
      const users = await this.getAllUsers();
      const now = new Date();
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        usersByRole,
        recentLogins: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= dayAgo).length,
        newUsersThisMonth: users.filter(u => new Date(u.createdAt) >= monthAgo).length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  private static transformUser(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      permissions: data.permissions || [],
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
    };
  }

  private static generateTemporaryPassword(): string {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  }

  private static getDefaultPermissions(role: User['role']): Permission[] {
    switch (role) {
      case 'admin':
        return [
          { id: '1', name: 'All Access', resource: '*', action: 'create' },
          { id: '2', name: 'All Access', resource: '*', action: 'read' },
          { id: '3', name: 'All Access', resource: '*', action: 'update' },
          { id: '4', name: 'All Access', resource: '*', action: 'delete' },
          { id: '5', name: 'All Access', resource: '*', action: 'export' }
        ];
      case 'dispatcher':
        return [
          { id: '6', name: 'Orders Read', resource: 'orders', action: 'read' },
          { id: '7', name: 'Orders Update', resource: 'orders', action: 'update' },
          { id: '8', name: 'Deliveries Read', resource: 'deliveries', action: 'read' },
          { id: '9', name: 'Deliveries Update', resource: 'deliveries', action: 'update' },
          { id: '10', name: 'Analytics Read', resource: 'analytics', action: 'read' }
        ];
      case 'agent':
        return [
          { id: '11', name: 'Deliveries Read', resource: 'deliveries', action: 'read' },
          { id: '12', name: 'Deliveries Update', resource: 'deliveries', action: 'update' },
          { id: '13', name: 'Orders Read', resource: 'orders', action: 'read' }
        ];
      case 'warehouse':
        return [
          { id: '14', name: 'Inventory Read', resource: 'inventory', action: 'read' },
          { id: '15', name: 'Inventory Update', resource: 'inventory', action: 'update' },
          { id: '16', name: 'Warehouses Read', resource: 'warehouses', action: 'read' },
          { id: '17', name: 'Orders Read', resource: 'orders', action: 'read' }
        ];
      case 'accounting':
        return [
          { id: '18', name: 'Invoices Read', resource: 'invoices', action: 'read' },
          { id: '19', name: 'Invoices Create', resource: 'invoices', action: 'create' },
          { id: '20', name: 'Invoices Update', resource: 'invoices', action: 'update' },
          { id: '21', name: 'Reports Export', resource: 'reports', action: 'export' },
          { id: '22', name: 'Analytics Read', resource: 'analytics', action: 'read' }
        ];
      default:
        return [
          { id: '23', name: 'Profile Read', resource: 'profile', action: 'read' },
          { id: '24', name: 'Profile Update', resource: 'profile', action: 'update' }
        ];
    }
  }
}