type GameEventMap = {
  PLAYER_READY: { sceneId: string };
  INTERACTION_AVAILABLE: { label: string | null };
  INTERACTION_REQUESTED: Record<string, never>;
  AREA_ENTERED: { areaId: string };
  OBJECT_CLEANED: { objectId: string; objectType: string };
  WINDOW_OPENED: Record<string, never>;
  PHOTO_FOUND: Record<string, never>;
  QUEST_UPDATED: { questId: string };
  SAVE_REQUESTED: { reason: string };
  SYNC_POSITION: Record<string, never>;
  NOTICE: { text: string; image?: string };
};

type Listener<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

class TypedEventBus {
  private listeners = new Map<keyof GameEventMap, Set<Listener<keyof GameEventMap>>>();

  on<K extends keyof GameEventMap>(event: K, listener: Listener<K>): () => void {
    const group = this.listeners.get(event) ?? new Set();
    group.add(listener as Listener<keyof GameEventMap>);
    this.listeners.set(event, group);
    return () => group.delete(listener as Listener<keyof GameEventMap>);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const eventBus = new TypedEventBus();
