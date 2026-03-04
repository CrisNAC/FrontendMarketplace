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
    await expect(page.getByText('Tecnología')).toBeVisible();
    await expect(page.getByText('Moda')).toBeVisible();
    await expect(page.getByText('Coleccionables y Arte')).toBeVisible();
    await expect(page.getByText('Hogar y Jardín')).toBeVisible();
    await expect(page.getByText('Salud y Belleza')).toBeVisible();
    await expect(page.getByText('Entretenimiento')).toBeVisible();
    await expect(page.getByText('Deportes')).toBeVisible();
    await expect(page.getByText('Equipo Industrial')).toBeVisible();
    await expect(page.getByText('Ofertas!!')).toBeVisible();
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

  test('debe mostrar el pedido ORD-2024-001543', async ({ page }) => {
    await expect(page.getByText('ORD-2024-001543')).toBeVisible();
  });

  test('debe mostrar el pedido ORD-2024-001502', async ({ page }) => {
    await expect(page.getByText('ORD-2024-001502')).toBeVisible();
  });

  test('debe mostrar el pedido ORD-2024-001489', async ({ page }) => {
    await expect(page.getByText('ORD-2024-001489')).toBeVisible();
  });

  test('debe mostrar el estado Entregado', async ({ page }) => {
    await expect(page.getByText('Entregado')).toBeVisible();
  });

  test('debe mostrar el estado Pendiente', async ({ page }) => {
    await expect(page.getByText('Pendiente')).toBeVisible();
  });

  test('debe mostrar el estado Cancelado', async ({ page }) => {
    await expect(page.getByText('Cancelado')).toBeVisible();
  });

  test('debe mostrar el total del primer pedido', async ({ page }) => {
    await expect(page.getByText('Gs. ')).toBeVisible();
  });

  test('debe mostrar la fecha del primer pedido', async ({ page }) => {
    await expect(page.getByText(/15 de junio del 2024/i)).toBeVisible();
  });

  test('debe mostrar la cantidad de ítems del primer pedido', async ({ page }) => {
    await expect(page.getByText(/4 producto(s)/i).first()).toBeVisible();
  });

  test('debe mostrar tres órdenes en total', async ({ page }) => {
    const orders = page.locator('[class*="order"], [class*="OrderCard"]');
    await expect(page.getByText('ORD-2024-001543')).toBeVisible();
    await expect(page.getByText('ORD-2024-001502')).toBeVisible();
    await expect(page.getByText('ORD-2024-001489')).toBeVisible();
  });
});