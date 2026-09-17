import { activeObstacles, isBlocked } from '../utils/collision';
import type { QuestProgress } from './questProgress';

export type ChairPlacement = { x: number; y: number };
export const DECORATION_GRID = 40;

export function snapChairPosition(position: ChairPlacement): ChairPlacement {
  return {
    x: Math.round(position.x / DECORATION_GRID) * DECORATION_GRID,
    y: Math.round(position.y / DECORATION_GRID) * DECORATION_GRID,
  };
}

export function canPlaceChair(position: ChairPlacement, quest: QuestProgress, player?: ChairPlacement): boolean {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return false;
  if (position.x < 120 || position.x > 1280 || position.y < 240 || position.y > 780) return false;
  if (position.x % DECORATION_GRID !== 0 || position.y % DECORATION_GRID !== 0) return false;
  if (position.x >= 600 && position.x <= 800 && position.y >= 720) return false;
  if (isBlocked(position.x, position.y, 24, activeObstacles('atelier-interior', quest))) return false;
  if (player && Math.hypot(position.x - player.x, position.y - player.y) < 64) return false;
  return true;
}

export function chairObstacle(placement: ChairPlacement | null) {
  return placement ? [{ x: placement.x, y: placement.y, width: 42, height: 28, topPadding: 3 }] : [];
}
