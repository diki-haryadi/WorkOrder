import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface UserProfile {
  role: UserRole;
  full_name: string;
}

interface AuthContextValue {
  session: Session | null;
  role: UserRole;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('mekanik');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const resolveRole = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setRole('mekanik');
      setProfile(null);
      return;
    }

    const metadataRole = currentSession.user.user_metadata?.role;
    if (metadataRole === 'admin' || metadataRole === 'mekanik') {
      setRole(metadataRole);
    } else {
      setRole('mekanik');
    }

    const { data } = await supabase
      .from('user_profiles')
      .select('role, full_name')
      .eq('user_id', currentSession.user.id)
      .maybeSingle();

    if (data?.role === 'admin' || data?.role === 'mekanik') {
      setRole(data.role);
      setProfile({ role: data.role, full_name: data.full_name ?? '' });
      return;
    }

    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await resolveRole(data.session);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await resolveRole(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    role,
    profile,
    loading,
    signInWithEmail,
    signOut,
  }), [session, role, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
