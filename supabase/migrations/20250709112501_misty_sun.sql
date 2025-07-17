/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - The current RLS policies on the users table are causing infinite recursion
    - The "Admins can manage users" policy queries the users table within its own policy check
    - This creates a circular dependency that causes database timeouts

  2. Solution
    - Drop the problematic policies that cause recursion
    - Create simpler, non-recursive policies
    - Use auth.uid() directly instead of subqueries to the users table
    - Separate admin management from regular user access

  3. New Policies
    - Users can view their own profile using auth.uid() = id
    - Users can update their own profile using auth.uid() = id
    - Remove the recursive admin policy for now to prevent infinite loops
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Enable users to view their own data only" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);