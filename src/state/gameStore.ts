import { createStore } from 'zustand/vanilla';
import { areas, type AreaId } from '../data/areas';
import type { CharacterKind } from '../data/characters';
import { initialQuestProgress, type QuestProgress } from '../game/systems/questProgress';
import { loadSave } from '../save/saveService';

export type GameMode = 'menu' | 'explore' | 'paused';

type GameState = {
  mode: GameMode;
  character: CharacterKind | null;
  areaId: AreaId;
  playerPosition: { x: number; y: number };
  quest: QuestProgress;
  saveCorrupted: boolean;
  saveFailed: boolean;
  setMode: (mode: GameMode) => void;
  selectCharacter: (character: CharacterKind) => void;
  setLocation: (areaId: AreaId, position: { x: number; y: number }) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setQuest: (quest: QuestProgress) => void;
  setSaveFailed: (failed: boolean) => void;
  resetGame: () => void;
};

const loaded = loadSave();

export const gameStore = createStore<GameState>((set) => ({
  mode: loaded.data ? 'explore' : 'menu',
  character: loaded.data?.character ?? null,
  areaId: loaded.data?.areaId ?? 'atelier-exterior',
  playerPosition: loaded.data?.playerPosition ?? { ...areas['atelier-exterior'].spawn },
  quest: loaded.data?.quest ?? initialQuestProgress,
  saveCorrupted: loaded.corrupted,
  saveFailed: false,
  setMode: (mode) => set({ mode }),
  selectCharacter: (character) => set({ character, mode: 'explore' }),
  setLocation: (areaId, playerPosition) => set({ areaId, playerPosition }),
  setPosition: (playerPosition) => set((state) =>
    state.playerPosition.x === playerPosition.x && state.playerPosition.y === playerPosition.y ? state : { playerPosition },
  ),
  setQuest: (quest) => set({ quest }),
  setSaveFailed: (saveFailed) => set({ saveFailed }),
  resetGame: () => set({
    mode: 'menu', character: null, areaId: 'atelier-exterior',
    playerPosition: { ...areas['atelier-exterior'].spawn },
    quest: initialQuestProgress, saveCorrupted: false, saveFailed: false,
  }),
}));
