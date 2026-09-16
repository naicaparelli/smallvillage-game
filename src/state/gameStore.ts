import { createStore } from 'zustand/vanilla';
import { initialInventory, repairCost, chairCost, type Inventory, type ResourceId } from '../data/crafting';
import { areas, type AreaId } from '../data/areas';
import type { CharacterKind } from '../data/characters';
import { initialQuestProgress, type QuestProgress } from '../game/systems/questProgress';
import { loadSave } from '../save/saveService';
import { resourceIsReady, resourceReadyAtAfterCollection } from '../game/systems/resourceRespawn';

export type GameMode = 'menu' | 'explore' | 'paused';

type GameState = {
  mode: GameMode;
  character: CharacterKind | null;
  areaId: AreaId;
  playerPosition: { x: number; y: number };
  quest: QuestProgress;
  inventory: Inventory;
  resourceReadyAt: Record<string, number>;
  benchRepaired: boolean;
  collectResource: (id: string, resource: ResourceId, now?: number) => boolean;
  repairBench: () => boolean;
  craftChair: () => boolean;
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
  inventory: loaded.data && "inventory" in loaded.data ? loaded.data.inventory : { ...initialInventory },
  resourceReadyAt: loaded.data?.version === 4 ? loaded.data.resourceReadyAt : loaded.data?.version === 3
    ? { ...loaded.data.woodReadyAt, ...Object.fromEntries(loaded.data.collectedResourceIds.filter((id) => id.startsWith('stone-')).map((id) => [id, Date.parse(loaded.data!.updatedAt) + 180000])) }
    : loaded.data?.version === 2
      ? Object.fromEntries(loaded.data.collectedResourceIds.map((id) => [id, Date.parse(loaded.data!.updatedAt) + 180000])) : {},
  benchRepaired: loaded.data && "benchRepaired" in loaded.data ? loaded.data.benchRepaired : false,
  saveCorrupted: loaded.corrupted,
  saveFailed: false,
  collectResource: (id, resource, now = Date.now()) => {
    const state = gameStore.getState();
    const object = areas['atelier-exterior'].objects.find((item) => item.id === id);
    if (object?.kind !== 'resource' || object.resource !== resource) return false;
    if (resource === 'stone' && !state.quest.completed) return false;
    if (!resourceIsReady(state.resourceReadyAt[id], now)) return false;
    set({
      resourceReadyAt: { ...state.resourceReadyAt, [id]: resourceReadyAtAfterCollection(now) },
      inventory: { ...state.inventory, [resource]: state.inventory[resource] + 1 },
    });
    return true;
  },
  repairBench: () => {
    const state = gameStore.getState();
    if (!state.quest.completed || state.benchRepaired || state.inventory.wood < repairCost.wood || state.inventory.stone < repairCost.stone) return false;
    set({ benchRepaired: true, inventory: { ...state.inventory, wood: state.inventory.wood - repairCost.wood, stone: state.inventory.stone - repairCost.stone } });
    return true;
  },
  craftChair: () => {
    const state = gameStore.getState();
    if (!state.benchRepaired || state.inventory.chair > 0 || state.inventory.wood < chairCost.wood || state.inventory.stone < chairCost.stone) return false;
    set({ inventory: { wood: state.inventory.wood - chairCost.wood, stone: state.inventory.stone - chairCost.stone, chair: 1 } });
    return true;
  },
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
    quest: initialQuestProgress, inventory: { ...initialInventory }, resourceReadyAt: {}, benchRepaired: false, saveCorrupted: false, saveFailed: false,
  }),
}));
