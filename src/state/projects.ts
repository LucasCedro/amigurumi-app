import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'amg:projects:v2';

export interface ProjectState {
  recipeId: string;
  pieceIdx: number;
  roundIdx: number;
  stepIdx: number;
  finished: boolean;
  updatedAt: number;
}

type ProjectMap = Record<string, ProjectState>;

async function readAll(): Promise<ProjectMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProjectMap) : {};
  } catch {
    return {};
  }
}

async function writeAll(map: ProjectMap): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

/** projetos ativos, mais recentes primeiro */
export async function listProjects(): Promise<ProjectState[]> {
  const map = await readAll();
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(recipeId: string): Promise<ProjectState | undefined> {
  const map = await readAll();
  return map[recipeId];
}

export async function saveProject(state: Omit<ProjectState, 'updatedAt'>): Promise<void> {
  const map = await readAll();
  map[state.recipeId] = { ...state, updatedAt: Date.now() };
  await writeAll(map);
}

export async function deleteProject(recipeId: string): Promise<void> {
  const map = await readAll();
  delete map[recipeId];
  await writeAll(map);
}
