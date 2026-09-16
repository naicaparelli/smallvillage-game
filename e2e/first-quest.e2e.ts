import { expect, test } from '@playwright/test';

async function holdKey(page: import('@playwright/test').Page, key: string, ms: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

test('mantém personagem, área e objeto limpo após recarregar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Coelhinho' }).click();
  await expect(page.locator('main[data-ready=true]')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('canvas')).toBeVisible();

  await page.keyboard.down('ArrowUp');
  await expect(page.getByRole('button', { name: 'Entrar no ateliê' })).toBeVisible({ timeout: 20_000 });
  await page.keyboard.up('ArrowUp');
  await holdKey(page, 'e', 100);
  await expect(page.getByText('Todo grande recomeço precisa de um pequeno primeiro passo.')).toBeVisible();
  await holdKey(page, 'e', 100);
  await expect(page.getByText('Todo grande recomeço precisa de um pequeno primeiro passo.')).toBeHidden();

  await page.keyboard.down('ArrowLeft');
  await expect(page.getByRole('button', { name: 'Retirar caixa' })).toBeVisible({ timeout: 20_000 });
  await page.keyboard.up('ArrowLeft');
  await holdKey(page, 'e', 100);
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#mission-details')).toBeHidden();
  await page.getByRole('button', { name: 'Um recomeço empoeirado' }).click();
  await expect(page.getByText('Retirar caixas: 1/5').first()).toBeVisible();
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.reload();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByLabel('1 missões pendentes')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Um recomeço empoeirado' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Um recomeço empoeirado' }).click();
  await expect(page.getByRole('dialog')).toContainText('Retirar caixas: 1/5');
});

test('novo jogo apaga o save somente após confirmação', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Gatinho' }).click();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Novo jogo' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Novo jogo' }).click();
  await expect(page.getByRole('button', { name: 'Coelhinho' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Gatinho' })).toBeVisible();
});

test('mostra X para fechar somente no mobile', async ({ browser, page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Coelhinho' }).click();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('button', { name: 'Fechar caderno' })).toBeHidden();
  await expect(page.locator('.journal-shortcut')).toBeVisible();

  const mobileContext = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 960, height: 540 },
  });
  try {
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/');
    await mobilePage.getByRole('button', { name: 'Gatinho' }).click();
    await mobilePage.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
    await expect(mobilePage.getByRole('button', { name: 'Fechar caderno' })).toBeVisible();
    await expect(mobilePage.locator('.journal-shortcut')).toBeHidden();
    await mobilePage.getByRole('button', { name: 'Fechar caderno' }).click();
    await expect(mobilePage.getByRole('dialog')).toBeHidden();
  } finally {
    await mobileContext.close();
  }
});

test('personagem para diante da bancada no interior', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      character: 'rabbit',
      areaId: 'atelier-interior',
      playerPosition: { x: 820, y: 730 },
      quest: { cleanedObjectIds: ['box_01'], windowOpen: false, photoFound: false, completed: false },
    }));
  });
  await page.goto('/');
  await expect(page.locator('main[data-ready=true]')).toBeVisible({ timeout: 30_000 });
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(1800);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(700);
  const position = await page.evaluate(() => {
    const raw = localStorage.getItem('little-enchantments:save:v1');
    return raw ? JSON.parse(raw).playerPosition : null;
  });
  expect(position).not.toBeNull();
  expect(position.x).toBeGreaterThan(820);
  expect(position.x).toBeLessThanOrEqual(846);
});

test('mostra a fotografia ampliada acima da mensagem ao encontrá-la', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      character: 'rabbit',
      areaId: 'atelier-interior',
      playerPosition: { x: 780, y: 260 },
      quest: { cleanedObjectIds: [], windowOpen: true, photoFound: false, completed: false },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Examinar fotografia' }).click();
  const photo = page.locator('.notice-photo');
  const message = page.locator('.notice > span');
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute('src', '/assets/items/photo.png');
  await expect(message).toContainText('Uma fotografia antiga');
  const photoBox = await photo.boundingBox();
  const messageBox = await message.boundingBox();
  if (!photoBox || !messageBox) throw new Error('A fotografia e a mensagem precisam estar visíveis');
  expect(photoBox.width).toBeGreaterThan(64);
  expect(photoBox.y + photoBox.height).toBeLessThanOrEqual(messageBox.y);
  await page.keyboard.press('e');
  await expect(photo).toBeHidden();
});


test('mantém a foto visível quando encontrá-la conclui a missão', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('little-enchantments:save:v1', JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      character: 'rabbit',
      areaId: 'atelier-interior',
      playerPosition: { x: 780, y: 260 },
      quest: {
        cleanedObjectIds: ['box_01', 'box_02', 'box_03', 'box_04', 'box_05', 'cobweb_01', 'cobweb_02', 'cobweb_03'],
        windowOpen: true, photoFound: false, completed: false,
      },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Examinar fotografia' }).click();
  await expect(page.locator('.notice-photo')).toBeVisible();
  await expect(page.locator('.notice > span')).toContainText('Uma fotografia antiga');
  await expect(page.locator('.notice > span')).toContainText('a vila nunca perderá completamente sua magia');
  await expect(page.getByLabel('0 missões pendentes')).toBeVisible();
  await page.setViewportSize({ width: 640, height: 360 });
  const photoBox = await page.locator('.notice-photo').boundingBox();
  const noticeBox = await page.locator('.notice').boundingBox();
  if (!photoBox || !noticeBox) throw new Error('A mensagem deve caber na tela horizontal');
  expect(photoBox.y).toBeGreaterThanOrEqual(0);
  expect(noticeBox.y + noticeBox.height).toBeLessThanOrEqual(360);
});
