/*
  # Fix RLS policies for orders table

  1. Security Updates
    - Drop existing restrictive policies
    - Create new policies that allow authenticated users to manage orders
    - Ensure proper INSERT, SELECT, UPDATE permissions for authenticated users
    - Maintain admin-only DELETE policy

  2. Changes Made
    - Allow authenticated users to create orders (INSERT)
    - Allow authenticated users to read all orders (SELECT) 
    - Allow authenticated users to update orders (UPDATE)
    - Keep admin-only DELETE policy
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

-- Create new policies with proper permissions
CREATE POLICY "Authenticated users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

-- Also ensure customers table has proper policies for order creation
DROP POLICY IF EXISTS "Allow anonymous to create customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous to read customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous to update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;

CREATE POLICY "Authenticated users can create customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);