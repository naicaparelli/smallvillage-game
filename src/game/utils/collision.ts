export function isBlocked(
  x: number,
  y: number,
  radius: number,
  obstacles: ReadonlyArray<{ x: number; y: number; width: number; height: number }>,
): boolean {
  return obstacles.some((rect) =>
    x + radius > rect.x - rect.width / 2 &&
    x - radius < rect.x + rect.width / 2 &&
    y + radius > rect.y - rect.height / 2 &&
    y - radius < rect.y + rect.height / 2,
  );
}
