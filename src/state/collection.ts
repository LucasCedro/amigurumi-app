import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'amg:collection:v1';

/** um amigurumi finalizado e guardado no portfólio da pessoa */
export interface FinishedProject {
  id: string;
  recipeId: string;
  finishedAt: number;
}

async function readAll(): Promise<FinishedProject[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FinishedProject[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(list: FinishedProject[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

/** finalizados, mais recentes primeiro */
export async function listFinished(): Promise<FinishedProject[]> {
  const list = await readAll();
  return list.sort((a, b) => b.finishedAt - a.finishedAt);
}

/** adiciona um novo finalizado ao portfólio e devolve a lista atualizada */
export async function addFinished(recipeId: string): Promise<FinishedProject[]> {
  const list = await readAll();
  list.push({
    id: `${recipeId}-${Date.now()}`,
    recipeId,
    finishedAt: Date.now(),
  });
  await writeAll(list);
  return list.sort((a, b) => b.finishedAt - a.finishedAt);
}

export async function removeFinished(id: string): Promise<void> {
  const list = await readAll();
  await writeAll(list.filter((f) => f.id !== id));
}
