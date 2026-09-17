import { expect, test } from '@playwright/test';

test('coleta pedra antes da primeira missao e mantem bancada bloqueada', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      character: 'rabbit',
      areaId: 'atelier-exterior',
      playerPosition: { x: 880, y: 750 },
      quest: { cleanedObjectIds: [], windowOpen: false, photoFound: false, completed: false },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Coletar pedra' }).click();
  await expect(page.getByRole('listitem', { name: 'Pedra: 1' })).toBeVisible();
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(save.resourceReadyAt['stone-0']).toBeGreaterThan(Date.now());
  expect(save.benchRepaired).toBe(false);
});
