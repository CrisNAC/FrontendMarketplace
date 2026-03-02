import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE MI COMERCIO
// =============================================
test.describe('Página de Mi Comercio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comercio');
  });

  test('debe mostrar el sidebar Mi Comercio', async ({ page }) => {
    await expect(page.getByText('Mi Comercio').first()).toBeVisible();
  });

  test('debe mostrar los ítems de navegación del sidebar', async ({ page }) => {
    await expect(page.locator('span', { hasText: 'Productos' })).toBeVisible();
    await expect(page.locator('span', { hasText: /Colecciones/ })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Delivery' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Perfil' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Cerrar Sesion' })).toBeVisible();
  });

  test('debe mostrar el dashboard title', async ({ page }) => {
    await expect(page.getByText('Dashboard - Mi Comercio')).toBeVisible();
  });

  test('debe mostrar las tarjetas de estadísticas', async ({ page }) => {
    await expect(page.getByText('Productos Activos')).toBeVisible();
    await expect(page.getByText('Calificación Promedio')).toBeVisible();
    await expect(page.getByText('Total Reseñas')).toBeVisible();
    await expect(page.getByText('Colecciones Activas')).toBeVisible();
  });

  test('debe mostrar la sección Mejor Valorados', async ({ page }) => {
    await expect(page.getByText(/Mejor Valorados/)).toBeVisible();
  });

  test('debe mostrar la sección Más Vendidos', async ({ page }) => {
    await expect(page.getByText('Más Vendidos')).toBeVisible();
  });

  test('debe mostrar los productos más vendidos', async ({ page }) => {
    await expect(page.getByText('Lámpara de Escritorio LED')).toBeVisible();
  });

  test('debe mostrar la sección de Colecciones', async ({ page }) => {
    await expect(page.getByText('Tus Colecciones')).toBeVisible();
    await expect(page.getByText('Lo Más Vendido')).toBeVisible();
    await expect(page.getByText('Nuevos Productos')).toBeVisible();
  });

  test('debe mostrar el botón Nuevo Producto', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Nuevo Producto/i })
    ).toBeVisible();
  });

  test('debe mostrar la caja de ayuda en el sidebar', async ({ page }) => {
    await expect(page.getByText(/Necesitas ayuda/i)).toBeVisible();
  });
});