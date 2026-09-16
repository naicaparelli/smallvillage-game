import type { AreaId } from '../data/areas';
import type { CharacterKind } from '../data/characters';
import type { QuestProgress } from '../game/systems/questProgress';
import { questObjectives } from '../game/systems/questProgress';
import { areas } from '../data/areas';
import type { Inventory } from '../data/crafting';

export const SAVE_KEY = 'little-enchantments:save:v1';

export type SaveDataV1 = {
  version: 1;
  updatedAt: string;
  character: CharacterKind;
  areaId: AreaId;
  playerPosition: { x: number; y: number };
  quest: QuestProgress;
};

export type SaveDataV2 = Omit<SaveDataV1, 'version'> & {
  version: 2;
  inventory: Inventory;
  collectedResourceIds: string[];
  benchRepaired: boolean;
};

export type SaveDataV3 = Omit<SaveDataV2, 'version'> & {
  version: 3;
  woodReadyAt: Record<string, number>;
};

export type SaveDataV4 = Omit<SaveDataV3, 'version' | 'woodReadyAt' | 'collectedResourceIds'> & {
  version: 4;
  resourceReadyAt: Record<string, number>;
};

const validWoodIds = new Set(areas['atelier-exterior'].objects.filter((object) => object.resource === 'wood').map((object) => object.id));
const validResourceIds = new Set(areas['atelier-exterior'].objects.filter((object) => object.kind === 'resource').map((object) => object.id));

const validCharacters = ['rabbit', 'kitten', 'puppy'];
const validAreas = ['atelier-exterior', 'atelier-interior'];

export function parseSave(raw: string): SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4 | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const data = value as Record<string, unknown>;
    if ((data.version !== 1 && data.version !== 2 && data.version !== 3 && data.version !== 4) || typeof data.updatedAt !== 'string' || Number.isNaN(Date.parse(data.updatedAt)) || !validCharacters.includes(data.character as string) || !validAreas.includes(data.areaId as string)) return null;
    const position = data.playerPosition as Record<string, unknown> | null;
    const quest = data.quest as Record<string, unknown> | null;
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y) || !quest || !Array.isArray(quest.cleanedObjectIds)) return null;
    const area = areas[data.areaId as AreaId];
    if ((position.x as number) < 0 || (position.x as number) > area.width || (position.y as number) < 0 || (position.y as number) > area.height) return null;
    const validIds = new Set(areas['atelier-interior'].objects.filter((object) => object.kind === 'box' || object.kind === 'cobweb').map((object) => object.id));
    if (!quest.cleanedObjectIds.every((id: unknown) => typeof id === 'string' && validIds.has(id))) return null;
    if (new Set(quest.cleanedObjectIds).size !== quest.cleanedObjectIds.length) return null;
    if (typeof quest.windowOpen !== 'boolean' || typeof quest.photoFound !== 'boolean' || typeof quest.completed !== 'boolean') return null;
    if (quest.photoFound && !quest.windowOpen) return null;
    const objectiveState = questObjectives(quest as QuestProgress);
    if (quest.completed !== objectiveState.every((objective) => objective.current === objective.total)) return null;
    if (data.version === 2 || data.version === 3 || data.version === 4) {
      const inventory = data.inventory as Record<string, unknown> | null;
      const ids = data.collectedResourceIds;
      if (!inventory || !['wood', 'stone', 'chair'].every((key) => Number.isSafeInteger(inventory[key]) && (inventory[key] as number) >= 0)) return null;
      if (data.version !== 4 && (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && validResourceIds.has(id)) || new Set(ids).size !== ids.length)) return null;
      if (typeof data.benchRepaired !== 'boolean' || (data.benchRepaired && !quest.completed) || (inventory.chair as number) > 1 || ((inventory.chair as number) > 0 && !data.benchRepaired)) return null;
      if (data.version === 4) {
        const resourceReadyAt = data.resourceReadyAt as Record<string, unknown> | null;
        if (!resourceReadyAt || Array.isArray(resourceReadyAt) || !Object.entries(resourceReadyAt).every(([id, time]) => validResourceIds.has(id) && Number.isSafeInteger(time) && (time as number) >= 0)) return null;
        return data as SaveDataV4;
      }
      if (data.version === 3) {
        if ((ids as string[]).some((id) => id.startsWith('wood-'))) return null;
        const woodReadyAt = data.woodReadyAt as Record<string, unknown> | null;
        if (!woodReadyAt || Array.isArray(woodReadyAt) || !Object.entries(woodReadyAt).every(([id, time]) => validWoodIds.has(id) && Number.isSafeInteger(time) && (time as number) >= 0)) return null;
        return data as SaveDataV3;
      }
      return data as SaveDataV2;
    }
    return data as SaveDataV1;
  } catch {
    return null;
  }
}

export function loadSave(): { data: SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4 | null; corrupted: boolean } {
  if (typeof window === 'undefined') return { data: null, corrupted: false };
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw === null) return { data: null, corrupted: false };
    const data = parseSave(raw);
    if (data) return { data, corrupted: false };
    window.localStorage.setItem(`${SAVE_KEY}:corrupt:${Date.now()}`, raw);
    window.localStorage.removeItem(SAVE_KEY);
    return { data: null, corrupted: true };
  } catch {
    return { data: null, corrupted: true };
  }
}

export function writeSave(data: SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4): boolean {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): boolean {
  try {
    window.localStorage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
