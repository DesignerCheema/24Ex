import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          company: string | null;
          tier: 'bronze' | 'silver' | 'gold' | 'platinum';
          address: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          company?: string | null;
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
          address: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          company?: string | null;
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
          address?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          items: any;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          payment_method: 'cod' | 'prepaid' | 'credit';
          delivery_address: any;
          pickup_address: any;
          tracking_number: string;
          total_amount: number;
          delivery_fee: number;
          tax: number;
          discount: number;
          delivery_date: string | null;
          special_instructions: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id: string;
          items?: any;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          payment_method: 'cod' | 'prepaid' | 'credit';
          delivery_address: any;
          pickup_address: any;
          tracking_number: string;
          total_amount?: number;
          delivery_fee?: number;
          tax?: number;
          discount?: number;
          delivery_date?: string | null;
          special_instructions?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string;
          items?: any;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          payment_method?: 'cod' | 'prepaid' | 'credit';
          delivery_address?: any;
          pickup_address?: any;
          tracking_number?: string;
          total_amount?: number;
          delivery_fee?: number;
          tax?: number;
          discount?: number;
          delivery_date?: string | null;
          special_instructions?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'dispatcher' | 'agent' | 'warehouse' | 'accounting' | 'customer';
          phone: string | null;
          permissions: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'dispatcher' | 'agent' | 'warehouse' | 'accounting' | 'customer';
          phone?: string | null;
          permissions?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'dispatcher' | 'agent' | 'warehouse' | 'accounting' | 'customer';
          phone?: string | null;
          permissions?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};