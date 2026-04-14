import { useEffect, useState } from 'react';
import { Plus, Search, ClipboardList, X, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../types';
import StatusBadge from '../components/StatusBadge';
import FormField, { Input, Textarea, Select } from '../components/FormField';
import EmptyState from '../components/EmptyState';

type View = 'list' | 'form' | 'detail';

export default function WorkOrderPage() {
  const [view, setView] = useState<View>('list');
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<WorkOrder>>({
    title: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    scheduled_date: '',
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ title: '', customer_name: '', customer_phone: '', customer_address: '', description: '', status: 'pending', priority: 'medium', scheduled_date: '' });
    setSelected(null);
    setView('form');
  };

  const openEdit = (item: WorkOrder) => {
    setForm({ ...item });
    setSelected(item);
    setView('form');
  };

  const openDetail = (item: WorkOrder) => {
    setSelected(item);
    setView('detail');
  };

  const handleSave = async () => {
    if (!form.title || !form.customer_name) return;
    setSaving(true);
    if (selected) {
      await supabase.from('work_orders').update({ ...form, updated_at: new Date().toISOString() }).eq('id', selected.id);
    } else {
      await supabase.from('work_orders').insert({ ...form });
    }
    await load();
    setSaving(false);
    setView('list');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('work_orders').delete().eq('id', id);
    await load();
    setView('list');
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const priorityColor: Record<WorkOrderPriority, string> = {
    low: 'bg-slate-100 text-slate-500',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-red-100 text-red-600',
  };

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button onClick={() => setView('list')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-600" />
          </button>
          <h2 className="text-base font-semibold text-slate-800 flex-1">
            {selected ? 'Edit Work Order' : 'Work Order Baru'}
          </h2>
          <button
            onClick={handleSave}
            disabled={!form.title || !form.customer_name || saving}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-40 active:scale-95 transition-all"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <FormField label="Judul Pekerjaan" required>
            <Input placeholder="Contoh: Servis AC" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Nama Pelanggan" required>
            <Input placeholder="Nama lengkap" value={form.customer_name ?? ''} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
          </FormField>
          <FormField label="No. Telepon">
            <Input type="tel" placeholder="08xxxxxxxxxx" value={form.customer_phone ?? ''} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
          </FormField>
          <FormField label="Alamat">
            <Textarea rows={2} placeholder="Alamat pelanggan" value={form.customer_address ?? ''} onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))} />
          </FormField>
          <FormField label="Deskripsi Pekerjaan">
            <Textarea rows={3} placeholder="Detail pekerjaan yang akan dilakukan..." value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status">
              <Select value={form.status ?? 'pending'} onChange={e => setForm(f => ({ ...f, status: e.target.value as WorkOrderStatus }))}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormField>
            <FormField label="Prioritas">
              <Select value={form.priority ?? 'medium'} onChange={e => setForm(f => ({ ...f, priority: e.target.value as WorkOrderPriority }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Jadwal Tanggal">
            <Input type="date" value={form.scheduled_date ?? ''} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
          </FormField>
          {selected && (
            <button
              onClick={() => handleDelete(selected.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 active:scale-95 transition-all mt-4"
            >
              <Trash2 size={15} />
              Hapus Work Order
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'detail' && selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button onClick={() => setView('list')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-600" />
          </button>
          <h2 className="text-base font-semibold text-slate-800 flex-1">Detail Work Order</h2>
          <button onClick={() => openEdit(selected)} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all">Edit</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-800">{selected.title}</h3>
              <StatusBadge status={selected.status} />
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColor[selected.priority]}`}>
              Prioritas: {selected.priority === 'low' ? 'Rendah' : selected.priority === 'medium' ? 'Sedang' : 'Tinggi'}
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Informasi Pelanggan</h4>
            <DetailRow label="Nama" value={selected.customer_name} />
            <DetailRow label="Telepon" value={selected.customer_phone || '-'} />
            <DetailRow label="Alamat" value={selected.customer_address || '-'} />
          </div>
          {selected.description && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Deskripsi</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selected.description}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Jadwal & Waktu</h4>
            <DetailRow label="Tanggal Dijadwalkan" value={selected.scheduled_date ? new Date(selected.scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
            <DetailRow label="Dibuat" value={new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Work Order</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all">
            <Plus size={15} />
            Baru
          </button>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari work order..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-2" />
              <div className="h-3 w-1/3 bg-slate-100 rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={28} />}
            title="Belum ada Work Order"
            description="Tap tombol Baru untuk membuat work order pertama"
            action={
              <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all">
                <Plus size={15} />
                Buat Work Order
              </button>
            }
          />
        ) : (
          filtered.map(item => (
            <button
              key={item.id}
              onClick={() => openDetail(item)}
              className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-slate-200 active:scale-[0.99] transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.customer_name}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColor[item.priority]}`}>
                  {item.priority === 'low' ? 'Rendah' : item.priority === 'medium' ? 'Sedang' : 'Tinggi'}
                </span>
                {item.scheduled_date && (
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(item.scheduled_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-700 text-right">{value}</span>
    </div>
  );
}
