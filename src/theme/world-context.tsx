import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { World } from '@/types/recipe';
import { WORLDS, type WorldTheme } from '@/theme/worlds';

const STORAGE_KEY = 'amg:selectedWorld';

interface WorldContextValue {
  world: World;
  theme: WorldTheme;
  setWorld: (w: World) => void;
  toggleWorld: () => void;
  ready: boolean;
}

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [world, setWorldState] = useState<World>('amigurumi');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'amigurumi' || v === 'trico') setWorldState(v);
      })
      .finally(() => setReady(true));
  }, []);

  const setWorld = (w: World) => {
    setWorldState(w);
    void AsyncStorage.setItem(STORAGE_KEY, w);
  };

  const toggleWorld = () => setWorld(world === 'amigurumi' ? 'trico' : 'amigurumi');

  return (
    <WorldContext.Provider value={{ world, theme: WORLDS[world], setWorld, toggleWorld, ready }}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error('useWorld precisa estar dentro de <WorldProvider>');
  return ctx;
}
