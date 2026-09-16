import { expect, test } from '@playwright/test';

test('mostra seis espaços, imagens e quantidades sem cobrir o joystick mobile', async ({ browser }) => {
  const context = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 640, height: 360 } });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 3, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-exterior',
      playerPosition: { x: 1100, y: 860 },
      quest: { cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'], windowOpen: true, photoFound: true, completed: true },
      inventory: { wood: 4, stone: 2, chair: 1 }, collectedResourceIds: ['stone-0', 'stone-1'],
      woodReadyAt: {}, benchRepaired: true,
    })));
    await page.goto('/');
    const slots = page.getByRole('list', { name: 'Inventário' }).getByRole('listitem');
    await expect(slots).toHaveCount(6);
    await expect(slots.nth(0)).toHaveAttribute('aria-label', 'Madeira: 4');
    await expect(slots.nth(1)).toHaveAttribute('aria-label', 'Pedra: 2');
    await expect(slots.nth(2)).toHaveAttribute('aria-label', 'Cadeira: 1');
    await expect(slots.locator('img')).toHaveCount(3);
    await expect(slots.nth(0).locator('.inventory-count')).toHaveText('4');
    const bar = await page.locator('.inventory-bar').boundingBox();
    const joystick = await page.locator('.joystick').boundingBox();
    const count = await slots.nth(0).locator('.inventory-count').boundingBox();
    const first = await slots.nth(0).boundingBox();
    if (!bar || !joystick || !count || !first) throw new Error('Inventário e joystick precisam estar visíveis');
    expect(bar.y).toBeGreaterThan(280);
    expect(joystick.y + joystick.height).toBeLessThan(bar.y);
    expect(count.x + count.width).toBeGreaterThan(first.x + first.width / 2);
    expect(count.y + count.height).toBeGreaterThan(first.y + first.height / 2);
  } finally {
    await context.close();
  }
});
