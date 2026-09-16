import { expect, test } from '@playwright/test';

const completedQuest = {
  cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'],
  windowOpen: true, photoFound: true, completed: true,
};
const initialQuest = { cleanedObjectIds: [], windowOpen: false, photoFound: false, completed: false };

function seedOnce(page: import('@playwright/test').Page, state: Record<string, unknown>) {
  return page.addInitScript((save) => {
    if (sessionStorage.getItem('crafting-seeded')) return;
    sessionStorage.setItem('crafting-seeded', 'yes');
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify(save));
  }, state);
}

test('coleta madeira antes da primeira missão e preserva o temporizador', async ({ page }) => {
  await seedOnce(page, {
    version: 1, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-exterior',
    playerPosition: { x: 930, y: 870 }, quest: initialQuest,
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Coletar madeira' })).toBeVisible();
  await page.getByRole('button', { name: 'Coletar madeira' }).click();
  await expect(page.locator('.collection-toast')).toHaveText('1 madeira');
  await expect(page.getByRole('list', { name: 'Inventário' }).getByRole('listitem')).toHaveCount(6);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(750);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(750);
  await page.keyboard.up('ArrowDown');
  await expect(page.getByRole('button', { name: 'Coletar madeira' })).toBeVisible();
  await page.getByRole('button', { name: 'Coletar madeira' }).click();
  await expect(page.locator('.collection-toast')).toHaveText('2 madeira');
  await expect(page.locator('.collection-toast')).toBeHidden({ timeout: 6000 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Coletar madeira' })).toBeHidden();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('dialog')).toContainText('Materiais: madeira 2');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(saved.version).toBe(4);
  expect(saved.resourceReadyAt['wood-0']).toBeGreaterThan(Date.now());
});

test('madeira reaparece no mesmo ponto após o tempo terminar', async ({ page }) => {
  await seedOnce(page, {
    version: 3, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-exterior',
    playerPosition: { x: 930, y: 870 }, quest: initialQuest,
    inventory: { wood: 1, stone: 0, chair: 0 }, collectedResourceIds: [],
    woodReadyAt: { 'wood-0': Date.now() + 5000 }, benchRepaired: false,
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Coletar madeira' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Coletar madeira' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Coletar madeira' }).click();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('dialog')).toContainText('Materiais: madeira 2');
});

test('repara bancada, fabrica cadeira e salva o resultado', async ({ page }) => {
  await seedOnce(page, {
    version: 2, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-interior',
    playerPosition: { x: 820, y: 730 }, quest: completedQuest,
    inventory: { wood: 5, stone: 3, chair: 0 },
    collectedResourceIds: ['wood-0', 'wood-1', 'wood-2', 'wood-3', 'wood-4', 'stone-0', 'stone-1', 'stone-2'],
    benchRepaired: false,
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Usar bancada' })).toBeVisible();
  await page.getByRole('button', { name: 'Usar bancada' }).click();
  await expect(page.getByText('Bancada reparada! Agora você pode criar uma cadeira.')).toBeVisible();
  await page.keyboard.press('e');
  await page.getByRole('button', { name: 'Usar bancada' }).click();
  await expect(page.getByText('Cadeira criada! Veja seu inventário no Caderno dos Encantos.')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('dialog')).toContainText('Cadeira: 1');
  await expect(page.getByRole('dialog')).toContainText('Bancada: reparada');
});