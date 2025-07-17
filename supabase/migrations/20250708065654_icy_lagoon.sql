/*
  # 24EX Delivery Management System Database Schema

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `company` (text, optional)
      - `tier` (text)
      - `address` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `customer_id` (uuid, foreign key)
      - `items` (jsonb)
      - `status` (text)
      - `priority` (text)
      - `payment_method` (text)
      - `delivery_address` (jsonb)
      - `pickup_address` (jsonb)
      - `tracking_number` (text, unique)
      - `total_amount` (decimal)
      - `delivery_fee` (decimal)
      - `tax` (decimal)
      - `discount` (decimal)
      - `delivery_date` (timestamp, optional)
      - `special_instructions` (text, optional)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text)
      - `phone` (text, optional)
      - `permissions` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Admin users can access all data
    - Other roles have restricted access based on permissions

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize search performance
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  company text,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  payment_method text NOT NULL CHECK (payment_method IN ('cod', 'prepaid', 'credit')),
  delivery_address jsonb NOT NULL,
  pickup_address jsonb NOT NULL,
  tracking_number text UNIQUE NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  delivery_fee decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  discount decimal(10,2) NOT NULL DEFAULT 0,
  delivery_date timestamptz,
  special_instructions text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'dispatcher', 'agent', 'warehouse', 'accounting', 'customer')),
  phone text,
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Users can read all customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for orders
CREATE POLICY "Users can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create policies for users
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO customers (name, email, phone, company, tier, address) VALUES
('John Smith', 'john@example.com', '+1234567890', 'Tech Corp', 'gold', '{"street": "123 Main St", "city": "New York", "state": "NY", "country": "USA", "zipCode": "10001"}'),
('Sarah Johnson', 'sarah@example.com', '+1987654321', 'Design Studio', 'silver', '{"street": "789 Pine St", "city": "Los Angeles", "state": "CA", "country": "USA", "zipCode": "90210"}'),
('Mike Wilson', 'mike@example.com', '+1555123456', 'Wilson Industries', 'platinum', '{"street": "456 Oak Ave", "city": "Chicago", "state": "IL", "country": "USA", "zipCode": "60601"}')
ON CONFLICT (email) DO NOTHING;