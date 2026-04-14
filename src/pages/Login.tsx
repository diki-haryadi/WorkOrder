import { FormEvent, useState } from 'react';
import { Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const message = await signInWithEmail(email, password);
    if (message) {
      setError('Email atau password tidak valid.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center">
      <div className="max-w-lg mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <Wrench size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Masuk WorkOrder</h1>
              <p className="text-xs text-slate-500">Login dengan email akun Supabase</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@bengkel.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
