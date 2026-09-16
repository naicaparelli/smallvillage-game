import { expect, test } from '@playwright/test';

test('personagem sai do lugar da fotografia após abrir a janela', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    character: 'rabbit',
    areaId: 'atelier-interior',
    playerPosition: { x: 780, y: 190 },
    quest: { cleanedObjectIds: [], windowOpen: false, photoFound: false, completed: false },
  })));
  await page.goto('/');
  await expect(page.getByText('Todo grande recomeço precisa de um pequeno primeiro passo.')).toBeVisible();
  await page.keyboard.press('e');
  await expect(page.getByRole('button', { name: 'Abrir janela' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir janela' }).click();
  await expect(page.getByRole('button', { name: 'Examinar fotografia' })).toBeVisible();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(700);
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(save.playerPosition.x).toBeGreaterThan(820);
  expect(save.quest.windowOpen).toBe(true);
});
