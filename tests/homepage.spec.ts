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

  test('debe mostrar el input de búsqueda en el navbar', async ({ page }) => {
    await expect(page.getByPlaceholder('Buscar')).toBeVisible();
  });

  test('debe mostrar el botón de búsqueda', async ({ page }) => {
    await expect(page.getByRole('button', { name: /buscar/i })).toBeVisible();
  });

  test('debe mostrar el carrusel hero con primer slide', async ({ page }) => {
    await expect(page.getByText(/Explora, filtra y descubre productos responsables/i)).toBeVisible();
  });

  test('debe mostrar la descripción del primer slide del carrusel', async ({ page }) => {
    await expect(page.getByText(/Catálogo con filtros avanzados/i)).toBeVisible();
  });

  test('debe avanzar automáticamente al segundo slide del carrusel', async ({ page }) => {
    // El carrusel avanza cada 5 segundos
    await page.waitForTimeout(5500);
    await expect(page.getByText(/Compra con impacto positivo/i)).toBeVisible();
  });

  test('debe mostrar la sección Compra por categorías', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Compra por categorías/i })).toBeVisible();
  });

  test('debe mostrar las categorías de compra', async ({ page }) => {
    await expect(page.getByText('Celulares')).toBeVisible();
    await expect(page.getByText('Moda')).toBeVisible();
    await expect(page.getByText('Salud y Belleza')).toBeVisible();
    await expect(page.getByText('Hogar')).toBeVisible();
    await expect(page.getByText('Deportes')).toBeVisible();
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