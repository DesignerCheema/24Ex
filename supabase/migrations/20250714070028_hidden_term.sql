/*
  # Create warehouse management tables

  1. New Tables
    - `warehouses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `address` (jsonb)
      - `capacity` (integer)
      - `current_utilization` (integer)
      - `zones` (jsonb)
      - `manager` (text)
      - `contact_info` (jsonb)
      - `operating_hours` (jsonb)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `inventory_items`
      - `id` (uuid, primary key)
      - `sku` (text, unique)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `brand` (text)
      - `quantity` (integer)
      - `reserved_quantity` (integer)
      - `available_quantity` (integer)
      - `min_stock` (integer)
      - `max_stock` (integer)
      - `reorder_point` (integer)
      - `reorder_quantity` (integer)
      - `location` (jsonb)
      - `dimensions` (jsonb)
      - `cost` (numeric)
      - `selling_price` (numeric)
      - `supplier` (text)
      - `expiry_date` (date)
      - `batch_number` (text)
      - `serial_numbers` (jsonb)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `stock_movements`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key)
      - `type` (text)
      - `quantity` (integer)
      - `from_location` (jsonb)
      - `to_location` (jsonb)
      - `order_id` (uuid, foreign key)
      - `reason` (text)
      - `notes` (text)
      - `performed_by` (text)
      - `timestamp` (timestamp)
      - `batch_number` (text)
      - `serial_numbers` (jsonb)

    - `picking_tasks`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `warehouse_id` (uuid, foreign key)
      - `assigned_to` (text)
      - `status` (text)
      - `priority` (text)
      - `items` (jsonb)
      - `estimated_time` (integer)
      - `actual_time` (integer)
      - `created_at` (timestamp)
      - `started_at` (timestamp)
      - `completed_at` (timestamp)
      - `notes` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address jsonb NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  current_utilization integer NOT NULL DEFAULT 0,
  zones jsonb DEFAULT '[]'::jsonb,
  manager text NOT NULL,
  contact_info jsonb NOT NULL,
  operating_hours jsonb NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  brand text,
  quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  available_quantity integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  max_stock integer NOT NULL DEFAULT 0,
  reorder_point integer NOT NULL DEFAULT 0,
  reorder_quantity integer NOT NULL DEFAULT 0,
  location jsonb NOT NULL,
  dimensions jsonb DEFAULT '{}'::jsonb,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  supplier text,
  expiry_date date,
  batch_number text,
  serial_numbers jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES inventory_items(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('inbound', 'outbound', 'transfer', 'adjustment', 'return')),
  quantity integer NOT NULL,
  from_location jsonb,
  to_location jsonb,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  reason text NOT NULL,
  notes text,
  performed_by text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  batch_number text,
  serial_numbers jsonb DEFAULT '[]'::jsonb
);

-- Create picking_tasks table
CREATE TABLE IF NOT EXISTS picking_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE CASCADE,
  assigned_to text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_time integer DEFAULT 0,
  actual_time integer,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  notes text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);

CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity ON inventory_items(quantity);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON stock_movements(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_timestamp ON stock_movements(timestamp);

CREATE INDEX IF NOT EXISTS idx_picking_tasks_order_id ON picking_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_picking_tasks_warehouse_id ON picking_tasks(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_picking_tasks_status ON picking_tasks(status);
CREATE INDEX IF NOT EXISTS idx_picking_tasks_assigned_to ON picking_tasks(assigned_to);

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE picking_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read warehouses"
  ON warehouses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create warehouses"
  ON warehouses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update warehouses"
  ON warehouses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete warehouses"
  ON warehouses
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

CREATE POLICY "Authenticated users can read inventory items"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create inventory items"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory items"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete inventory items"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read stock movements"
  ON stock_movements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create stock movements"
  ON stock_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read picking tasks"
  ON picking_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create picking tasks"
  ON picking_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update picking tasks"
  ON picking_tasks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();