import { useState } from 'react';
import { User, Building2, Mail, Phone, MapPin, Globe, ChevronRight, Bell, Shield, HelpCircle, LogOut, CreditCard as Edit3, X, Check } from 'lucide-react';
import FormField, { Input, Textarea } from '../components/FormField';

interface ProfileData {
  name: string;
  business_name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  npwp: string;
}

const defaultProfile: ProfileData = {
  name: 'Admin',
  business_name: 'CV. Maju Bersama',
  email: 'admin@majubersama.id',
  phone: '0812-3456-7890',
  address: 'Jl. Raya No. 10, Jakarta Selatan',
  website: 'www.majubersama.id',
  npwp: '01.234.567.8-001.000',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(defaultProfile);

  const handleEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const handleSave = () => {
    setProfile({ ...draft });
    setEditing(false);
  };

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (editing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-600" />
          </button>
          <h2 className="text-base font-semibold text-slate-800 flex-1">Edit Profil</h2>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-xl active:scale-95 transition-all">
            <Check size={14} />Simpan
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <FormField label="Nama Lengkap">
            <Input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
          </FormField>
          <FormField label="Nama Bisnis / Perusahaan">
            <Input value={draft.business_name} onChange={e => setDraft(d => ({ ...d, business_name: e.target.value }))} />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
          </FormField>
          <FormField label="Nomor Telepon">
            <Input type="tel" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
          </FormField>
          <FormField label="Alamat">
            <Textarea rows={2} value={draft.address} onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} />
          </FormField>
          <FormField label="Website">
            <Input value={draft.website} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} />
          </FormField>
          <FormField label="NPWP">
            <Input value={draft.npwp} onChange={e => setDraft(d => ({ ...d, npwp: e.target.value }))} />
          </FormField>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
            <p className="text-sm text-slate-500 truncate">{profile.business_name}</p>
            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
          </div>
          <button
            onClick={handleEdit}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all flex-shrink-0"
          >
            <Edit3 size={15} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Informasi Bisnis</p>
          </div>
          <ProfileItem icon={<Building2 size={15} />} label="Perusahaan" value={profile.business_name} />
          <ProfileItem icon={<Mail size={15} />} label="Email" value={profile.email} />
          <ProfileItem icon={<Phone size={15} />} label="Telepon" value={profile.phone} />
          <ProfileItem icon={<MapPin size={15} />} label="Alamat" value={profile.address} />
          <ProfileItem icon={<Globe size={15} />} label="Website" value={profile.website} />
          <ProfileItem icon={<User size={15} />} label="NPWP" value={profile.npwp} last />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pengaturan</p>
          </div>
          <MenuRow icon={<Bell size={15} className="text-blue-500" />} label="Notifikasi" />
          <MenuRow icon={<Shield size={15} className="text-emerald-500" />} label="Keamanan & Privasi" />
          <MenuRow icon={<HelpCircle size={15} className="text-amber-500" />} label="Bantuan & Dukungan" last />
        </div>

        <button className="w-full flex items-center gap-3 bg-white rounded-2xl border border-red-100 px-4 py-3.5 hover:bg-red-50 active:scale-[0.99] transition-all">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut size={15} className="text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-500">Keluar</span>
        </button>

        <p className="text-center text-xs text-slate-300 py-2">Versi 1.0.0</p>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${!last ? 'border-b border-slate-50' : ''}`}>
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm text-slate-700 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function MenuRow({ icon, label, last }: { icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left ${!last ? 'border-b border-slate-50' : ''}`}>
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
      <ChevronRight size={15} className="text-slate-300" />
    </button>
  );
}
