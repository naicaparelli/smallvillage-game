import { describe, expect, it } from 'vitest';
import { advanceQuest, initialQuestProgress, questObjectives } from './questProgress';

describe('primeira missão', () => {
  it('conta cada objeto uma vez e ignora IDs desconhecidos', () => {
    const once = advanceQuest(initialQuestProgress, { type: 'cleaned', objectId: 'box_01', objectType: 'box' });
    expect(questObjectives(once)[0].current).toBe(1);
    expect(advanceQuest(once, { type: 'cleaned', objectId: 'box_01', objectType: 'box' })).toBe(once);
    expect(advanceQuest(once, { type: 'cleaned', objectId: 'fake', objectType: 'box' })).toBe(once);
  });

  it('só encontra a foto após abrir a janela e conclui uma única vez', () => {
    expect(advanceQuest(initialQuestProgress, { type: 'photoFound' })).toBe(initialQuestProgress);
    let progress = initialQuestProgress;
    for (let i = 1; i <= 5; i++) progress = advanceQuest(progress, { type: 'cleaned', objectId: `box_0${i}`, objectType: 'box' });
    for (let i = 1; i <= 3; i++) progress = advanceQuest(progress, { type: 'cleaned', objectId: `cobweb_0${i}`, objectType: 'cobweb' });
    progress = advanceQuest(progress, { type: 'windowOpened' });
    expect(progress.completed).toBe(false);
    progress = advanceQuest(progress, { type: 'photoFound' });
    expect(progress.completed).toBe(true);
    expect(advanceQuest(progress, { type: 'photoFound' })).toBe(progress);
  });
});
