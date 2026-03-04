import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE COMPARAR PRECIOS
// =============================================
test.describe('Página de comparar precios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comparar');
  });

  test('debe mostrar el navbar con el logo Open Market', async ({ page }) => {
    const omNavbar = page.locator('header').getByText('Open Market');
    await expect(omNavbar).toBeVisible();
  });
  
  test('debe mostrar el título del producto', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /iPhone 17 Pro/i })
    ).toBeVisible();
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

  test('debe mostrar el rango de precios', async ({ page }) => {
    await expect(page.getByText('Rango de precios')).toBeVisible();
  });

  test('debe mostrar las ofertas encontradas', async ({ page }) => {
    const ofertas = page.getByRole('heading', { name: 'ofertas', level: 2 });
    await expect(ofertas.first()).toBeVisible();
  });

  test('debe mostrar cards de ofertas con nombre de tienda', async ({ page }) => {
    const storeCards = page.getByRole('heading', { name: 'Nissei' });
    await expect(storeCards.first()).toBeVisible();
  });

  test('debe mostrar botones "Ver mas" en las cards de oferta', async ({ page }) => {
    const verMasButtons = page.getByRole('button', { name: /Ver más/i });
    await expect(verMasButtons.first()).toBeVisible();
  });

  test('debe mostrar el botón de volver (flecha)', async ({ page }) => {
    const backButton = page.locator('svg').first();
    await expect(backButton).toBeVisible();
  });

  test('debe mostrar la imagen del producto', async ({ page }) => {
    const productImage = page.getByAltText('Imagen del producto').first();
    await expect(productImage).toBeVisible();
  });
});