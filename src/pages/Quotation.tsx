import { useEffect, useState } from 'react';
import { Plus, Search, FileText, X, ChevronRight, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Quotation, QuotationStatus, LineItem } from '../types';
import StatusBadge from '../components/StatusBadge';
import FormField, { Input, Textarea, Select } from '../components/FormField';
import EmptyState from '../components/EmptyState';

type View = 'list' | 'form' | 'detail';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

const generateNumber = () => `QT-${Date.now().toString().slice(-6)}`;

const newLineItem = (): LineItem => ({ id: crypto.randomUUID(), description: '', qty: 1, unit_price: 0, amount: 0 });

export default function QuotationPage() {
  const [view, setView] = useState<View>('list');
  const [items, setItems] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<Quotation>>({
    quotation_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    items: [newLineItem()],
    subtotal: 0,
    tax_rate: 11,
    tax_amount: 0,
    total: 0,
    status: 'draft',
    valid_until: '',
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('quotations').select('*').order('created_at', { ascending: false });
    setItems((data ?? []).map(d => ({ ...d, items: Array.isArray(d.items) ? d.items : [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const recalculate = (lineItems: LineItem[], taxRate: number) => {
    const subtotal = lineItems.reduce((acc, i) => acc + i.amount, 0);
    const tax_amount = Math.round(subtotal * taxRate / 100);
    const total = subtotal + tax_amount;
    return { subtotal, tax_amount, total };
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setForm(f => {
      const lineItems = (f.items ?? []).map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.amount = updated.qty * updated.unit_price;
        return updated;
      });
      const calcs = recalculate(lineItems, f.tax_rate ?? 11);
      return { ...f, items: lineItems, ...calcs };
    });
  };

  const addLineItem = () => setForm(f => ({ ...f, items: [...(f.items ?? []), newLineItem()] }));

  const removeLineItem = (id: string) => {
    setForm(f => {
      const lineItems = (f.items ?? []).filter(i => i.id !== id);
      const calcs = recalculate(lineItems, f.tax_rate ?? 11);
      return { ...f, items: lineItems, ...calcs };
    });
  };

  const openCreate = () => {
    setForm({ quotation_number: generateNumber(), customer_name: '', customer_email: '', customer_phone: '', items: [newLineItem()], subtotal: 0, tax_rate: 11, tax_amount: 0, total: 0, status: 'draft', valid_until: '', notes: '' });
    setSelected(null);
    setView('form');
  };

  const openEdit = (item: Quotation) => {
    setForm({ ...item, items: Array.isArray(item.items) ? item.items : [newLineItem()] });
    setSelected(item);
    setView('form');
  };

  const handleSave = async () => {
    if (!form.customer_name) return;
    setSaving(true);
    const payload = { ...form };
    if (selected) {
      await supabase.from('quotations').update(payload).eq('id', selected.id);
    } else {
      await supabase.from('quotations').insert(payload);
    }
    await load();
    setSaving(false);
    setView('list');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('quotations').delete().eq('id', id);
    await load();
    setView('list');
  };

  const filtered = items.filter(i =>
    i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    i.quotation_number.toLowerCase().includes(search.toLowerCase())
  );

  if (view === 'form') {
    const lineItems = form.items ?? [];
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button onClick={() => setView('list')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-600" />
          </button>
          <h2 className="text-base font-semibold text-slate-800 flex-1">{selected ? 'Edit Quotation' : 'Quotation Baru'}</h2>
          <button onClick={handleSave} disabled={!form.customer_name || saving} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-40 active:scale-95 transition-all">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="No. Quotation">
              <Input value={form.quotation_number ?? ''} onChange={e => setForm(f => ({ ...f, quotation_number: e.target.value }))} />
            </FormField>
            <FormField label="Status">
              <Select value={form.status ?? 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value as QuotationStatus }))}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Nama Pelanggan" required>
            <Input placeholder="Nama lengkap / perusahaan" value={form.customer_name ?? ''} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <Input type="email" placeholder="email@contoh.com" value={form.customer_email ?? ''} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} />
            </FormField>
            <FormField label="Telepon">
              <Input type="tel" placeholder="08xx" value={form.customer_phone ?? ''} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Berlaku Hingga">
            <Input type="date" value={form.valid_until ?? ''} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
          </FormField>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Item Pekerjaan</label>
              <button onClick={addLineItem} className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                <PlusCircle size={14} /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Item {idx + 1}</span>
                    {lineItems.length > 1 && (
                      <button onClick={() => removeLineItem(item.id)} className="text-red-400">
                        <MinusCircle size={15} />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Deskripsi item"
                    value={item.description}
                    onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Qty</p>
                      <Input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => updateLineItem(item.id, 'qty', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-1">Harga Satuan</p>
                      <Input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={e => updateLineItem(item.id, 'unit_price', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs font-semibold text-slate-700">{formatIDR(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-700">{formatIDR(form.subtotal ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm gap-3">
              <span className="text-slate-500 flex-shrink-0">PPN</span>
              <div className="flex items-center gap-2 ml-auto">
                <Select
                  value={form.tax_rate ?? 11}
                  className="w-20 py-1"
                  onChange={e => {
                    const taxRate = Number(e.target.value);
                    const calcs = recalculate(form.items ?? [], taxRate);
                    setForm(f => ({ ...f, tax_rate: taxRate, ...calcs }));
                  }}
                >
                  <option value={0}>0%</option>
                  <option value={11}>11%</option>
                  <option value={12}>12%</option>
                </Select>
                <span className="font-medium text-slate-700 text-right min-w-[80px]">{formatIDR(form.tax_amount ?? 0)}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-bold">
              <span className="text-slate-800">Total</span>
              <span className="text-blue-600 text-base">{formatIDR(form.total ?? 0)}</span>
            </div>
          </div>

          <FormField label="Catatan">
            <Textarea rows={2} placeholder="Catatan tambahan..." value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </FormField>
          {selected && (
            <button onClick={() => handleDelete(selected.id)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 active:scale-95 transition-all">
              <Trash2 size={15} />Hapus Quotation
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
          <h2 className="text-base font-semibold text-slate-800 flex-1">{selected.quotation_number}</h2>
          <button onClick={() => openEdit(selected)} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all">Edit</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-800">{selected.customer_name}</span>
              <StatusBadge status={selected.status} />
            </div>
            {selected.customer_email && <p className="text-xs text-slate-400">{selected.customer_email}</p>}
            {selected.customer_phone && <p className="text-xs text-slate-400">{selected.customer_phone}</p>}
            {selected.valid_until && <p className="text-xs text-slate-400">Berlaku s/d {new Date(selected.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Item</h4>
            {(Array.isArray(selected.items) ? selected.items : []).map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{item.description}</p>
                  <p className="text-xs text-slate-400">{item.qty} x {formatIDR(item.unit_price)}</p>
                </div>
                <span className="text-sm font-semibold text-slate-800">{formatIDR(item.amount)}</span>
              </div>
            ))}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{formatIDR(selected.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">PPN {selected.tax_rate}%</span><span>{formatIDR(selected.tax_amount)}</span></div>
              <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-2"><span>Total</span><span className="text-blue-600">{formatIDR(selected.total)}</span></div>
            </div>
          </div>
          {selected.notes && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Catatan</h4>
              <p className="text-sm text-slate-700">{selected.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Quotation</h1>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all">
            <Plus size={15} />Baru
          </button>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari quotation..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-2" /><div className="h-3 w-1/3 bg-slate-100 rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="Belum ada Quotation" description="Buat penawaran harga untuk pelanggan Anda" action={<button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all"><Plus size={15} />Buat Quotation</button>} />
        ) : (
          filtered.map(item => (
            <button key={item.id} onClick={() => { setSelected(item); setView('detail'); }} className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-slate-200 active:scale-[0.99] transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.customer_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.quotation_number}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={item.status} />
                <span className="text-sm font-bold text-blue-600">{formatIDR(item.total)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
