import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = 'amg:user';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface GoogleConfig {
  webClientId?: string;
  androidClientId?: string;
  iosClientId?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const cfg = (Constants.expoConfig?.extra?.googleAuth ?? {}) as GoogleConfig;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: cfg.webClientId || undefined,
    androidClientId: cfg.androidClientId || undefined,
    iosClientId: cfg.iosClientId || undefined,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as AppUser);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) void fetchProfile(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  async function fetchProfile(accessToken: string) {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const p = await res.json();
      const u: AppUser = { id: p.id, name: p.name, email: p.email, picture: p.picture };
      setUser(u);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      Alert.alert('Ops', 'Não consegui buscar seu perfil do Google. Tente de novo.');
    }
  }

  const signIn = async () => {
    if (!request) {
      Alert.alert(
        'Login ainda não configurado',
        'Falta cadastrar os Client IDs do Google em app.json → extra.googleAuth. Veja o README.',
      );
      return;
    }
    await promptAsync();
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured: !!request, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
