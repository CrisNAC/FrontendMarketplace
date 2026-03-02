import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE MI PERFIL
// =============================================
test.describe('Página de Mi Perfil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/perfil');
  });

  test('debe mostrar el título Mi Cuenta', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Mi Cuenta' })
    ).toBeVisible();
  });

  test('debe mostrar el sidebar con las opciones de navegación', async ({ page }) => {
    await expect(page.getByText('Mi Cuenta').first()).toBeVisible();
    await expect(page.getByText('Mis pedidos')).toBeVisible();
    await expect(page.getByText('Mi lista de favoritos')).toBeVisible();
  });

  test('debe mostrar la sección de información de la cuenta', async ({ page }) => {
    await expect(page.getByText('Informacion de la cuenta')).toBeVisible();
  });

  test('debe mostrar la tarjeta de información de contacto', async ({ page }) => {
    await expect(page.getByText('Informacion de Contacto')).toBeVisible();
  });

  test('debe mostrar la tarjeta de boletines', async ({ page }) => {
    await expect(page.getByText('Boletines informativos')).toBeVisible();
  });

  test('debe mostrar la sección de libreta de direcciones', async ({ page }) => {
    const direccionPago = page.getByRole('heading', { name: 'Direccion de pago predeterminada' });
    await expect(direccionPago).toBeVisible();

    const direccionEnvio = page.getByRole('heading', { name: 'Direccion de envio predeterminada' });
    await expect(direccionEnvio).toBeVisible();
  });

  test('debe mostrar los botones de editar', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: 'Editar' });
    await expect(editButtons.first()).toBeVisible();
  });

  test('debe mostrar el botón Cambiar contraseña', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Cambiar contrasena/i })).toBeVisible();
  });

  test('debe mostrar el navbar correctamente', async ({ page }) => {
    await expect(page.getByText('Open Market')).toBeVisible();
  });
});