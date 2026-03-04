import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE VER PRODUCTO (Comercio)
// =============================================
test.describe('Página de Ver Producto (Comercio)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comercio-producto');
  });

  test('debe mostrar el nombre del producto en el título', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Silla Ergonómica Oficina/i })
    ).toBeVisible();
  });

  test('debe mostrar el subtítulo de la vista', async ({ page }) => {
    await expect(
      page.getByText(/Vista detallada del producto/i)
    ).toBeVisible();
  });

  test('debe mostrar el botón Volver', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'Volver' })
    ).toBeVisible();
  });

  test('debe mostrar el botón Editar Producto', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Editar Producto/i })
    ).toBeVisible();
  });

  test('debe mostrar la imagen del producto', async ({ page }) => {
    const productImage = page.getByAltText('Silla');
    await expect(productImage).toBeVisible();
  });

  test('debe mostrar el precio del producto', async ({ page }) => {
    await expect(page.getByText('Gs. ')).toBeVisible();
  });

  test('debe mostrar la categoría del producto', async ({ page }) => {
    await expect(page.getByText('Muebles')).toBeVisible();
  });

  test('debe mostrar el estado Activo', async ({ page }) => {
    await expect(page.getByText('Activo').first()).toBeVisible();
  });

  test('debe mostrar la calificación del producto', async ({ page }) => {
    await expect(page.getByText('4.7')).toBeVisible();
  });

  test('debe mostrar las etiquetas del producto', async ({ page }) => {
    await expect(page.getByText('ergonomica')).toBeVisible();
    await expect(page.getByText('oficina')).toBeVisible();
    await expect(page.getByText('silla')).toBeVisible();
    await expect(page.getByText('trabajo')).toBeVisible();
  });

  test('debe mostrar la sección de Calificaciones y Comentarios', async ({ page }) => {
    await expect(
      page.getByText(/Calificaciones y Comentarios/i)
    ).toBeVisible();
  });

  test('debe mostrar los comentarios del producto', async ({ page }) => {
    await expect(page.getByText('María González')).toBeVisible();
    await expect(page.getByText('Carlos Ruiz')).toBeVisible();
    await expect(page.getByText('Ana López')).toBeVisible();
  });

  test('debe mostrar comentarios verificados con badge', async ({ page }) => {
    await expect(page.getByText('Verificada').first()).toBeVisible();
  });

  test('debe mostrar las fechas de los comentarios', async ({ page }) => {
    await expect(page.getByText('14 de enero de 2024')).toBeVisible();
  });

  test('debe mostrar la tarjeta de Información del producto', async ({ page }) => {
    await expect(page.getByText('Información').first()).toBeVisible();
    await expect(page.getByText('1 de enero de 2024')).toBeVisible();
  });

  test('debe mostrar la tarjeta de Estadísticas', async ({ page }) => {
    await expect(page.getByText('Estadísticas')).toBeVisible();
    await expect(page.getByText(/Calificación promedio:/i)).toBeVisible();
    await expect(page.getByText(/4\.7 \/ 5\.0/)).toBeVisible();
  });

  test('debe mostrar la sección de Acciones Rápidas', async ({ page }) => {
    await expect(page.getByText('Acciones Rápidas')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Editar Información/i })
    ).toBeVisible();
  });

  test('debe mostrar el botón Ver en Tienda', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Ver en Tienda/i })
    ).toBeVisible();
  });

  test('debe mostrar el sidebar Mi Comercio', async ({ page }) => {
    await expect(page.getByText('Mi Comercio').first()).toBeVisible();
  });
});