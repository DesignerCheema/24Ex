/*
  # Fix customers table RLS policies

  1. Security Updates
    - Add policy for anonymous users to read customers
    - Add policy for anonymous users to create customers
    - Update existing policies to work with anonymous access

  This migration addresses RLS violations that prevent order creation
  when users are not authenticated through Supabase auth.
*/

-- Drop existing restrictive policies that only allow authenticated users
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can read all customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;

-- Create new policies that allow anonymous access for basic operations
CREATE POLICY "Allow anonymous to read customers"
  ON customers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous to create customers"
  ON customers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to update customers"
  ON customers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Keep authenticated users able to do everything
CREATE POLICY "Authenticated users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);