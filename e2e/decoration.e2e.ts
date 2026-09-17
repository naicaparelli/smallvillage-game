import { expect, test } from '@playwright/test';

const quest = {
  cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'],
  windowOpen: true, photoFound: true, completed: true,
};

async function editChair(page: import('@playwright/test').Page) {
  const prompt = page.getByRole('button', { name: 'Editar cadeira' });
  if (!(await prompt.isVisible())) {
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(350);
    await page.keyboard.up('ArrowUp');
  }
  await expect(prompt).toBeVisible();
  await page.keyboard.down('e');
  await page.waitForTimeout(100);
  await page.keyboard.up('e');
}

test('posiciona, move e guarda a cadeira com save persistente', async ({ page }) => {
  await page.addInitScript((state) => {
    if (sessionStorage.getItem('decoration-seeded')) return;
    sessionStorage.setItem('decoration-seeded', 'yes');
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify(state));
  }, {
    version: 5, updatedAt: new Date().toISOString(), character: 'rabbit', areaId: 'atelier-interior',
    playerPosition: { x: 820, y: 730 }, quest,
    inventory: { wood: 0, stone: 0, chair: 1 }, resourceReadyAt: {}, benchRepaired: true, placedChair: null,
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Posicionar cadeira' }).click();
  await expect(page.getByRole('group', { name: 'Posicionar cadeira' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar' })).toBeEnabled();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByRole('button', { name: 'Editar cadeira' })).toBeVisible();
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(saved.inventory.chair).toBe(0);
  expect(saved.placedChair).toBeTruthy();
  const first = saved.placedChair;
  await page.reload();
  await editChair(page);
  await expect(page.getByRole('group', { name: 'Posicionar cadeira' })).toBeVisible();
  await page.getByRole('button', { name: 'Mover para esquerda' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(saved.placedChair.x).toBe(first.x - 40);
  await editChair(page);
  await page.getByRole('button', { name: 'Guardar' }).click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('little-enchantments:save:v1') || '{}'));
  expect(saved.placedChair).toBeNull();
  expect(saved.inventory.chair).toBe(1);
});
