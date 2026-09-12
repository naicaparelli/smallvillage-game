import { expect, test } from '@playwright/test';

async function holdKey(page: import('@playwright/test').Page, key: string, ms: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

test('mantém personagem, área e objeto limpo após recarregar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Coelhinho' }).click();
  await expect(page.locator('canvas')).toBeVisible();

  await holdKey(page, 'ArrowUp', 700);
  await holdKey(page, 'e', 100);
  await expect(page.getByText('Todo grande recomeço precisa de um pequeno primeiro passo.')).toBeVisible();

  await holdKey(page, 'ArrowLeft', 3200);
  await expect(page.getByRole('button', { name: 'Retirar caixa' })).toBeVisible();
  await holdKey(page, 'e', 100);
  await expect(page.getByText('Retirar caixas: 1/5')).toBeVisible();

  await page.reload();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('Retirar caixas: 1/5')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir Caderno dos Encantos' }).click();
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
