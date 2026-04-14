import { useEffect, useState } from 'react';
import {
  ClipboardList,
  FileText,
  Receipt,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NavTab } from '../types';

interface Stats {
  workOrders: { total: number; pending: number; in_progress: number; ready_to_quotation: number; completed: number };
  quotations: { total: number; draft: number; sent: number; ready_to_invoice: number; accepted: number };
  invoices: { total: number; draft: number; paid: number; overdue: number; totalRevenue: number };
}

interface HomeProps {
  onNavigate: (tab: NavTab) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState<Stats>({
    workOrders: { total: 0, pending: 0, in_progress: 0, ready_to_quotation: 0, completed: 0 },
    quotations: { total: 0, draft: 0, sent: 0, ready_to_invoice: 0, accepted: 0 },
    invoices: { total: 0, draft: 0, paid: 0, overdue: 0, totalRevenue: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [woRes, qtRes, invRes] = await Promise.all([
        supabase.from('work_orders').select('status'),
        supabase.from('quotations').select('status'),
        supabase.from('invoices').select('status, total'),
      ]);

      const wo = woRes.data ?? [];
      const qt = qtRes.data ?? [];
      const inv = invRes.data ?? [];

      setStats({
        workOrders: {
          total: wo.length,
          pending: wo.filter(r => r.status === 'pending').length,
          in_progress: wo.filter(r => r.status === 'in_progress').length,
          ready_to_quotation: wo.filter(r => r.status === 'ready_to_quotation').length,
          completed: wo.filter(r => r.status === 'completed').length,
        },
        quotations: {
          total: qt.length,
          draft: qt.filter(r => r.status === 'draft').length,
          sent: qt.filter(r => r.status === 'sent').length,
          ready_to_invoice: qt.filter(r => r.status === 'ready_to_invoice').length,
          accepted: qt.filter(r => r.status === 'accepted').length,
        },
        invoices: {
          total: inv.length,
          draft: inv.filter(r => r.status === 'draft').length,
          paid: inv.filter(r => r.status === 'paid').length,
          overdue: inv.filter(r => r.status === 'overdue').length,
          totalRevenue: inv.filter(r => r.status === 'paid').reduce((acc, r) => acc + Number(r.total), 0),
        },
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">{today}</p>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          AD
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="opacity-80" />
          <span className="text-sm font-medium opacity-80">Total Pendapatan</span>
        </div>
        <div className="text-2xl font-bold mb-1">
          {loading ? (
            <div className="h-8 w-40 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            formatCurrency(stats.invoices.totalRevenue)
          )}
        </div>
        <p className="text-xs opacity-60">{stats.invoices.paid} invoice terbayar</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Work Order"
          value={stats.workOrders.total}
          loading={loading}
          color="blue"
          icon={<ClipboardList size={16} />}
          onClick={() => onNavigate('workorder')}
        />
        <StatCard
          label="Quotation"
          value={stats.quotations.total}
          loading={loading}
          color="emerald"
          icon={<FileText size={16} />}
          onClick={() => onNavigate('quotation')}
        />
        <StatCard
          label="Invoice"
          value={stats.invoices.total}
          loading={loading}
          color="amber"
          icon={<Receipt size={16} />}
          onClick={() => onNavigate('invoice')}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Ringkasan Status</h2>
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
          <SummaryRow
            icon={<ClipboardList size={15} className="text-blue-500" />}
            label="Work Order"
            items={[
              { icon: <Clock size={11} />, label: 'Pending', value: stats.workOrders.pending, color: 'text-amber-600' },
              { icon: <AlertCircle size={11} />, label: 'Ready QT', value: stats.workOrders.ready_to_quotation, color: 'text-indigo-600' },
              { icon: <AlertCircle size={11} />, label: 'Proses', value: stats.workOrders.in_progress, color: 'text-blue-600' },
              { icon: <CheckCircle2 size={11} />, label: 'Selesai', value: stats.workOrders.completed, color: 'text-emerald-600' },
            ]}
            loading={loading}
            onClick={() => onNavigate('workorder')}
          />
          <SummaryRow
            icon={<FileText size={15} className="text-emerald-500" />}
            label="Quotation"
            items={[
              { icon: <Clock size={11} />, label: 'Draft', value: stats.quotations.draft, color: 'text-slate-500' },
              { icon: <AlertCircle size={11} />, label: 'Ready INV', value: stats.quotations.ready_to_invoice, color: 'text-violet-600' },
              { icon: <AlertCircle size={11} />, label: 'Terkirim', value: stats.quotations.sent, color: 'text-blue-600' },
              { icon: <CheckCircle2 size={11} />, label: 'Diterima', value: stats.quotations.accepted, color: 'text-emerald-600' },
            ]}
            loading={loading}
            onClick={() => onNavigate('quotation')}
          />
          <SummaryRow
            icon={<Receipt size={15} className="text-amber-500" />}
            label="Invoice"
            items={[
              { icon: <Clock size={11} />, label: 'Draft', value: stats.invoices.draft, color: 'text-slate-500' },
              { icon: <CheckCircle2 size={11} />, label: 'Terbayar', value: stats.invoices.paid, color: 'text-emerald-600' },
              { icon: <AlertCircle size={11} />, label: 'Overdue', value: stats.invoices.overdue, color: 'text-red-600' },
            ]}
            loading={loading}
            onClick={() => onNavigate('invoice')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <QuickAction
          icon={<ClipboardList size={18} className="text-blue-600" />}
          label="Buat Work Order Baru"
          description="Tambah pekerjaan baru"
          onClick={() => onNavigate('workorder')}
          color="bg-blue-50"
        />
        <QuickAction
          icon={<FileText size={18} className="text-emerald-600" />}
          label="Buat Quotation Baru"
          description="Buat penawaran harga"
          onClick={() => onNavigate('quotation')}
          color="bg-emerald-50"
        />
        <QuickAction
          icon={<Receipt size={18} className="text-amber-600" />}
          label="Buat Invoice Baru"
          description="Tagih pembayaran"
          onClick={() => onNavigate('invoice')}
          color="bg-amber-50"
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  color,
  icon,
  onClick,
}: {
  label: string;
  value: number;
  loading: boolean;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col gap-2 text-left hover:border-slate-200 active:scale-95 transition-all"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      {loading ? (
        <div className="h-6 w-8 bg-slate-100 rounded animate-pulse" />
      ) : (
        <span className="text-xl font-bold text-slate-800">{value}</span>
      )}
      <span className="text-xs text-slate-400 leading-tight">{label}</span>
    </button>
  );
}

function SummaryRow({
  icon,
  label,
  items,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  items: { icon: React.ReactNode; label: string; value: number; color: string }[];
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
        <div className="flex items-center gap-3">
          {items.map((item, i) => (
            <div key={i} className={`flex items-center gap-1 ${item.color}`}>
              {item.icon}
              {loading ? (
                <div className="h-3 w-5 bg-slate-100 rounded animate-pulse" />
              ) : (
                <span className="text-xs font-medium">{item.value} {item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
    </button>
  );
}

function QuickAction({
  icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3.5 hover:border-slate-200 active:scale-[0.99] transition-all text-left"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300" />
    </button>
  );
}
