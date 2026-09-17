import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../../state/gameStore';
import { initialQuestProgress } from './questProgress';
import { parseSave } from '../../save/saveService';
import { areas } from '../../data/areas';
import { RESOURCE_RESPAWN_MS, remainingTimeLabel } from './resourceRespawn';

const completedQuest = {
  ...initialQuestProgress,
  cleanedObjectIds: areas['atelier-interior'].objects.filter((object) => object.kind === 'box' || object.kind === 'cobweb').map((object) => object.id),
  windowOpen: true,
  photoFound: true,
  completed: true,
};

beforeEach(() => gameStore.getState().resetGame());

describe('coleta e crafting', () => {
  it('permite madeira antes da missão e reaparece após três minutos', () => {
    const state = gameStore.getState();
    const now = 1_000_000;
    expect(state.collectResource('wood-0', 'wood', now)).toBe(true);
    expect(state.collectResource('wood-0', 'wood', now + RESOURCE_RESPAWN_MS - 1)).toBe(false);
    expect(gameStore.getState().resourceReadyAt['wood-0']).toBe(now + RESOURCE_RESPAWN_MS);
    expect(remainingTimeLabel(now + RESOURCE_RESPAWN_MS, now)).toBe('03:00');
    expect(state.collectResource('wood-0', 'wood', now + RESOURCE_RESPAWN_MS)).toBe(true);
    expect(gameStore.getState().inventory.wood).toBe(2);
    expect(state.repairBench()).toBe(false);
  });

  it('permite coletar pedra antes da missao e recarrega depois da coleta', () => {
    const state = gameStore.getState();
    const now = 1_000_000;
    expect(state.repairBench()).toBe(false);
    expect(state.collectResource('stone-0', 'stone', now)).toBe(true);
    expect(state.collectResource('stone-0', 'stone', now + RESOURCE_RESPAWN_MS - 1)).toBe(false);
    expect(gameStore.getState().resourceReadyAt['stone-0']).toBe(now + RESOURCE_RESPAWN_MS);
    expect(state.collectResource('stone-0', 'stone', now + RESOURCE_RESPAWN_MS)).toBe(true);
    expect(gameStore.getState().inventory.stone).toBe(2);
  });

  it('consome os materiais uma vez para reparo e cadeira', () => {
    const state = gameStore.getState();
    for (let index = 0; index < 5; index++) state.collectResource(`wood-${index}`, 'wood', 1_000_000);
    state.setQuest(completedQuest);
    for (let index = 0; index < 3; index++) state.collectResource(`stone-${index}`, 'stone', 1_000_000);
    expect(state.repairBench()).toBe(true);
    expect(state.repairBench()).toBe(false);
    expect(gameStore.getState().inventory).toEqual({ wood: 2, stone: 1, chair: 0 });
    expect(state.craftChair()).toBe(true);
    expect(state.craftChair()).toBe(false);
    expect(gameStore.getState().inventory).toEqual({ wood: 0, stone: 0, chair: 1 });
  });

  it('lê saves antigos e valida temporizadores de ambos os recursos no V4', () => {
    const base = {
      updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-interior',
      playerPosition: { x: 700, y: 700 }, quest: completedQuest,
    };
    expect(parseSave(JSON.stringify({ ...base, version: 1 }))).not.toBeNull();
    const v2 = { ...base, version: 2, inventory: { wood: 0, stone: 0, chair: 1 }, collectedResourceIds: ['wood-0', 'stone-0'], benchRepaired: true };
    expect(parseSave(JSON.stringify(v2))).toEqual(v2);
    const v3 = { ...v2, version: 3, collectedResourceIds: ['stone-0'], woodReadyAt: { 'wood-0': 1_180_000 } };
    expect(parseSave(JSON.stringify(v3))).toEqual(v3);
    const v4 = { ...base, version: 4, inventory: v2.inventory, benchRepaired: true, resourceReadyAt: { 'wood-0': 1_180_000, 'stone-0': 1_180_000 } };
    expect(parseSave(JSON.stringify(v4))).toEqual(v4);
    expect(parseSave(JSON.stringify({ ...v4, resourceReadyAt: { 'wrong-id': 1_180_000 } }))).toBeNull();
  });
});