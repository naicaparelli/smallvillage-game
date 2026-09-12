import { describe, expect, it } from 'vitest';
import { initialQuestProgress } from '../game/systems/questProgress';
import { parseSave, type SaveDataV1 } from './saveService';

const validSave: SaveDataV1 = {
  version: 1,
  updatedAt: '2026-09-12T12:00:00.000Z',
  character: 'rabbit',
  areaId: 'atelier-interior',
  playerPosition: { x: 700, y: 700 },
  quest: initialQuestProgress,
};

describe('save V1', () => {
  it('recupera um save válido', () => {
    expect(parseSave(JSON.stringify(validSave))).toEqual(validSave);
  });

  it('rejeita conteúdo corrompido e progresso contraditório', () => {
    expect(parseSave('{broken')).toBeNull();
    expect(parseSave(JSON.stringify({ ...validSave, playerPosition: { x: 9999, y: 700 } }))).toBeNull();
    expect(parseSave(JSON.stringify({ ...validSave, quest: { ...initialQuestProgress, completed: true } }))).toBeNull();
  });
});
