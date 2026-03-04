import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE PEDIDOS
// =============================================
test.describe('Página de Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos');
  });

  test('debe mostrar el navbar con el logo Open Market', async ({ page }) => {
    const omNavbar = page.locator('header').getByText('Open Market');
    await expect(omNavbar).toBeVisible();
  });

  test('debe mostrar la barra de categorías', async ({ page }) => {
    await expect(page.locator('a', { hasText: 'Tecnología' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Moda' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Coleccionables y Arte' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Hogar y Jardín' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Salud y Belleza' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Entretenimiento' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Deportes' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Equipo Industrial' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Ofertas!!' })).toBeVisible();
  });

  test('debe mostrar el título Mis Pedidos', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Mis Pedidos' })
    ).toBeVisible();
  });

  test('debe mostrar el sidebar de perfil del cliente', async ({ page }) => {
    // SidebarClientProfile renderizado junto a la lista
    const sidebar = page.locator('.w-80').first();
    await expect(sidebar).toBeVisible();
  });

  test('debe mostrar los pedidos ORD', async ({ page }) => {
    await expect(page.getByText('ORD-2024-001543')).toBeVisible();
    await expect(page.getByText('ORD-2024-001502')).toBeVisible();
    await expect(page.getByText('ORD-2024-001489')).toBeVisible();
  });

  test('debe mostrar los estados', async ({ page }) => {
    await expect(page.locator('span', { hasText: 'Pendiente' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Procesando' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Enviado' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Entregado' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Cancelado' }).first()).toBeVisible();
  });

  test('debe mostrar el total del primer pedido', async ({ page }) => {
    await expect(page.getByText('Gs. ').first()).toBeVisible();
  });

  test('debe mostrar la fecha del primer pedido', async ({ page }) => {
    await expect(page.getByText(/15 de junio del 2024/i)).toBeVisible();
  });

  test('debe mostrar la cantidad de ítems del primer pedido', async ({ page }) => {
    await expect(page.getByText('4 producto(s)')).toBeVisible();
  });
});