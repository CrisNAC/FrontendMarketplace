import { test, expect } from '@playwright/test';

test('flujo comercio rechazado: notificacion, panel y reenvio a revision', async ({ page }) => {
  let storeStatus = 'SUSPENDED';
  let updateRequestCount = 0;

  await page.route('**/api/session/user-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          id_user: 10,
          id_store: 50,
          name: 'Vendedor Test',
          role: 'SELLER',
        },
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
      body: JSON.stringify({
        id: 1,
        title: 'Solicitud de comercio rechazada',
        referenceId: 50,
        read: true,
        createdAt: '2026-05-15T10:00:00.000Z',
      }),
    });
  });

  await page.route('**/api/commerces/my/50', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id_store: 50,
        name: 'Comercio Circular',
        email: 'comercio@test.com',
        phone: '+595981000000',
        description: 'Productos sustentables',
        store_status: storeStatus,
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
        shipping_zones: [
          {
            id_shipping_zone: 1,
            base_price: 10000,
            distance_price: 15000,
          },
        ],
      }),
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
    updateRequestCount += 1;
    storeStatus = 'INACTIVE';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Comercio actualizado exitosamente',
        data: {
          id_store: 50,
          name: 'Comercio Circular',
          store_status: 'INACTIVE',
          status: true,
        },
      }),
    });
  });

  await page.goto('/notificaciones');

  await page.getByRole('button', { name: 'Solicitud de comercio rechazada' }).click();

  await expect(page).toHaveURL(/\/comercio$/);
  await expect(page.getByText('Comercio no aprobado o suspendido')).toBeVisible();

  await page.getByRole('button', { name: 'Editar Comercio para Revisión' }).click();

  await expect(page).toHaveURL(/\/comercio\/editar$/);
  
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();

  await expect.poll(() => updateRequestCount).toBe(1);
  await expect(page.getByText('Comercio actualizado exitosamente')).toBeVisible();
});
