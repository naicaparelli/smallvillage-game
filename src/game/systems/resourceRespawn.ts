export const RESOURCE_RESPAWN_MS = 3 * 60 * 1000;

export function resourceReadyAtAfterCollection(now: number): number {
  return now + RESOURCE_RESPAWN_MS;
}

export function resourceIsReady(readyAt: number | undefined, now: number): boolean {
  return readyAt === undefined || now >= readyAt;
}

export function remainingTimeLabel(readyAt: number, now: number): string {
  const seconds = Math.ceil(Math.max(0, readyAt - now) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
