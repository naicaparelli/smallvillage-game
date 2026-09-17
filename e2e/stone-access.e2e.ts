import { expect, test } from '@playwright/test';

test('pedra fica acessivel depois de concluir a missao e sair do atelie', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      character: 'rabbit',
      areaId: 'atelier-interior',
      playerPosition: { x: 700, y: 790 },
      quest: {
        cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'],
        windowOpen: true,
        photoFound: true,
        completed: true,
      },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Sair do ateliê' }).click();
  await expect(page.getByRole('button', { name: 'Coletar pedra' })).toBeVisible();
  await page.getByRole('button', { name: 'Coletar pedra' }).click();
  await expect(page.getByRole('listitem', { name: 'Pedra: 1' })).toBeVisible();
});
