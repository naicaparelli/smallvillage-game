import { describe, expect, it } from 'vitest';
import { activeObstacles, isBlocked, nearestOpenPoint } from './collision';
import { initialQuestProgress } from '../systems/questProgress';

describe('isBlocked', () => {
  const house = [{ x: 100, y: 100, width: 80, height: 60 }];
  it('impede atravessar um obstáculo', () => {
    expect(isBlocked(100, 100, 10, house)).toBe(true);
    expect(isBlocked(50, 100, 10, house)).toBe(false);
  });
});

describe('activeObstacles', () => {
  it('bloqueia os objetos visíveis e libera uma caixa depois de removida', () => {
    const initial = activeObstacles('atelier-interior', initialQuestProgress);
    expect(isBlocked(390, 310, 15, initial)).toBe(true);
    expect(isBlocked(920, 730, 15, initial)).toBe(true);
    expect(isBlocked(780, 190, 15, initial)).toBe(false);

    const cleaned = activeObstacles('atelier-interior', {
      ...initialQuestProgress,
      cleanedObjectIds: ['box_01'],
      windowOpen: true,
    });
    expect(isBlocked(390, 310, 15, cleaned)).toBe(false);
    expect(isBlocked(780, 190, 15, cleaned)).toBe(false);
    expect(isBlocked(700, 190, 15, cleaned)).toBe(true);
  });

  it('aproxima o contato pela parte de cima sem alterar os outros lados', () => {
    const obstacles = activeObstacles('atelier-interior', initialQuestProgress);
    expect(isBlocked(390, 280, 15, obstacles)).toBe(false);
    expect(isBlocked(390, 291, 15, obstacles)).toBe(true);
    expect(isBlocked(390, 341, 15, obstacles)).toBe(true);
    expect(isBlocked(353, 310, 15, obstacles)).toBe(false);
    expect(isBlocked(354, 310, 15, obstacles)).toBe(true);
  });

  it('reposiciona um save antigo que ficou dentro da bancada', () => {
    const obstacles = activeObstacles('atelier-interior', initialQuestProgress);
    const point = nearestOpenPoint({ x: 920, y: 730 }, 15, obstacles,
      { minX: 80, maxX: 1320, minY: 140, maxY: 840 });
    expect(isBlocked(point.x, point.y, 15, obstacles)).toBe(false);
  });
});
