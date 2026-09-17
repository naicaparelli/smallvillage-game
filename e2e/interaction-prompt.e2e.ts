import { expect, test } from '@playwright/test';

const save = {
  version: 1,
  updatedAt: new Date().toISOString(),
  character: 'rabbit',
  areaId: 'atelier-exterior',
  playerPosition: { x: 1100, y: 800 },
  quest: { cleanedObjectIds: [], windowOpen: false, photoFound: false, completed: false },
};

test('mostra E e a acao acima da porta e permite tocar no celular', async ({ browser, page }) => {
  await page.addInitScript((data) => localStorage.setItem('little-enchantments:save:v1', JSON.stringify(data)), save);
  await page.goto('/');
  const prompt = page.getByRole('button', { name: 'Entrar no ateliê' });
  await expect(prompt.locator('.action-key')).toHaveText('E');
  await expect(prompt.locator('.action-label')).toHaveText('Entrar');
  const box = await prompt.boundingBox();
  if (!box) throw new Error('Indicador da porta ausente');
  expect(box.x + box.width / 2).toBeGreaterThan(400);
  expect(box.x + box.width / 2).toBeLessThan(560);
  expect(box.y + box.height / 2).toBeLessThan(400);

  const context = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 960, height: 540 } });
  try {
    const mobilePage = await context.newPage();
    await mobilePage.addInitScript((data) => localStorage.setItem('little-enchantments:save:v1', JSON.stringify(data)), save);
    await mobilePage.goto('/');
    const mobilePrompt = mobilePage.getByRole('button', { name: 'Entrar no ateliê' });
    await expect(mobilePrompt.locator('.action-key')).toHaveText('E');
    await expect(mobilePrompt.locator('.action-label')).toHaveText('Entrar');
    await mobilePrompt.click();
    await expect(mobilePage.getByText('Todo grande recomeço precisa de um pequeno primeiro passo.')).toBeVisible();
  } finally {
    await context.close();
  }
});
