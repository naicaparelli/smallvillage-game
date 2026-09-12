import { areas } from '../../data/areas';

export type QuestProgress = {
  cleanedObjectIds: string[];
  windowOpen: boolean;
  photoFound: boolean;
  completed: boolean;
};

export type QuestEvent =
  | { type: 'cleaned'; objectId: string; objectType: 'box' | 'cobweb' }
  | { type: 'windowOpened' }
  | { type: 'photoFound' };

export const initialQuestProgress: QuestProgress = {
  cleanedObjectIds: [], windowOpen: false, photoFound: false, completed: false,
};

const cleanableObjects = new Map(
  areas['atelier-interior'].objects
    .filter((object) => object.kind === 'box' || object.kind === 'cobweb')
    .map((object) => [object.id, object.kind]),
);

export function advanceQuest(progress: QuestProgress, event: QuestEvent): QuestProgress {
  let next = progress;
  if (event.type === 'cleaned') {
    if (cleanableObjects.get(event.objectId) !== event.objectType || progress.cleanedObjectIds.includes(event.objectId)) return progress;
    next = { ...progress, cleanedObjectIds: [...progress.cleanedObjectIds, event.objectId] };
  } else if (event.type === 'windowOpened') {
    if (progress.windowOpen) return progress;
    next = { ...progress, windowOpen: true };
  } else {
    if (!progress.windowOpen || progress.photoFound) return progress;
    next = { ...progress, photoFound: true };
  }
  const boxes = next.cleanedObjectIds.filter((id) => id.startsWith('box_')).length;
  const cobwebs = next.cleanedObjectIds.filter((id) => id.startsWith('cobweb_')).length;
  return { ...next, completed: boxes === 5 && cobwebs === 3 && next.windowOpen && next.photoFound };
}

export function questObjectives(progress: QuestProgress) {
  return [
    { label: 'Retirar caixas', current: progress.cleanedObjectIds.filter((id) => id.startsWith('box_')).length, total: 5 },
    { label: 'Limpar teias', current: progress.cleanedObjectIds.filter((id) => id.startsWith('cobweb_')).length, total: 3 },
    { label: 'Abrir a janela', current: Number(progress.windowOpen), total: 1 },
    { label: 'Encontrar a fotografia', current: Number(progress.photoFound), total: 1 },
  ];
}
