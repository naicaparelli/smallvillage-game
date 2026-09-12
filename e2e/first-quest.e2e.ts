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
  await page.getByRole('button', { name: 'Mostrar missões' }).click();
  await expect(page.getByText('Retirar caixas: 1/5')).toBeVisible();

  await page.reload();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByLabel('1 missões pendentes')).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar missões' }).click();
  await expect(page.getByText('Missões', { exact: true })).toBeVisible();
  await expect(page.getByText('Retirar caixas: 1/5')).toBeVisible();
  await page.getByRole('button', { name: 'Ocultar missões' }).click();
  await expect(page.getByText('Missões', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Mostrar missões' }).click();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
  await expect(page.getByRole('dialog')).toContainText('Retirar caixas: 1/5');
});

test('novo jogo apaga o save somente após confirmação', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Gatinho' }).click();
  await page.getByRole('button', { name: 'Mostrar missões' }).click();
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
