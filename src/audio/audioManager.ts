const AUDIO_KEY = 'little-enchantments:audio-enabled:v1';
const MUSIC_PATH = '/assets/audio/music/magic-puzzle.mp3';

const effects = {
  door: '/assets/audio/sfx/door-open.ogg',
  box: '/assets/audio/sfx/box-remove.ogg',
  web: '/assets/audio/sfx/web-clean.ogg',
  window: '/assets/audio/sfx/window-open.ogg',
  photo: '/assets/audio/sfx/photo-discover.ogg',
  stepOutside1: '/assets/audio/sfx/step-outside-1.ogg',
  stepOutside2: '/assets/audio/sfx/step-outside-2.ogg',
  stepInside1: '/assets/audio/sfx/step-inside-1.ogg',
  stepInside2: '/assets/audio/sfx/step-inside-2.ogg',
} as const;

export type EffectName = keyof typeof effects;

function storedEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try { return window.localStorage.getItem(AUDIO_KEY) !== 'false'; }
  catch { return true; }
}

let enabled = storedEnabled();
let music: HTMLAudioElement | null = null;
const sounds = new Map<EffectName, HTMLAudioElement>();

export function isAudioEnabled(): boolean { return enabled; }

export function startMusic(): void {
  if (!enabled) return;
  if (!music) {
    music = new Audio(MUSIC_PATH);
    music.loop = true;
    music.volume = 0.24;
    music.preload = 'auto';
  }
  if (music.paused) void music.play().catch(() => {});
}

export function pauseMusic(): void { music?.pause(); }

export function setAudioEnabled(value: boolean): void {
  enabled = value;
  try { window.localStorage.setItem(AUDIO_KEY, String(value)); }
  catch { /* audio still works without storage */ }
  if (value) startMusic();
  else pauseMusic();
}

export function playEffect(name: EffectName): void {
  if (!enabled) return;
  let sound = sounds.get(name);
  if (!sound) {
    sound = new Audio(effects[name]);
    sound.volume = name.startsWith('step') ? 0.3 : 0.55;
    sound.preload = 'auto';
    sounds.set(name, sound);
  }
  sound.currentTime = 0;
  void sound.play().catch(() => {});
}
