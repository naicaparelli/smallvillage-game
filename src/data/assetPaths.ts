import type { CharacterKind } from './characters';

export type Facing = 'front' | 'back' | 'left' | 'right';

const folders: Record<CharacterKind, string> = {
  rabbit: 'rabbit',
  kitten: 'cat',
  puppy: 'dog',
};

export const facings: Facing[] = ['front', 'back', 'left', 'right'];

export function characterTextureKey(kind: CharacterKind, facing: Facing, step: 0 | 1): string {
  return `${kind}-${facing}-${step}`;
}

export function characterAssetPath(kind: CharacterKind, facing: Facing, step: 0 | 1): string {
  const folder = folders[kind];
  const suffix = step === 1 ? '-step1' : '';
  return `/assets/characters/${folder}/${folder}-${facing}${suffix}.png`;
}

export const sceneAssets = {
  atelier: '/assets/atelier/atelier.png',
  floorEntry: '/assets/ground/floor-entry.png',
  bench: '/assets/items/bancada.png',
  windowClosed: '/assets/items/close-window.png',
  windowOpen: '/assets/items/open-window.png',
  photo: '/assets/items/photo.png',
  box1: '/assets/items/boxes/box-1.png',
  box2: '/assets/items/boxes/box-2.png',
  box3: '/assets/items/boxes/box-3.png',
  web1: '/assets/items/webs/web-1.png',
  web2: '/assets/items/webs/web-2.png',
  web3: '/assets/items/webs/web-3.png',
} as const;

export function objectTextureKey(id: string): keyof typeof sceneAssets | null {
  if (id.startsWith('box_')) return `box${(Number(id.slice(-2)) - 1) % 3 + 1}` as keyof typeof sceneAssets;
  if (id.startsWith('cobweb_')) return `web${Number(id.slice(-2))}` as keyof typeof sceneAssets;
  if (id === 'atelier_window_main') return 'windowClosed';
  if (id === 'atelier_old_photo') return 'photo';
  return null;
}
