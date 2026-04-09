import { test, expect, Page } from '@playwright/test';

type Store = {
  id_store: number;
  name: string;
  store_category?: { name: string };
};

const mockStores: Store[] = [
  { id_store: 1, name: 'Nissei', store_category: { name: 'Tecnología' } },
  { id_store: 2, name: 'TechPoint', store_category: { name: 'Electrónica' } },
];

const mockProducts = [
  {
    id_product: 101,
    name: 'Apple iPhone 17 Pro A3256 Dual',
    description: 'Smartphone premium',
    price: 13290000,
    quantity: 8,
    averageRating: 4.7,
    reviewCount: 542,
    category: { name: 'Celulares' },
    commerce: { name: 'Nissei' },
    tags: [{ id: 1, name: 'OLED' }],
  },
  {
    id_product: 102,
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Android flagship',
    price: 8999000,
    quantity: 4,
    averageRating: 4.5,
    reviewCount: 211,
    category: { name: 'Celulares' },
    commerce: { name: 'Nissei' },
    tags: [{ id: 2, name: 'AMOLED' }],
  },
];

async function setupCommonApiMocks(page: Page) {
  await page.route('**/api/users/register', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Registro exitoso' }),
    });
  });

  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, id_store: 1 } }),
    });
  });

  await page.route('**/api/session/user-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
    });
  });

  await page.route('**/api/categories/products**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, id_product_category: 1, name: 'Celulares', status: true },
        { id: 2, id_product_category: 2, name: 'Notebooks', status: true },
      ]),
    });
  });

  await page.route('**/api/commerces', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockStores),
    });
  });

  await page.route('**/api/commerces/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id_store: 1,
        name: 'Nissei',
        store_category: { id_store_category: 1, name: 'Tecnología' },
        products: mockProducts.map((product) => ({
          id_product: product.id_product,
          name: product.name,
          description: product.description,
          price: product.price,
          average_rating: product.averageRating,
          total_reviews: product.reviewCount,
          visible: true,
          product_category: { name: product.category.name },
        })),
      }),
    });
  });

  await page.route('**/api/commerces/products/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        mockProducts.map((product) => ({
          id_product: product.id_product,
          name: product.name,
          description: product.description,
          price: product.price,
        })),
      ),
    });
  });

  // Endpoint usado por VistaComercioPage(Linea 182) para cargar productos del comercio
  await page.route('**/api/commerces/products/filter/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        mockProducts.map((product) => ({
          id_product: product.id_product,
          name: product.name,
          description: product.description,
          price: product.price,
          visible: true,
          product_category: { id_product_category: 1, name: product.category.name },
        })),
      ),
    });
  });

  await page.route('**/products?**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === '/products' && url.searchParams.has('page')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: mockProducts,
          pagination: {
            totalProducts: mockProducts.length,
            page: Number(url.searchParams.get('page') ?? 1),
            limit: Number(url.searchParams.get('limit') ?? 20),
            totalPages: 1,
          },
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/products/tags**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 10, id_product_tag: 10, name: 'oferta', status: true },
        { id: 11, id_product_tag: 11, name: 'nuevo', status: true },
      ]),
    });
  });

  await page.route('**/products', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id_product: 999, message: 'Producto creado' }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/products/compare/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        product: { name: 'Apple iPhone 17 Pro A3256 Dual' },
        offers: [
          {
            productId: 101,
            name: 'Apple iPhone 17 Pro A3256 Dual',
            price: 13290000,
            store: { name: 'Nissei' },
          },
          {
            productId: 102,
            name: 'Apple iPhone 17 Pro A3256 Dual',
            price: 12950000,
            store: { name: 'TechPoint' },
          },
        ],
      }),
    });
  });

  await page.route('**/products/101', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProducts[0]),
    });
  });

  await page.route('**/products/reviews/101', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stats: { averageRating: 4.7, totalReviews: 2 },
        reviews: [
          {
            id: 1,
            customerName: 'Tamara',
            rating: 5,
            comment: 'Excelente producto',
            isVerified: true,
            date: '2026-03-15T10:00:00.000Z',
          },
          {
            id: 2,
            customerName: 'Carlos',
            rating: 4,
            comment: 'Muy buena compra',
            isVerified: false,
            date: '2026-03-12T10:00:00.000Z',
          },
        ],
      }),
    });
  });

  // Retorna mockProducts con información de paginación
  await page.route('**/busqueda**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: mockProducts,
        category: 'Celulares',
        pagination: {
          totalProducts: mockProducts.length,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      }),
    });
  });

  // Intercepta la solicitud GET de listado de pedidos del cliente
  await page.route('**/api/users/*/orders', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            status: 'DELIVERED',
            total: 13290000,
            createdAt: '2026-03-20T10:00:00.000Z',
            items: [
              {
                id: 1,
                quantity: 1,
                price: 13290000,
                originalPrice: 13290000,
                isOfferApplied: false,
                subtotal: 13290000,
              },
            ],
            address: {
              id: 1,
              address: 'Av. Santa Teresa 1234',
              city: 'Asuncion',
              region: 'Central',
            },
          },
        ]),
      });
    }
  });

  // Intercepta la solicitud GET del detalle de un pedido específico
  await page.route('**/api/users/*/orders/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          status: 'DELIVERED',
          total: 13290000,
          createdAt: '2026-03-20T10:00:00.000Z',
          items: [
            {
              id: 1,
              quantity: 1,
              price: 13290000,
              originalPrice: 13290000,
              isOfferApplied: false,
              subtotal: 13290000,
            },
          ],
          address: {
            id: 1,
            address: 'Av. Santa Teresa 1234',
            city: 'Asuncion',
            region: 'Central',
          },
        }),
      });
    }
  });
}

test.describe('Flujos E2E de usuario final', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupCommonApiMocks(page);
  });

  test('flujo cliente: registro, login, homepage, comercio, producto y comentarios', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Registrarse' }).click();
    await page.getByPlaceholder('Tu nombre').fill('test user');
    await page.getByPlaceholder('tu@correo.com').fill('user@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('input[name="confirmPassword"]').fill('12345678');
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();

    await page.getByPlaceholder('tu@correo.com').fill('user@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/homepage');
    await expect(page.getByRole('heading', { name: 'Comercios' })).toBeVisible();

    await page.goto('/perfil-comercio?storeId=1&storeName=Nissei');
    await expect(page).toHaveURL(/\/perfil-comercio\?storeId=1/);
    await expect(page.getByRole('heading', { name: 'Nissei', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Ver más' }).first().click({ timeout: 60000 });
    await expect(page).toHaveURL('/producto-detalle/101');
    await expect(page.getByText('Apple iPhone 17 Pro A3256 Dual')).toBeVisible();

    await page.getByRole('button', { name: 'Comentarios' }).click();
    await expect(page).toHaveURL('/comentarios/101');
    await expect(page.getByRole('heading', { name: 'Comentarios' })).toBeVisible();
  });

  test('flujo comercio: login, ir a productos y crear un nuevo producto', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('tu@correo.com').fill('comercio@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/homepage');

    await page.goto('/comercio');
    await expect(page.getByText('Dashboard').first()).toBeVisible();

    await page.getByText('Productos').first().click();
    await expect(page).toHaveURL('/comercio/productos');
    await expect(page.getByText('Gestión de Productos')).toBeVisible();

    await page.getByRole('button', { name: 'Nuevo Producto' }).click();
    await expect(page).toHaveURL('/comercio/productos/nuevo');
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Producto' })).toBeVisible();

    await page.getByLabel('Nombre del Producto *').fill('Mouse Ergonomico Vertical');
    await page.getByLabel('Descripcion *').fill('Mouse vertical para oficina con conexión inalámbrica.');
    await page.getByLabel('Precio *').fill('125000');
    await page.getByLabel('Stock Disponible *').fill('15');
    await page.getByLabel('Categoria *').selectOption({ label: 'Celulares' });

    await page.getByRole('button', { name: 'oferta' }).click();
    await page.getByRole('button', { name: 'Crear Producto' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Producto creado')).toBeVisible();
  });

  test('flujo descubrimiento: homepage, busqueda, comparar precios y abrir detalle', async ({ page }) => {
    await page.goto('/homepage');

    const categoriasSection = page.locator('section').filter({ hasText: 'Compra por categorias' });
    await categoriasSection.getByText('Celulares').first().click();

    await expect(page).toHaveURL(/\/busqueda\?/);
    await expect(page).toHaveURL(/categoryId=1/);
    await expect(page.getByText('Resultado de Busqueda para: Celulares')).toBeVisible();

    await page.getByRole('button', { name: 'Comparar precios' }).first().click();
    await expect(page).toHaveURL(/\/comparar\?search=/);
    await expect(page.getByRole('heading', { name: /Ofertas:/ })).toBeVisible();

    await page.getByRole('link', { name: '+ Ver más' }).first().click();
    await expect(page).toHaveURL('/producto-detalle/101');
    await expect(page.getByText('Apple iPhone 17 Pro A3256 Dual').first()).toBeVisible();
  });

  test('flujo pedidos: lista de pedidos y detalle de pedido', async ({ page }) => {
    await page.goto('/pedidos');

    await expect(page.getByRole('heading', { name: 'Mis Pedidos' })).toBeVisible();

    const firstOrderCard = page.locator('div.cursor-pointer').first();
    await expect(firstOrderCard).toBeVisible();
    await firstOrderCard.click();

    await expect(page).toHaveURL(/\/pedidos\/\d+$/);
    await expect(page.getByText('Información de pedido')).toBeVisible();
    await expect(page.getByText('Dirección de envío')).toBeVisible();
  });

  test('flujo carrito: agregar producto al carrito y ver detalle', async ({ page }) => {
    // Mocks específicos del flujo carrito
    await page.route('**/api/users/*/cart/items', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            storeId: 1,
            commerce: { id: 1, name: 'Nissei' },
            status: 'ACTIVE',
            items: [
              {
                id: 1,
                quantity: 1,
                product: {
                  id: 101,
                  name: 'Apple iPhone 17 Pro A3256 Dual',
                  price: 13290000,
                  isOffer: false,
                },
              },
            ],
          }),
        });
      }
    });

    await page.route('**/api/users/*/carts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            carts: [
              {
                id: 1,
                storeId: 1,
                commerce: { id: 1, name: 'Nissei' },
                status: 'ACTIVE',
                items: [
                  {
                    id: 1,
                    quantity: 1,
                    product: {
                      id: 101,
                      name: 'Apple iPhone 17 Pro A3256 Dual',
                      price: 13290000,
                      isOffer: false,
                    },
                  },
                ],
              },
            ],
          }),
        });
      }
    });

    // Ir al detalle del producto
    await page.goto('/producto-detalle/101');

    // Esperar a que cargue el producto (botón habilitado)
    const addToCartBtn = page.getByRole('button', { name: 'Agregar al carrito' });
    await expect(addToCartBtn).toBeEnabled({ timeout: 10000 });
    await addToCartBtn.click();

    // Verificar el toast de confirmación
    await expect(page.getByText('Producto agregado al carrito')).toBeVisible();

    // Navegar al listado de carritos
    await page.goto('/carrito');
    await expect(page.getByRole('heading', { name: 'Ordenes de Compras' })).toBeVisible();
    await expect(page.getByText('Nissei')).toBeVisible();

    // Ver detalle del carrito
    await page.getByRole('button', { name: 'Ver detalles' }).click();
    await expect(page).toHaveURL(/\/carrito\/\d+$/);
    await expect(page.getByRole('heading', { name: 'Nissei' })).toBeVisible();
    await expect(page.getByText('Apple iPhone 17 Pro A3256 Dual')).toBeVisible();
  });

  test('flujo lista de deseos: agregar a favoritos y ver lista', async ({ page }) => {
    // Mocks específicos del flujo wishlist
    await page.route('**/api/users/*/wishlist/items', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Producto agregado a la lista de deseos' }),
        });
      }
    });

    await page.route('**/api/users/*/wishlist', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 1,
                quantity: 1,
                product: {
                  id: 101,
                  name: 'Apple iPhone 17 Pro A3256 Dual',
                  price: 13290000,
                },
              },
            ],
          }),
        });
      }
    });

    // Ir al detalle del producto
    await page.goto('/producto-detalle/101');

    // Esperar a que cargue el producto
    const addToCartBtn = page.getByRole('button', { name: 'Agregar al carrito' });
    await expect(addToCartBtn).toBeEnabled({ timeout: 10000 });

    // Hacer clic en el botón de favoritos
    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();

    // Verificar el toast de confirmación
    await expect(page.getByText('Producto agregado a la lista de deseos')).toBeVisible();

    // Navegar a la página de favoritos
    await page.goto('/favoritos');
    await expect(page.getByRole('heading', { name: 'Lista de Favoritos' })).toBeVisible();
    await expect(page.getByText('Apple iPhone 17 Pro A3256 Dual')).toBeVisible();
  });

  test('flujo checkout: confirmar pedido desde carrito', async ({ page }) => {
    await page.route('**/api/users/*/carts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            carts: [
              {
                id: 1,
                storeId: 1,
                commerce: { id: 1, name: 'Nissei' },
                status: 'ACTIVE',
                items: [
                  {
                    id: 1,
                    quantity: 1,
                    product: {
                      id: 101,
                      name: 'Apple iPhone 17 Pro A3256 Dual',
                      price: 13290000,
                      originalPrice: 13290000,
                      isOffer: false,
                    },
                  },
                ],
              },
            ],
          }),
        });
      }
    });

    await page.route('**/api/users/*/addresses', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
      }
    });

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 555,
            status: 'PENDING',
            total: 13290000,
            notes: null,
            address: null,
            items: [
              {
                id: 1,
                name: 'Apple iPhone 17 Pro A3256 Dual',
                quantity: 1,
                price: 13290000,
                originalPrice: 13290000,
                isOfferApplied: false,
                subtotal: 13290000,
              },
            ],
            createdAt: '2026-03-20T10:00:00.000Z',
            updatedAt: '2026-03-20T10:00:00.000Z',
          }),
        });
      }
    });

    await page.goto('/confirmar-pedido/1');

    await expect(page.getByRole('heading', { name: 'Confirmar Pedido' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar Pedido' }).click();

    await expect(page).toHaveURL('/pedido-confirmado');
    await expect(page.getByRole('heading', { name: /Pedido Confirmado/i })).toBeVisible();
    await expect(page.getByText('#555')).toBeVisible();
  });

  test('flujo direcciones: agregar nueva dirección del usuario', async ({ page }) => {
    // Esta pantalla exige `success: true` en user-session.
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id_user: 7, id_store: 1, name: 'Cliente Demo' } }),
      });
    });

    let addresses = [
      {
        id_address: 1,
        fk_user: 7,
        fk_store: null,
        address: 'Av. Santa Teresa 1234',
        city: 'Asuncion',
        region: 'Central',
        postal_code: null,
        latitude: -25.28646,
        longitude: -57.60918,
        status: true,
        created_at: '2026-03-20T10:00:00.000Z',
        updated_at: '2026-03-20T10:00:00.000Z',
      },
    ];

    await page.route('**/api/users/*/addresses**', async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: addresses }),
        });
        return;
      }

      if (method === 'POST') {
        const body = route.request().postDataJSON() as {
          address?: string;
          latitude?: number;
          longitude?: number;
        };

        const created = {
          id_address: 2,
          fk_user: 7,
          fk_store: null,
          address: body.address ?? 'Nueva dirección',
          city: 'Asuncion',
          region: 'Central',
          postal_code: null,
          latitude: Number(body.latitude ?? -25.3),
          longitude: Number(body.longitude ?? -57.6),
          status: true,
          created_at: '2026-03-21T10:00:00.000Z',
          updated_at: '2026-03-21T10:00:00.000Z',
        };

        addresses = [created, ...addresses];

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ data: created }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/direcciones');

    await expect(page.getByRole('heading', { name: 'Mi Cuenta' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Libreta de direcciones' })).toBeVisible();

    await page.getByRole('button', { name: 'Agregar dirección' }).first().click();
    await page.getByPlaceholder('Ej: Av. República del Paraguay 1234').fill('Calle Palma 450');

    const map = page.locator('.leaflet-container').first();
    await expect(map).toBeVisible();
    const selectedPointText = page.getByText(/Punto seleccionado:/);
    const clickPositions = [
      { x: 40, y: 40 },
      { x: 80, y: 80 },
      { x: 120, y: 70 },
      { x: 60, y: 120 },
      { x: 140, y: 110 },
    ];

    for (const position of clickPositions) {
      if (await selectedPointText.isVisible()) break;
      await map.click({ position, force: true });
      await page.waitForTimeout(150);
    }

    await expect(selectedPointText).toBeVisible({ timeout: 10000 });
    await page.locator('form').getByRole('button', { name: 'Agregar dirección' }).click();

    await expect(page.getByText('Dirección agregada correctamente')).toBeVisible();
    await expect(page.getByText('Calle Palma 450')).toBeVisible();
  });
});
