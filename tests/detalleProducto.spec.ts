import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE DETALLE DEL PRODUCTO
// =============================================
test.describe('Página de Detalle del Producto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/producto-detalle');
  });

  test('debe mostrar el navbar con el logo Open Market', async ({ page }) => {
    const omNavbar = page.locator('header').getByText('Open Market');
    await expect(omNavbar).toBeVisible();
  });

  test('debe mostrar el nombre del producto', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Apple iPhone 17 Pro/i })
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

  test('debe mostrar la navegación de Nissei / Celulares', async ({ page }) => {
    await expect(page.getByText('Nissei / Celulares')).toBeVisible();
  });

  test('debe mostrar la calificación del producto', async ({ page }) => {
    await expect(page.getByText(/calificaciones/i)).toBeVisible();
  });

  test('debe mostrar el precio del producto', async ({ page }) => {
    await expect(page.getByText('Gs. ')).toBeVisible();
  });

  test('debe mostrar el badge En stock', async ({ page }) => {
    await expect(page.getByText('En stock')).toBeVisible();
  });

  test('debe mostrar las características del producto', async ({ page }) => {
    await expect(page.getByText('Características')).toBeVisible();
  });

  test('debe mostrar los botones de selección de memoria', async ({ page }) => {
    await expect(page.getByRole('button', { name: '256 GB' })).toBeVisible();
    await expect(page.getByRole('button', { name: '512 GB' })).toBeVisible();
  });

  test('debe cambiar la memoria seleccionada al hacer click', async ({ page }) => {
    const btn512 = page.getByRole('button', { name: '512 GB' });
    await btn512.click();
    await expect(page.getByText('Memoria Interna 512 GB')).toBeVisible();
  });

  /*test('debe mostrar el selector de cantidad', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Disminuir cantidad' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aumentar cantidad' })).toBeVisible();
  });

  test('debe incrementar la cantidad al hacer click en +', async ({ page }) => {
    await page.getByRole('button', { name: 'Aumentar cantidad' }).click();
    // la cantidad debe aumentar a 2
    const quantityEl = page.locator('div').filter({ hasText: /^2$/ }).first();
    await expect(quantityEl).toBeVisible();
  });

  test('no debe decrementar por debajo de 1', async ({ page }) => {
    await page.getByRole('button', { name: 'Disminuir cantidad' }).click();
    // la cantidad debe mantenerse en 1
    const quantityEl = page.locator('div').filter({ hasText: /^1$/ }).first();
    await expect(quantityEl).toBeVisible();
  });*/

  test('debe mostrar el botón Agregar al Carrito', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Agregar al Carrito/i })
    ).toBeVisible();
  });

  /*test('debe mostrar el botón de favoritos', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Agregar a favoritos' })
    ).toBeVisible();
  });

  test('debe togglear favoritos al hacer click en el corazón', async ({ page }) => {
    const favBtn = page.getByRole('button', { name: 'Agregar a favoritos' });
    // Antes del click: icono gris
    await expect(favBtn.locator('svg')).toHaveClass(/text-gray-600/);
    await favBtn.click();
    // Después del click: icono rojo
    await expect(favBtn.locator('svg')).toHaveClass(/text-red-500/);
  });*/

  test('debe mostrar el botón de Comentarios', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Comentarios/i })
    ).toBeVisible();
  });

  /*test('debe mostrar las opciones de color del producto', async ({ page }) => {
    await expect(page.getByText('Color')).toBeVisible();
    await expect(page.getByRole('button', { name: /Seleccionar color Deep Blue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Seleccionar color Orange/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Seleccionar color White/i })).toBeVisible();
  });

  test('debe cambiar el color seleccionado al hacer click', async ({ page }) => {
    const btnWhite = page.getByRole('button', { name: /Seleccionar color White/i });
    await btnWhite.click();
    await expect(page.getByText('Color White')).toBeVisible();
  });*/
});