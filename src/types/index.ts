export type WorkOrderStatus = 'pending' | 'in_progress' | 'ready_to_quotation' | 'completed' | 'cancelled';
export type WorkOrderPriority = 'low' | 'medium' | 'high';
export type QuotationStatus = 'draft' | 'sent' | 'ready_to_invoice' | 'accepted' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type UserRole = 'admin' | 'mekanik';

export interface BusinessProfile {
  user_id: string;
  business_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  npwp: string;
  terms: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  created_at?: string;
  updated_at?: string;
}

export interface MasterProductService {
  id: string;
  code: string;
  name: string;
  kind: 'product' | 'service';
  category: string;
  default_price: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrderRepairItem {
  id: string;
  work_order_id?: string;
  master_product_service_id: string | null;
  item_name_snapshot: string;
  qty: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  scheduled_date: string | null;
  repair_items?: WorkOrderRepairItem[];
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit_price: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  work_order_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: QuotationStatus;
  valid_until: string | "";
  notes: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  notes: string;
  work_order_id: string | null;
  quotation_id: string | null;
  created_at: string;
}

export type NavTab = 'home' | 'workorder' | 'quotation' | 'invoice' | 'profile' | 'master_products_services';
