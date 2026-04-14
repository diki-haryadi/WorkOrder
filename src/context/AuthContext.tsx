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
const AUTH_STORAGE_KEY = 'workorder-auth';

const getCachedSession = (): Session | null => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { currentSession?: Session | null };
    return parsed.currentSession ?? null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cachedSession = getCachedSession();
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [role, setRole] = useState<UserRole>('mekanik');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(!cachedSession);
  const AUTH_BOOT_TIMEOUT_MS = 6000;

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

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('user_id', currentSession.user.id)
        .maybeSingle();

      if (error) {
        setProfile(null);
        return;
      }

      if (data?.role === 'admin' || data?.role === 'mekanik') {
        setRole(data.role);
        setProfile({ role: data.role, full_name: data.full_name ?? '' });
        return;
      }

      setProfile(null);
    } catch {
      setProfile(null);
    }
  };

  const withTimeout = async <T,>(task: Promise<T>, timeoutMs: number) => {
    let timeoutHandle: number | undefined;
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutHandle = window.setTimeout(() => resolve(null), timeoutMs);
    });

    const result = await Promise.race([task, timeoutPromise]);
    if (timeoutHandle !== undefined) {
      window.clearTimeout(timeoutHandle);
    }
    return result;
  };

  useEffect(() => {
    let mounted = true;

    if (cachedSession) {
      withTimeout(resolveRole(cachedSession), AUTH_BOOT_TIMEOUT_MS).catch(() => {
        if (!mounted) return;
        setRole('mekanik');
        setProfile(null);
      });
    }

    withTimeout(supabase.auth.getSession(), AUTH_BOOT_TIMEOUT_MS)
      .then(async (result) => {
        if (!mounted) return;
        const nextSession = result?.data.session ?? null;
        setSession(nextSession);
        await withTimeout(resolveRole(nextSession), AUTH_BOOT_TIMEOUT_MS);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setRole('mekanik');
        setProfile(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      try {
        setSession(nextSession);
        await withTimeout(resolveRole(nextSession), AUTH_BOOT_TIMEOUT_MS);
      } catch {
        if (!mounted) return;
        setRole('mekanik');
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
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
