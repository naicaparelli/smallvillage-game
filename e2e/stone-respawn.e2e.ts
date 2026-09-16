import { expect, test } from '@playwright/test';

const completedQuest = {
  cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'],
  windowOpen: true, photoFound: true, completed: true,
};

function seedOnce(page: import('@playwright/test').Page, save: Record<string, unknown>) {
  return page.addInitScript((data) => {
    if (sessionStorage.getItem('stone-seeded')) return;
    sessionStorage.setItem('stone-seeded', 'yes');
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify(data));
  }, save);
}

test('pedra permanece no ponto com temporizador após coleta e recarga', async ({ page }) => {
  await seedOnce(page, {
    version: 3, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-exterior',
    playerPosition: { x: 880, y: 750 }, quest: completedQuest,
    inventory: { wood: 0, stone: 0, chair: 0 }, collectedResourceIds: [], woodReadyAt: {}, benchRepaired: false,
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Coletar pedra' })).toBeVisible();
  await page.getByRole('button', { name: 'Coletar pedra' }).click();
  await expect(page.locator('.collection-toast')).toHaveText('1 pedra');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Coletar pedra' })).toBeHidden();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(save.version).toBe(4);
  expect(save.resourceReadyAt['stone-0']).toBeGreaterThan(Date.now());
});

test('pedra reaparece no mesmo ponto ao terminar o temporizador', async ({ page }) => {
  await seedOnce(page, {
    version: 4, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-exterior',
    playerPosition: { x: 880, y: 750 }, quest: completedQuest,
    inventory: { wood: 0, stone: 1, chair: 0 }, resourceReadyAt: { 'stone-0': Date.now() + 5000 }, benchRepaired: false,
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Coletar pedra' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Coletar pedra' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Coletar pedra' }).click();
  await expect(page.getByRole('listitem', { name: 'Pedra: 2' })).toBeVisible();
});
