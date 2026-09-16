import { expect, test } from '@playwright/test';

type AudioWindow = Window & { audioPlays: string[] };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const audioWindow = window as AudioWindow;
    audioWindow.audioPlays = [];
    HTMLMediaElement.prototype.play = function () {
      audioWindow.audioPlays.push(new URL(this.src).pathname);
      return Promise.resolve();
    };
  });
});

test('música inicia após escolher personagem e controle salva preferência', async ({ page, request }) => {
  const files = [
    'music/magic-puzzle.mp3', 'sfx/door-open.ogg', 'sfx/box-remove.ogg',
    'sfx/web-clean.ogg', 'sfx/window-open.ogg', 'sfx/photo-discover.ogg',
    'sfx/step-outside-1.ogg', 'sfx/step-outside-2.ogg',
    'sfx/step-inside-1.ogg', 'sfx/step-inside-2.ogg',
  ];
  for (const file of files) {
    const response = await request.get('/assets/audio/' + file);
    expect(response.ok(), file).toBe(true);
    const signature = (await response.body()).subarray(0, 4).toString('ascii');
    if (file.endsWith('.ogg')) expect(signature, file).toBe('OggS');
    else expect(signature.startsWith('ID3'), file).toBe(true);
  }
  await page.goto('/');
  const durations = await page.evaluate(async (mediaFiles) => Promise.all(mediaFiles.map((file) =>
    new Promise<number>((resolve, reject) => {
      const audio = new Audio('/assets/audio/' + file);
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.onerror = () => reject(new Error('Falha ao carregar ' + file));
      audio.load();
    }))), files);
  for (const duration of durations) expect(duration).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Coelhinho' }).click();
  const plays = await page.evaluate(() => (window as AudioWindow).audioPlays);
  expect(plays).toContain('/assets/audio/music/magic-puzzle.mp3');
  await page.getByRole('button', { name: 'Desativar áudio' }).click();
  await page.addInitScript(() => {
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 1, updatedAt: new Date().toISOString(), character: 'rabbit',
      areaId: 'atelier-interior', playerPosition: { x: 390, y: 390 },
      quest: { cleanedObjectIds: ['box_02'], windowOpen: false, photoFound: false, completed: false },
    }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Ativar áudio' })).toBeVisible();
  await page.getByRole('button', { name: 'Retirar caixa' }).click();
  const mutedPlays = await page.evaluate(() => (window as AudioWindow).audioPlays);
  expect(mutedPlays).not.toContain('/assets/audio/sfx/box-remove.ogg');
  await page.getByRole('button', { name: 'Ativar áudio' }).click();
  const resumed = await page.evaluate(() => (window as AudioWindow).audioPlays);
  expect(resumed).toContain('/assets/audio/music/magic-puzzle.mp3');
});

test('ações e movimento usam efeitos correspondentes', async ({ page }) => {
  await page.addInitScript(() => {
    const seed = localStorage.getItem('__audio_case');
    if (seed) localStorage.setItem('little-enchantments:save:v1', seed);
  });
  const cases = [
    { label: 'Entrar no ateliê', file: 'door-open.ogg', areaId: 'atelier-exterior', x: 1100, y: 820, windowOpen: false },
    { label: 'Retirar caixa', file: 'box-remove.ogg', areaId: 'atelier-interior', x: 390, y: 390, windowOpen: false },
    { label: 'Limpar teia', file: 'web-clean.ogg', areaId: 'atelier-interior', x: 280, y: 300, windowOpen: false },
    { label: 'Abrir janela', file: 'window-open.ogg', areaId: 'atelier-interior', x: 700, y: 240, windowOpen: false },
    { label: 'Examinar fotografia', file: 'photo-discover.ogg', areaId: 'atelier-interior', x: 780, y: 260, windowOpen: true },
  ] as const;
  await page.goto('/');
  for (const item of cases) {
    await page.evaluate((entry) => {
      localStorage.setItem('__audio_case', JSON.stringify({
        version: 1, updatedAt: new Date().toISOString(), character: 'rabbit',
        areaId: entry.areaId, playerPosition: { x: entry.x, y: entry.y },
        quest: { cleanedObjectIds: ['box_02'], windowOpen: entry.windowOpen, photoFound: false, completed: false },
      }));
    }, item);
    await page.reload();
    await page.getByRole('button', { name: item.label }).click();
    const plays = await page.evaluate(() => (window as AudioWindow).audioPlays);
    expect(plays, item.label).toContain('/assets/audio/sfx/' + item.file);
  }

  for (const [areaId, file, position] of [
    ['atelier-exterior', 'step-outside-1.ogg', { x: 1100, y: 860 }],
    ['atelier-interior', 'step-inside-1.ogg', { x: 700, y: 700 }],
  ] as const) {
    await page.evaluate((entry) => {
      localStorage.setItem('__audio_case', JSON.stringify({
        version: 1, updatedAt: new Date().toISOString(), character: 'rabbit',
        areaId: entry.areaId, playerPosition: entry.position,
        quest: { cleanedObjectIds: ['box_02'], windowOpen: false, photoFound: false, completed: false },
      }));
    }, { areaId, position });
    await page.reload();
    await expect(page.locator('main[data-ready=true]')).toBeVisible({ timeout: 30_000 });
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(450);
    await page.keyboard.up('ArrowLeft');
    const plays = await page.evaluate(() => (window as AudioWindow).audioPlays);
    expect(plays, areaId).toContain('/assets/audio/sfx/' + file);
  }
});
