import { gameStore } from '../state/gameStore';
import { eventBus } from '../game/events/EventBus';
import { clearSave, writeSave, type SaveDataV4 } from './saveService';

let timer: ReturnType<typeof setTimeout> | null = null;

export function saveNow(): boolean {
  if (timer) { clearTimeout(timer); timer = null; }
  const state = gameStore.getState();
  const saved = state.character
    ? writeSave({
        version: 4,
        updatedAt: new Date().toISOString(),
        character: state.character,
        areaId: state.areaId,
        playerPosition: state.playerPosition,
        quest: state.quest,
        inventory: state.inventory,
        resourceReadyAt: state.resourceReadyAt,
        benchRepaired: state.benchRepaired,
      } satisfies SaveDataV4)
    : clearSave();
  if (state.saveFailed === saved) state.setSaveFailed(!saved);
  return saved;
}

export function startSaveSync(): () => void {
  const unsubscribe = gameStore.subscribe((state, previous) => {
    if (state.character === previous.character && state.areaId === previous.areaId &&
      state.playerPosition === previous.playerPosition && state.quest === previous.quest &&
      state.inventory === previous.inventory && state.resourceReadyAt === previous.resourceReadyAt && state.benchRepaired === previous.benchRepaired) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(saveNow, 500);
  });
  const offRequested = eventBus.on('SAVE_REQUESTED', () => {
    eventBus.emit('SYNC_POSITION', {});
    saveNow();
  });
  const onHidden = () => {
    if (document.visibilityState === 'hidden') eventBus.emit('SAVE_REQUESTED', { reason: 'hidden' });
  };
  const onPageHide = () => eventBus.emit('SAVE_REQUESTED', { reason: 'pagehide' });
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', onPageHide);
  return () => {
    unsubscribe(); offRequested();
    document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('pagehide', onPageHide);
    if (timer) { clearTimeout(timer); timer = null; }
  };
}
