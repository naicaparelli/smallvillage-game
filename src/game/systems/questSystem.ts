import { firstQuest } from '../../data/quests';
import { gameStore } from '../../state/gameStore';
import { eventBus } from '../events/EventBus';
import { advanceQuest, type QuestEvent } from './questProgress';

export function startQuestSystem(): () => void {
  function apply(event: QuestEvent): void {
    const before = gameStore.getState().quest;
    const after = advanceQuest(before, event);
    if (after === before) return;
    gameStore.getState().setQuest(after);
    eventBus.emit('QUEST_UPDATED', { questId: firstQuest.id });
    if (after.completed && !before.completed) {
      eventBus.emit('NOTICE', { text: firstQuest.completedText });
      eventBus.emit('SAVE_REQUESTED', { reason: 'quest-completed' });
    }
  }

  const offCleaned = eventBus.on('OBJECT_CLEANED', ({ objectId, objectType }) => {
    if (objectType === 'box' || objectType === 'cobweb') apply({ type: 'cleaned', objectId, objectType });
  });
  const offWindow = eventBus.on('WINDOW_OPENED', () => apply({ type: 'windowOpened' }));
  const offPhoto = eventBus.on('PHOTO_FOUND', () => apply({ type: 'photoFound' }));
  return () => { offCleaned(); offWindow(); offPhoto(); };
}
