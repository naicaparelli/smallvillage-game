export type CardinalDirection = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

export function cardinalDirection(x: number, y: number): CardinalDirection {
  if (Math.hypot(x, y) < 0.12) return { x: 0, y: 0 };
  if (Math.abs(x) > Math.abs(y)) return { x: Math.sign(x) as -1 | 1, y: 0 };
  return { x: 0, y: Math.sign(y) as -1 | 1 };
}
