/*
  # Add pipeline relations for quotation and invoice

  ## Changes
  - Add `work_order_id` to `quotations` with FK to `work_orders`
  - Add indexes for relation-heavy queries on pipeline screens
*/

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotations_work_order_id
  ON quotations(work_order_id);

CREATE INDEX IF NOT EXISTS idx_invoices_quotation_id
  ON invoices(quotation_id);

CREATE INDEX IF NOT EXISTS idx_invoices_work_order_id
  ON invoices(work_order_id);
