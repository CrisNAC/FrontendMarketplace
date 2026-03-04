import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE PERFIL DE COMERCIO
// =============================================
test.describe('Página de Perfil de Comercio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/perfil-comercio');
  });

  test('debe mostrar el navbar con el logo Open Market', async ({ page }) => {
    const omNavbar = page.locator('header').getByText('Open Market');
    await expect(omNavbar).toBeVisible();
  });

  test('debe mostrar el breadcrumb con nombre del comercio', async ({ page }) => {
    await expect(page.getByText(/Comercios \/ Nissei/i)).toBeVisible();
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

  test('debe mostrar el nombre del comercio en el header', async ({ page }) => {
    await expect(page.locator('h5', { hasText: 'Comercios / ' })).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
  });

  test('debe mostrar la categoría del comercio', async ({ page }) => {
    await expect(page.getByText(/Productos varios/i)).toBeVisible();
  });

  test('debe mostrar el badge Abierto', async ({ page }) => {
    await expect(page.getByText(/Abierto/i)).toBeVisible();
  });

  test('debe mostrar las reseñas del comercio', async ({ page }) => {
    await expect(page.getByText(/reseñas/i)).toBeVisible();
  });

  test('debe mostrar el horario de cierre', async ({ page }) => {
    await expect(page.getByText(/Cierra a las/i)).toBeVisible();
  });

  test('debe mostrar el botón Llamar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Llamar/i })).toBeVisible();
  });

  test('debe mostrar el botón Email', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Email/i })).toBeVisible();
  });

  test('debe mostrar el botón Cómo llegar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Cómo llegar/i })).toBeVisible();
  });

  test('debe mostrar la barra de búsqueda del comercio', async ({ page }) => {
    const commerceSearch = page.getByPlaceholder('Buscar en Nissei');
    await expect(commerceSearch).toBeVisible();
  });

  test('debe mostrar la sección de Productos Destacados', async ({ page }) => {
    await expect(page.getByText('Productos Destacados')).toBeVisible();
  });

  test('debe mostrar cards de productos con precio en Gs.', async ({ page }) => {
    const productCards = page.getByText(/Gs\./);
    await expect(productCards.first()).toBeVisible();
  });

  test('debe mostrar el botón Ver más en las cards de productos', async ({ page }) => {
    const verMasButtons = page.getByRole('button', { name: /Ver más/i });
    await expect(verMasButtons.first()).toBeVisible();
  });

  test('debe mostrar el sidebar de filtros de categoría', async ({ page }) => {
    await expect(page.getByText(/Filtrar por/i)).toBeVisible();
  });

  test('debe mostrar la paginación', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('debe avanzar de página al hacer click en siguiente', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /siguiente|next|›|>/i });
    await nextBtn.click();
    await expect(page.getByRole('button', { name: '2' })).toHaveClass(/bg-\[#2C2C2C\]/);
  });
});