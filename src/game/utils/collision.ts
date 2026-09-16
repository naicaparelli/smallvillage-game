import { areas, type AreaId } from '../../data/areas';
import type { QuestProgress } from '../systems/questProgress';

export function isBlocked(
  x: number,
  y: number,
  radius: number,
  obstacles: ReadonlyArray<{ x: number; y: number; width: number; height: number; topPadding?: number }>,
): boolean {
  return obstacles.some((rect) =>
    x + radius > rect.x - rect.width / 2 &&
    x - radius < rect.x + rect.width / 2 &&
    y + (rect.topPadding ?? radius) > rect.y - rect.height / 2 &&
    y - radius < rect.y + rect.height / 2,
  );
}

export function activeObstacles(areaId: AreaId, quest: QuestProgress) {
  const area = areas[areaId];
  return [
    ...area.obstacles,
    ...area.objects.flatMap((object) => {
      if (!object.collision || quest.cleanedObjectIds.includes(object.id) ||
        (object.kind === 'photograph' && !quest.windowOpen)) return [];
      return [{ x: object.x, y: object.y, ...object.collision, topPadding: 3 }];
    }),
  ];
}

export function nearestOpenPoint(
  position: { x: number; y: number },
  radius: number,
  obstacles: ReturnType<typeof activeObstacles>,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
): { x: number; y: number } {
  const origin = {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
  };
  if (!isBlocked(origin.x, origin.y, radius, obstacles)) return origin;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (let distance = 8; distance <= 256; distance += 8) {
    for (const [dx, dy] of directions) {
      const x = origin.x + dx * distance;
      const y = origin.y + dy * distance;
      if (x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY &&
        !isBlocked(x, y, radius, obstacles)) return { x, y };
    }
  }
  return origin;
}
