/*
  # Create Work Orders, Quotations, and Invoices Tables

  ## Tables Created
  
  ### work_orders
  - `id` (uuid, primary key)
  - `title` (text) - work order title
  - `customer_name` (text) - customer's full name
  - `customer_phone` (text) - customer phone number
  - `customer_address` (text) - customer address
  - `description` (text) - work description
  - `status` (text) - pending | in_progress | completed | cancelled
  - `priority` (text) - low | medium | high
  - `scheduled_date` (date) - scheduled date
  - `created_at`, `updated_at` (timestamps)

  ### quotations
  - `id` (uuid, primary key)
  - `quotation_number` (text) - auto-generated number
  - `customer_name`, `customer_email`, `customer_phone` - contact info
  - `items` (jsonb) - line items array
  - `subtotal`, `tax_rate`, `tax_amount`, `total` (numeric) - pricing
  - `status` (text) - draft | sent | accepted | rejected
  - `valid_until` (date)
  - `notes` (text)
  - `created_at` (timestamp)

  ### invoices
  - `id` (uuid, primary key)
  - `invoice_number` (text) - auto-generated number
  - `customer_name`, `customer_email`, `customer_phone` - contact info
  - `items` (jsonb) - line items array
  - `subtotal`, `tax_rate`, `tax_amount`, `total` (numeric) - pricing
  - `status` (text) - draft | sent | paid | overdue
  - `due_date` (date)
  - `notes` (text)
  - `work_order_id` (uuid, optional fk)
  - `quotation_id` (uuid, optional fk)
  - `created_at` (timestamp)

  ## Security
  - RLS enabled on all tables
  - Anon role allowed full CRUD for demo purposes (no auth required)
*/

CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_address text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  scheduled_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  valid_until date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  due_date date,
  notes text NOT NULL DEFAULT '',
  work_order_id uuid REFERENCES work_orders(id),
  quotation_id uuid REFERENCES quotations(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select work_orders"
  ON work_orders FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can insert work_orders"
  ON work_orders FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update work_orders"
  ON work_orders FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete work_orders"
  ON work_orders FOR DELETE TO anon
  USING (true);

CREATE POLICY "Anon can select quotations"
  ON quotations FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can insert quotations"
  ON quotations FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update quotations"
  ON quotations FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete quotations"
  ON quotations FOR DELETE TO anon
  USING (true);

CREATE POLICY "Anon can select invoices"
  ON invoices FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can insert invoices"
  ON invoices FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update invoices"
  ON invoices FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete invoices"
  ON invoices FOR DELETE TO anon
  USING (true);
