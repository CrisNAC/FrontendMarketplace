import { test, expect } from '@playwright/test';

// =============================================
// HOMEPAGE
// =============================================
test.describe('Página de Inicio o Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/homepage');
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

  test('debe mostrar el input de búsqueda en el navbar', async ({ page }) => {
    const navbarSearch = page.getByPlaceholder('Buscar');
    await expect(navbarSearch).toBeVisible();
  });

  /*test('debe mostrar el carrusel hero con primer slide', async ({ page }) => {
    await expect(page.getByText(/Explora, filtra y descubre productos responsables/i)).toBeVisible();
  });

  test('debe mostrar la descripción del primer slide del carrusel', async ({ page }) => {
    await expect(page.getByText(/Catálogo con filtros avanzados/i)).toBeVisible();
  });

  test('debe avanzar automáticamente al segundo slide del carrusel', async ({ page }) => {
    // El carrusel avanza cada 5 segundos
    await page.waitForTimeout(5500);
    await expect(page.getByText(/Compra con impacto positivo/i)).toBeVisible();
  });*/

  test('debe mostrar la sección Compra por categorías', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Compra por categorías/i })).toBeVisible();
  });

  test('debe mostrar las categorías de compra', async ({ page }) => {
    await expect(page.locator('span', { hasText: 'Celulares' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Moda' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Salud y Belleza' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Hogar' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Deportes' })).toBeVisible();
  });

  test('debe mostrar la sección de Comercios', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Comercios/i })).toBeVisible();
  });

  test('debe mostrar los comercios (Marca 1 - Marca 5)', async ({ page }) => {
    await expect(page.getByText('Marca 1')).toBeVisible();
    await expect(page.getByText('Marca 2')).toBeVisible();
    await expect(page.getByText('Marca 3')).toBeVisible();
    await expect(page.getByText('Marca 4')).toBeVisible();
    await expect(page.getByText('Marca 5')).toBeVisible();
  });
});