import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE COMENTARIOS
// =============================================
test.describe('Página de comentarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comentarios');
  });

  test('debe mostrar el botón de volver con texto Comentarios', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Comentarios/i })
    ).toBeVisible();
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

  test('debe mostrar la distribución de calificaciones', async ({ page }) => {
    await expect(page.getByText('5 estrellas')).toBeVisible();
    await expect(page.getByText('4 estrellas')).toBeVisible();
    await expect(page.getByText('3 estrellas')).toBeVisible();
    await expect(page.getByText('2 estrellas')).toBeVisible();
    await expect(page.getByText('1 estrella')).toBeVisible();
  });

  test('debe mostrar el botón Escribir mi opinión', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Escribir mi opinión/i })).toBeVisible();
  });

  test('debe mostrar el texto de invitación a escribir reseña', async ({ page }) => {
    await expect(page.getByText(/Comparte tu opinión con otros clientes/i)).toBeVisible();
  });

  test('debe mostrar el badge Compra Verificada en comentarios verificados', async ({ page }) => {
    await expect(page.getByText('Compra Verificada').first()).toBeVisible();
  });

  test('debe mostrar los detalles del producto en el comentario', async ({ page }) => {
    await expect(page.getByText('Tamaño:').first()).toBeVisible();
    await expect(page.getByText('Color:').first()).toBeVisible();
  });

  test('debe mostrar la ubicación del comentario', async ({ page }) => {
    await expect(page.getByText(/Calificado en Estados Unidos/i)).toBeVisible();
  });

  test('debe abrir el modal al hacer click en Escribir mi opinión', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('el modal debe tener el campo de título de reseña', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();
    await expect(page.getByPlaceholder(/título/i)).toBeVisible();
  });

  test('el modal debe tener el campo de comentario', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();
    await expect(page.getByPlaceholder(/comentario/i)).toBeVisible();
  });

  test('el modal debe tener selector de estrellas', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();
    const stars = page.locator('[aria-label*="estrella"], button:has-text("★")');
    await expect(stars.first()).toBeVisible();
  });

  test('debe cerrar el modal al cancelar', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const cancelBtn = page.getByRole('button', { name: /cancelar|cerrar|×|✕/i });
    await cancelBtn.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('debe añadir un comentario nuevo al enviar el formulario', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();

    await page.getByPlaceholder(/título/i).fill('Excelente producto');
    await page.getByPlaceholder(/comentario/i).fill('Muy buena calidad, lo recomiendo.');

    await page.getByRole('button', { name: /enviar|publicar|guardar/i }).click();

    await expect(page.getByText('Excelente producto')).toBeVisible();
  });

  test('debe mostrar alerta al enviar formulario vacío', async ({ page }) => {
    await page.getByRole('button', { name: /Escribir mi opinión/i }).click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Por favor escribe un comentario');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /enviar|publicar|guardar/i }).click();
  });
});