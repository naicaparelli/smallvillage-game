import { describe, expect, it } from 'vitest';
import { canPlaceChair, snapChairPosition } from './decoration';
import { initialQuestProgress } from './questProgress';

describe('posicionamento da cadeira', () => {
  it('encaixa na grade e aceita uma área livre', () => {
    expect(snapChairPosition({ x: 738, y: 608 })).toEqual({ x: 720, y: 600 });
    expect(canPlaceChair({ x: 720, y: 600 }, initialQuestProgress)).toBe(true);
  });

  it('rejeita obstáculos, porta, paredes e a posição do jogador', () => {
    expect(canPlaceChair({ x: 920, y: 720 }, initialQuestProgress)).toBe(false);
    expect(canPlaceChair({ x: 680, y: 760 }, initialQuestProgress)).toBe(false);
    expect(canPlaceChair({ x: 720, y: 160 }, initialQuestProgress)).toBe(false);
    expect(canPlaceChair({ x: 720, y: 600 }, initialQuestProgress, { x: 700, y: 600 })).toBe(false);
  });
});
