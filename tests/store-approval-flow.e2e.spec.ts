import { test, expect, Page } from '@playwright/test';

//ESTE ARCHIVO NO FUE CREADO POR EL QA, pero lo deje nomas

// Helpers y datos comunes

const buildStore = (store_status: string) => ({
  id_store: 50,
  name: 'Comercio Circular',
  email: 'comercio@test.com',
  phone: '+595981000000',
  description: 'Productos sustentables',
  store_status,
  products: [],
  categories: [{ id: 1, name: 'Moda', status: true }],
  addresses: [
    {
      id_address: 1,
      address: 'Calle 1',
      city: 'Asuncion',
      region: 'Centro',
      latitude: -25.28,
      longitude: -57.63,
    },
  ],
  shipping_zones: [{ id_shipping_zone: 1, base_price: 10000, distance_price: 15000 }],
});

async function setupSellerSession(page: Page) {
  await page.route('**/api/session/user-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: { id_user: 10, id_store: 50, name: 'Vendedor Test', role: 'SELLER' },
      }),
    });
  });
}

async function setupStoreRoute(page: Page, store_status: string) {
  await page.route('**/api/commerces/my/50', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildStore(store_status)),
    });
  });
}



test.describe('Flujo de reaprobación de comercio', () => {

  

  // OM494
  test('flujo comercio: visibilidad de botones de acción según estado del comercio', async ({ page }) => {
    await setupSellerSession(page);

    let currentStatus = 'SUSPENDED';

    await page.route('**/api/commerces/my/50', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildStore(currentStatus)),
      });
    });

    await page.route('**/api/commerces/50', async (route) => {
      if (route.request().method() !== 'GET') { await route.fallback(); return; }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_store: 50, name: 'Comercio Circular', store_status: currentStatus, products: [] }),
      });
    });

    // Estado SUSPENDED: botón reenvío visible en /comercio, crear producto ausente en /comercio/productos
    await page.goto('/comercio');
    await expect(page.getByRole('button', { name: 'Editar Comercio para Revisión' })).toBeVisible();

    await page.goto('/comercio/productos');
    await expect(page.getByRole('button', { name: 'Nuevo Producto' })).not.toBeVisible();

    // Estado ACTIVE: botón reenvío ausente, crear producto visible
    currentStatus = 'ACTIVE';

    await page.goto('/comercio');
    await expect(page.getByRole('button', { name: 'Editar Comercio para Revisión' })).not.toBeVisible();

    await page.goto('/comercio/productos');
    await expect(page.getByRole('button', { name: 'Nuevo Producto' })).toBeVisible();
  });

  // OM494
  test('flujo comercio: flujo de reenvío - notificación, panel, edición y estado INACTIVE post-guardado', async ({ page }) => {
    let storeStatus = 'SUSPENDED';
    let updateRequestCount = 0;

    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id_user: 10, id_store: 50, name: 'Vendedor Test', role: 'SELLER' },
        }),
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unreadCount: 1,
          notifications: [
            {
              id: 1,
              title: 'Solicitud de comercio rechazada',
              message: 'Tu solicitud fue rechazada. Motivo: Falta documentacion comercial',
              referenceId: 50,
              read: false,
              createdAt: '2026-05-15T10:00:00.000Z',
            },
          ],
        }),
      });
    });

    await page.route('**/api/notifications/1/read', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, read: true }),
      });
    });

    await page.route('**/api/commerces/my/50', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildStore(storeStatus)),
      });
    });

    await page.route('**/api/commerces/categories**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, name: 'Moda', status: true }]),
      });
    });

    await page.route('**/api/commerces/50', async (route) => {
      if (route.request().method() !== 'PUT') { await route.fallback(); return; }
      updateRequestCount += 1;
      storeStatus = 'INACTIVE';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Comercio actualizado exitosamente',
          data: { id_store: 50, name: 'Comercio Circular', store_status: 'INACTIVE', status: true },
        }),
      });
    });

    // Dashboard SUSPENDED → banner visible → abrir bell → click notificación de rechazo
    await page.goto('/comercio');
    await expect(page.getByText('Comercio no aprobado o suspendido')).toBeVisible();

    await page.getByRole('button', { name: 'Notificaciones' }).click();
    await page.getByRole('button', { name: 'Solicitud de comercio rechazada' }).click();

    await expect(page).toHaveURL(/\/comercio$/);

    // Botón → /comercio/editar → guardar
    await page.getByRole('button', { name: 'Editar Comercio para Revisión' }).click();
    await expect(page).toHaveURL(/\/comercio\/editar$/);

    await page.getByRole('button', { name: 'Guardar Cambios' }).click();
    await expect.poll(() => updateRequestCount).toBe(1);
    await expect(page.getByText('Comercio actualizado exitosamente')).toBeVisible();

    // Post-reenvío: banner INACTIVE visible, banner SUSPENDED y botón de reenvío ausentes
    await page.goto('/comercio');
    await expect(page.getByText('Comercio en revisión')).toBeVisible();
    await expect(page.getByText('Comercio no aprobado o suspendido')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar Comercio para Revisión' })).not.toBeVisible();
  });

  // OM494
  test('flujo comercio: notificación "Comercio aprobado" navega a /comercio sin banners de error', async ({ page }) => {
    await setupSellerSession(page);
    await setupStoreRoute(page, 'ACTIVE');

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unreadCount: 1,
          notifications: [
            {
              id: 2,
              title: 'Comercio aprobado',
              message: 'Tu comercio ha sido aprobado y ya está visible al público.',
              referenceId: null,
              read: false,
              createdAt: '2026-05-21T10:00:00.000Z',
            },
          ],
        }),
      });
    });

    await page.route('**/api/notifications/2/read', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 2, read: true }),
      });
    });

    await page.goto('/notificaciones');
    await page.getByRole('button', { name: 'Comercio aprobado' }).click();

    await expect(page).toHaveURL(/\/comercio$/);
    await expect(page.getByText('Comercio no aprobado o suspendido')).not.toBeVisible();
    await expect(page.getByText('Comercio en revisión')).not.toBeVisible();
  });

  // OM494
  test('flujo comercio: badge del bell muestra conteo de no leídas y "99+" al superar 99', async ({ page }) => {
    await setupSellerSession(page);
    await setupStoreRoute(page, 'ACTIVE');

    // Caso 1: unreadCount = 3
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 3, notifications: [] }),
      });
    });

    await page.goto('/comercio');

    const badge = page.locator('button[aria-label="Notificaciones"] span');
    await expect(badge).toHaveText('3');

    //  unreadCount = 105 → debe mostrar "99+"
    await page.unroute('**/api/notifications');
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 105, notifications: [] }),
      });
    });

    await page.reload();
    await expect(badge).toHaveText('99+');
  });

});
