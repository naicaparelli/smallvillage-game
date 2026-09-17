import { expect, test } from '@playwright/test';

test('tocar na cadeira abre a edicao no celular', async ({ browser }) => {
  const context = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 960, height: 540 } });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
        version: 5,
        updatedAt: new Date().toISOString(),
        character: 'rabbit',
        areaId: 'atelier-interior',
        playerPosition: { x: 820, y: 730 },
        quest: {
          cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'],
          windowOpen: true, photoFound: true, completed: true,
        },
        inventory: { wood: 0, stone: 0, chair: 0 },
        resourceReadyAt: {},
        benchRepaired: true,
        placedChair: { x: 720, y: 600 },
      }));
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Editar cadeira' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Usar bancada' })).toBeVisible();
    await page.waitForTimeout(300);
    await page.locator('canvas').tap({ position: { x: 380, y: 222 } });
    await expect(page.getByRole('group', { name: 'Posicionar cadeira' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('group', { name: 'Posicionar cadeira' })).toBeHidden();
  } finally {
    await context.close();
  }
});
