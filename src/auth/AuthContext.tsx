import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface AppUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function baseUser(user: User): Omit<AppUser, 'isAdmin'> {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    name: (meta.full_name as string) || (meta.name as string) || user.email?.split('@')[0] || 'Artesã',
    email: user.email ?? '',
    picture: (meta.avatar_url as string) || (meta.picture as string) || undefined,
  };
}

function parseTokensFromUrl(url: string): { access_token?: string; refresh_token?: string } {
  const parsed = Linking.parse(url);
  const q = (parsed.queryParams ?? {}) as Record<string, string | undefined>;
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const hashParams = new URLSearchParams(hash);
  return {
    access_token: q.access_token || hashParams.get('access_token') || undefined,
    refresh_token: q.refresh_token || hashParams.get('refresh_token') || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  const loadProfile = useCallback(
    async (userId: string | undefined) => {
      if (!supabase || !userId) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from('profiles').select('is_admin, display_name, avatar_url').eq('id', userId).maybeSingle();
      setIsAdmin(!!data?.is_admin);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadProfile(data.session?.user?.id).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void loadProfile(next?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const user = useMemo(() => {
    if (!session?.user) return null;
    return { ...baseUser(session.user), isAdmin };
  }, [session, isAdmin]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user?.id);
  }, [loadProfile, session?.user?.id]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) return 'Configure o Supabase no arquivo .env (veja o README).';
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message ?? null;
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    if (!supabase) return 'Configure o Supabase no arquivo .env (veja o README).';
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name?.trim() || undefined } },
    });
    return error?.message ?? null;
  };

  const signInWithGoogle = async () => {
    if (!supabase) return 'Configure o Supabase no arquivo .env (veja o README).';

    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return error.message;
    if (!data.url) return 'Não foi possível abrir o Google.';

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      return result.type === 'cancel' ? null : 'Login cancelado.';
    }

    const tokens = parseTokensFromUrl(result.url);
    if (tokens.access_token && tokens.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      return sessionError?.message ?? null;
    }
    return 'Não recebemos a sessão do Google. Confira o redirect no painel do Supabase.';
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        isAdmin,
        refreshProfile,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
