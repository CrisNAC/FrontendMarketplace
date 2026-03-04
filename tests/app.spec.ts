import { test, expect } from '@playwright/test';

// =============================================
// RUTAS & NAVEGACION
// =============================================
test.describe('Rutas y navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar la página de bienvenida con el título correcto', async ({ page }) => {
    await expect(page).toHaveTitle(/OpenMarket/);
  });

  test('debe mostrar el mensaje de bienvenida', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bienvenido al Marketplace' })).toBeVisible();
  });

  test('ruta desconocida debe redirigir al inicio', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Bienvenido al Marketplace' })).toBeVisible();
  });

  test('debe mostrar los enlaces de navegación', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Comparar Precios' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mi Perfil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Detalle de Producto' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mi Comercio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'perfil comercio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver Producto Comercio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver pedidos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Homepage' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Busqueda' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Comentarios' })).toBeVisible();
  });

  test('debe poder navegar desde inicio a /comparar y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Comparar Precios' }).click();
    await expect(page).toHaveURL('/comparar');
  
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
  
  test('debe poder navegar desde inicio a /perfil y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Mi Perfil' }).click();
    await expect(page).toHaveURL('/perfil');
    await expect(page.getByRole('heading', { name: 'Mi Cuenta' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /producto-detalle y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Detalle de Producto' }).click();
    await expect(page).toHaveURL('/producto-detalle');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /comercio y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Mi Comercio' }).click();
    await expect(page).toHaveURL('/comercio');
    await expect(page.getByText('Dashboard').first()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /perfil-comercio y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'perfil comercio' }).click();
    await expect(page).toHaveURL('/perfil-comercio');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /comercio-producto y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Ver Producto Comercio' }).click();
    await expect(page).toHaveURL('/comercio-producto');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /pedidos y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Ver pedidos' }).click();
    await expect(page).toHaveURL('/pedidos');
    await expect(page.getByRole('heading', { name: 'Mis Pedidos' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /homepage y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Homepage' }).click();
    await expect(page).toHaveURL('/homepage');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /busqueda y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Busqueda' }).click();
    await expect(page).toHaveURL('/busqueda');
    await expect(page.getByText('Resultado de Búsqueda para:').first()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('debe poder navegar desde inicio a /comentarios y volver', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Comentarios' }).click();
    await expect(page).toHaveURL('/comentarios');
    await expect(page.getByText('Comentarios').first()).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});