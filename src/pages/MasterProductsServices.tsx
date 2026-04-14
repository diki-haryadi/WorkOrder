import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Box, Plus, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MasterProductService } from '../types';
import { useAuth } from '../context/AuthContext';
import FormField, { Input, Select } from '../components/FormField';
import EmptyState from '../components/EmptyState';

interface MasterProductsServicesPageProps {
  onBack: () => void;
}

const newFormState: Partial<MasterProductService> = {
  code: '',
  name: '',
  kind: 'product',
  category: '',
  default_price: 0,
  is_active: true,
};

export default function MasterProductsServicesPage({ onBack }: MasterProductsServicesPageProps) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const [items, setItems] = useState<MasterProductService[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MasterProductService>>(newFormState);

  const load = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { data } = await supabase
      .from('master_products_services')
      .select('*')
      .order('created_at', { ascending: false });
    setItems((data ?? []) as MasterProductService[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const filtered = useMemo(() => items.filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword)
    );
  }), [items, search]);

  const resetForm = () => {
    setEditingId(null);
    setForm(newFormState);
  };

  const openEdit = (item: MasterProductService) => {
    setEditingId(item.id);
    setForm(item);
  };

  const handleSave = async () => {
    if (!isAdmin || !form.code || !form.name || !form.kind) return;
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      kind: form.kind,
      category: form.category?.trim() ?? '',
      default_price: Number(form.default_price ?? 0),
      is_active: Boolean(form.is_active),
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from('master_products_services').update(payload).eq('id', editingId);
    } else {
      await supabase.from('master_products_services').insert(payload);
    }
    await load();
    resetForm();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    await supabase.from('master_products_services').delete().eq('id', id);
    await load();
    if (editingId === id) resetForm();
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <h2 className="text-base font-semibold text-slate-800">Master Produk & Jasa</h2>
        </div>
        <div className="px-4 py-6">
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-3">
            Halaman ini hanya dapat diakses oleh admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-10 space-y-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Master Produk & Jasa</h1>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, nama, kategori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">{editingId ? 'Edit Item Master' : 'Tambah Item Master'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kode" required>
              <Input value={form.code ?? ''} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} />
            </FormField>
            <FormField label="Jenis" required>
              <Select value={form.kind ?? 'product'} onChange={e => setForm(prev => ({ ...prev, kind: e.target.value as 'product' | 'service' }))}>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Nama" required>
            <Input value={form.name ?? ''} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kategori">
              <Input value={form.category ?? ''} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} />
            </FormField>
            <FormField label="Harga Default">
              <Input type="number" min="0" value={form.default_price ?? 0} onChange={e => setForm(prev => ({ ...prev, default_price: Number(e.target.value) }))} />
            </FormField>
          </div>
          <FormField label="Status Aktif">
            <Select value={form.is_active ? 'true' : 'false'} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </Select>
          </FormField>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.code || !form.name}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 active:scale-95 transition-all"
            >
              <Plus size={14} />
              {saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Tambah')}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600">
                Batal
              </button>
            )}
          </div>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-2" />
              <div className="h-3 w-1/3 bg-slate-100 rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Box size={28} />}
            title="Belum ada item master"
            description="Tambahkan produk atau jasa untuk dipakai di Work Order."
          />
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.code} - {item.kind} - {item.category}</p>
                  <p className="text-xs mt-1">
                    <span className="font-medium text-blue-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.default_price)}
                    </span>
                    <span className={`ml-2 ${item.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(item)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg border border-red-200 text-red-500 flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
