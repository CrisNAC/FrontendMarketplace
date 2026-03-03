import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE BUSQUEDA (/busqueda)
// =============================================
test.describe('Página de Búsqueda', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/busqueda');
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

  test('debe mostrar el título de resultado de búsqueda', async ({ page }) => {
    await expect(page.getByText(/Resultado de Búsqueda para:/i)).toBeVisible();
  });

  test('debe mostrar el sidebar de filtros', async ({ page }) => {
    await expect(page.getByText(/Filtrar por/i)).toBeVisible();
  });

  test('debe mostrar el filtro de precio en el sidebar', async ({ page }) => {
    await expect(page.getByText(/Precio/i).first()).toBeVisible();
  });

  test('debe mostrar los precios de los productos', async ({ page }) => {
    await expect(page.getByText('Gs. ')).toBeVisible();
  });

  test('debe mostrar imágenes de los productos', async ({ page }) => {
    const productImages = page.locator('img[alt]');
    await expect(productImages.first()).toBeVisible();
  });

  test('debe mostrar la paginación', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('debe cambiar de página al hacer click en página 2', async ({ page }) => {
    await page.getByRole('button', { name: '2' }).click();
    await expect(page.getByRole('button', { name: '2' })).toHaveClass(/bg-\[#2C2C2C\]/);
  });
});