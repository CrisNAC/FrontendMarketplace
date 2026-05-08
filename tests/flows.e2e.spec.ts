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

  // este test ya no funciona en webkit porque WebKit no ejecuta el prellenado de campos de la misma forma que Chromium
  test('flujo cliente: registro, login, homepage, comercio, producto y comentarios', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Registrarse' }).click();
    await page.getByPlaceholder('Tu nombre').fill('test user');
    await page.getByPlaceholder('tu@correo.com').fill('user@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('input[name="confirmPassword"]').fill('12345678');

    await page.locator('form button[type="submit"]').click(); // Crear cuenta

    await expect(page.getByText('Bienvenido')).toBeVisible();
    await expect(page.locator('form button[type="submit"]')).toContainText('Iniciar sesión', { timeout: 5000 });

    // Los campos ya vienen prellenados, solo hacer click
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
    await page.getByLabel('Precio *').fill('12000');
    await page.getByLabel('Stock Disponible *').fill('15');
    await page.getByLabel('Categoria *').selectOption({ label: 'Celulares' });

    await page.getByRole('button', { name: 'oferta' }).click();
    await page.getByRole('button', { name: 'Crear Producto' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Producto creado')).toBeVisible();
  });

  test('flujo descubrimiento: homepage, busqueda, comparar precios y abrir detalle', async ({ page }) => {
    await page.goto('/homepage');

    const categoriasSection = page.locator('section').filter({ hasText: 'Compra por categorías' });
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
    await page.route('**/api/users/*/wishlists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Mi lista', itemCount: 1, createdAt: new Date().toISOString() },
          ]),
        });
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 2, name: 'Nueva lista', itemCount: 0, createdAt: new Date().toISOString() }),
        });
      }
    });

    await page.route('**/api/users/*/wishlists/1/items', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Producto agregado a la lista' }),
        });
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Mi lista',
            items: [
              {
                id: 1,
                quantity: 1,
                product: {
                  id: 101,
                  name: 'Apple iPhone 17 Pro A3256 Dual',
                  price: 13290000,
                  originalPrice: 13290000,
                  offerPrice: null,
                  isOffer: false,
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

    // Hacer clic en el botón de favoritos (corazón)
    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();

    // Esperar que aparezca el modal de listas
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Agregar a lista de deseos')).toBeVisible();
    await expect(page.getByText('Mi lista')).toBeVisible();

    // Seleccionar la lista
    await page.getByRole('button', { name: 'Mi lista' }).click();

    // Verificar el toast de confirmación
    await expect(page.getByText('Producto agregado a la lista')).toBeVisible();

    // Navegar a la página de wishlist
    await page.goto('/wishlist');
    await expect(page.getByRole('heading', { name: 'Lista de deseos' })).toBeVisible();
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

  test('flujo admin: dashboard de moderación', async ({ page }) => {
    await page.route('**/api/admin/users**', async (route) => {
      const url = new URL(route.request().url());
      const role = url.searchParams.get('role');
      const status = url.searchParams.get('status');
      const limit = url.searchParams.get('limit');

      const isCount = limit === '1';
      let payload: unknown;

      if (role === 'CUSTOMER' && status === 'true') {
        payload = isCount
          ? { total: 12 }
          : { data: [{ id: 11, name: 'Cliente Activo' }], pagination: { total: 1 } };
      } else if (role === 'SELLER') {
        payload = isCount
          ? { total: 3 }
          : { data: [{ id: 21, name: 'Comercio Nuevo' }], pagination: { total: 1 } };
      } else if (role === 'CUSTOMER') {
        payload = { data: [{ id: 31, name: 'Cliente Reciente' }], pagination: { total: 1 } };
      } else {
        payload = isCount
          ? { total: 20 }
          : { data: [{ id: 41, name: 'Usuario Admin' }], pagination: { total: 1 } };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });

    await page.route('**/api/admin/products**', async (route) => {
      const url = new URL(route.request().url());
      const approvalStatus = url.searchParams.get('approvalStatus');
      const isCount = url.searchParams.get('limit') === '1';

      const payload = approvalStatus === 'PENDING'
        ? (isCount
          ? { total: 2 }
          : {
            data: [
              {
                id: 201,
                name: 'Mouse gamer RGB',
                price: 99000,
                approvalStatus: 'PENDING',
                commerce: { name: 'Nissei' },
                category: { name: 'Accesorios' },
                description: 'Mouse con iluminación RGB',
              },
            ],
            pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
          })
        : { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.route('**/api/reports/reviews/filtered**', async (route) => {
      const isCount = new URL(route.request().url()).searchParams.get('limit') === '1';
      const payload = isCount
        ? { filteredReviewReports: { meta: { total: 4 }, data: [] } }
        : {
          filteredReviewReports: {
            meta: { total: 1, page: 1, limit: 5, total_pages: 1 },
            data: [{ id_review_report: 501, reason: 'SPAM', product_review: { product: { name: 'Mouse gamer RGB' } } }],
          },
        };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.route('**/api/admin/stores/pending**', async (route) => {
      const isCount = new URL(route.request().url()).searchParams.get('limit') === '1';
      const payload = isCount
        ? { total: 5 }
        : {
          data: [
            {
              id_store: 301,
              name: 'Tienda Demo',
              store_category: { name: 'Tecnología' },
              user: { name: 'Ana Pérez' },
              email: 'ana@demo.com',
              phone: '0981000000',
              description: 'Comercio de prueba',
              created_at: '2026-03-22T10:00:00.000Z',
            },
          ],
          pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
        };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.route('**/api/reports/products/filtered**', async (route) => {
      const isCount = new URL(route.request().url()).searchParams.get('limit') === '1';
      const payload = isCount
        ? { filteredReports: { meta: { total: 3 }, data: [] } }
        : {
          filteredReports: {
            meta: { total: 1, page: 1, limit: 5, total_pages: 1 },
            data: [{ id_product_report: 701, report_status: 'PENDING', reason: 'DEFECTIVE', product: { name: 'Mouse gamer RGB' } }],
          },
        };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/admin/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('span', { hasText: /^Productos Pendientes$/ }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: /^Total Usuarios$/ }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: /^Comercios Registrados$/ }).first()).toBeVisible();
  });

  test('flujo admin: moderar productos y revisar detalles', async ({ page }) => {
    await page.route('**/api/admin/products**', async (route) => {
      const payload = {
        data: [
          {
            id: 201,
            name: 'Mouse gamer RGB',
            price: 99000,
            approvalStatus: 'PENDING',
            commerce: { name: 'Nissei' },
            category: { name: 'Accesorios' },
            description: 'Mouse con iluminación RGB',
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/admin/productos');

    await expect(page.getByRole('heading', { name: 'Moderación de Productos' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver detalle' }).first().click();
    await expect(page.getByText('Detalle del Producto')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mouse gamer RGB' })).toBeVisible();
  });

  test('flujo admin: aprobar comercio pendiente', async ({ page }) => {
    await page.route('**/api/admin/stores/pending**', async (route) => {
      const payload = {
        data: [
          {
            id_store: 301,
            name: 'Tienda Demo',
            store_category: { name: 'Tecnología' },
            user: { name: 'Ana Pérez' },
            email: 'ana@demo.com',
            phone: '0981000000',
            description: 'Comercio de prueba',
            created_at: '2026-03-22T10:00:00.000Z',
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/admin/comercios-pendientes');

    await expect(page.getByRole('heading', { name: 'Comercios por Aprobar' })).toBeVisible();
    await page.getByRole('button', { name: 'Evaluar' }).first().click();
    await expect(page.getByText('Detalles del Comercio')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tienda Demo' })).toBeVisible();
  });

  test('flujo comercio: moderar reclamo de producto', async ({ page }) => {
    let currentStatus = 'PENDING';

    await page.route('**/api/reports/products/filtered**', async (route) => {
      const url = new URL(route.request().url());
      const isCount = url.searchParams.get('limit') === '1';

      const payload = isCount
        ? { filteredReports: { meta: { total: 1 }, data: [] } }
        : {
          filteredReports: {
            meta: { total: 1, page: 1, limit: 8, total_pages: 1 },
            data: [
              {
                id_product_report: 701,
                report_status: currentStatus,
                reason: 'DEFECTIVE',
                description: 'Producto recibido con fallas',
                product: { id: 201, name: 'Mouse gamer RGB' },
                reporter: { name: 'Cliente Demo' },
                created_at: '2026-03-22T10:00:00.000Z',
              },
            ],
          },
        };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.route('**/api/reports/products/701', async (route) => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON() as { report_status?: string };
        currentStatus = body.report_status === 'IN_PROGRESS' ? 'IN_PROGRESS' : body.report_status ?? currentStatus;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ updatedReport: { id_product_report: 701, report_status: currentStatus } }),
        });
      }
    });

    await page.goto('/comercio/claims');

    await expect(page.getByRole('heading', { name: 'Reclamos sobre tus productos' })).toBeVisible();
    await page.getByRole('button', { name: 'Tomar reclamo (en curso)' }).click();
    await expect(page.locator('textarea[placeholder="Nota al resolver o rechazar (obligatoria)"]')).toBeVisible();
  });

  test('flujo cliente: reportar producto y comentario', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: null, name: 'Cliente Demo', role: 'CUSTOMER' } }),
      });
    });

    await page.route('**/products/reviews/101', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            {
              id: 101,
              customerName: 'Cliente Demo',
              rating: 5,
              comment: 'Excelente producto',
              isVerified: true,
              date: '2026-03-22T10:00:00.000Z',
            },
          ],
          stats: { averageRating: 5 },
        }),
      });
    });

    await page.route('**/api/reports/products/check**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasReport: false, reportId: null }),
      });
    });

    await page.route('**/api/reports/products/reasons**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { value: 'DEFECTIVE', label: 'Producto en mal estado' },
          { value: 'OTHER', label: 'Otro' },
        ]),
      });
    });

    await page.route('**/api/reports/products', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ report: { id_product_report: 901 } }),
        });
      }
    });

    await page.route('**/api/reports/reviews/101', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ report: { id_review_report: 801 } }),
        });
      }
    });

    await page.goto('/producto-detalle/101');
    await expect(page.getByRole('button', { name: 'Agregar al carrito' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Más opciones' })).toBeVisible();
    await page.getByRole('button', { name: 'Más opciones' }).click();
    await page.getByRole('menuitem', { name: 'Reportar producto' }).click();
    await expect(page.getByRole('dialog', { name: 'Reportar producto' })).toBeVisible();
    await page.locator('#report-reason').selectOption('DEFECTIVE');
    await page.locator('#report-desc').fill('Reclamo de prueba');
    await page.getByRole('button', { name: 'Enviar' }).click();
    //await expect(page.getByText('Reporte enviado')).toBeVisible();

    await page.goto('/comentarios/101');
    await expect(page.getByRole('heading', { name: 'Comentarios' })).toBeVisible();
    await page.getByRole('button', { name: 'Reportar' }).first().click();
    await expect(page.getByRole('heading', { name: 'Reportar comentario' })).toBeVisible();
    await page.getByLabel('Spam').check();
    await page.getByRole('button', { name: 'Enviar reporte' }).click();
    //await expect(page.getByText('Reporte enviado. Gracias por ayudarnos a mejorar la comunidad.')).toBeVisible();
  });





  //--------------------------Tests E2E del QA Leo--------------------------

  //OM-479: [FE] Fix 'Mis Pedidos' (Comercio)

  const installCommerceOrdersMock = async (
    page: Page,
    options: {
      order: Record<string, unknown>;
      getStatus: () => string;
      setStatus: (status: string) => void;
      hasAssignment?: boolean;
    },
  ) => {
    await page.route('**/api/orders/store/1**', async (route) => {
      const url = new URL(route.request().url());
      const requestedStatuses = (url.searchParams.get('order_status') ?? '')
        .split(',')
        .map((status) => status.trim())
        .filter(Boolean);
      const currentStatus = options.getStatus();
      const responseOrder = { ...options.order, status: currentStatus };
      const shouldReturnOrder = requestedStatuses.length === 0 || requestedStatuses.includes(currentStatus);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orders: shouldReturnOrder ? [responseOrder] : [],
          total: shouldReturnOrder ? 1 : 0,
          page: Number(url.searchParams.get('page') ?? 1),
          limit: Number(url.searchParams.get('limit') ?? 10),
          total_page: 1,
        }),
      });
    });

    await page.route('**/api/orders/*/status', async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON() as { order_status?: string };
        if (body.order_status) {
          options.setStatus(body.order_status);
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Estado actualizado' }),
        });
        return;
      }

      await route.fallback();
    });

    if (options.hasAssignment) {
      await page.route('**/api/orders/*/assignment', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            has_assignment: true,
            delivery: { id: 77, name: 'Repartidor Demo' },
          }),
        });
      });
    }
  };

  //OM-479
  test('flujo comercio: aceptar pedido pendiente y moverlo a seguimiento', async ({ page }) => {
    let currentStatus = 'PENDING';

    await installCommerceOrdersMock(page, {
      order: {
        id: 9001,
        total: 125000,
        notes: 'Retiro en tienda',
        createdAt: '2026-05-05T10:00:00.000Z',
        address: null,
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: (status) => {
        currentStatus = status;
      },
    });

    await page.goto('/comercio/pedidos');

    await expect(page.getByRole('heading', { name: 'Pedidos Pendientes' })).toBeVisible();
    await expect(page.getByText('#ORD-9001')).toBeVisible();

    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('No tenés pedidos pendientes.')).toBeVisible();

    await page.getByRole('button', { name: 'Seguimiento' }).click();
    await expect(page.getByRole('heading', { name: 'Seguimiento de Pedidos' })).toBeVisible();
    await expect(page.getByText('ORD-9001')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Marcar como Enviado' })).toBeVisible();
  });

  //OM-479
  test('flujo comercio: rechazar pedido pendiente', async ({ page }) => {
    let currentStatus = 'PENDING';

    await installCommerceOrdersMock(page, {
      order: {
        id: 9002,
        total: 89900,
        notes: 'Pedido cancelable',
        createdAt: '2026-05-05T11:00:00.000Z',
        address: null,
        items: [{ id: 1, quantity: 2 }],
      },
      getStatus: () => currentStatus,
      setStatus: (status) => {
        currentStatus = status;
      },
    });

    await page.goto('/comercio/pedidos');

    await expect(page.getByText('#ORD-9002')).toBeVisible();
    await page.getByRole('button', { name: 'Rechazar' }).click();

    await expect(page.getByText('No tenés pedidos pendientes.')).toBeVisible();
    await expect(page.getByText('#ORD-9002')).not.toBeVisible();
  });

  //OM-479
  test("flujo comercio: reflejar pedido entregado en historial", async ({ page }) => {
    let currentStatus = 'SHIPPED';

    await installCommerceOrdersMock(page, {
      order: {
        id: 9003,
        total: 219900,
        notes: 'Pedido con delivery asignado',
        createdAt: '2026-05-05T12:00:00.000Z',
        address: { city: 'Asuncion', region: 'Central' },
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: (status) => {
        currentStatus = status;
      },
      hasAssignment: true,
    });

    await page.goto('/comercio/pedidos');

    await page.getByRole('button', { name: 'Seguimiento' }).click();
    await expect(page.getByText('ORD-9003')).toBeVisible();
    await expect(page.getByText('Enviado')).toBeVisible();

    currentStatus = 'DELIVERED';

    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page.getByRole('heading', { name: 'Historial de Pedidos' })).toBeVisible();
    await expect(page.getByText('#OM-9003')).toBeVisible();
    // Buscar el badge de estado 'Entregado' con un selector más específico
    await expect(page.locator('span').filter({ hasText: 'Entregado' }).first()).toBeVisible();
  });

  //OM-479
  test('flujo comercio: validar botones deshabilitados durante acción', async ({ page }) => {
    let currentStatus = 'PENDING';

    await installCommerceOrdersMock(page, {
      order: {
        id: 9004,
        total: 95500,
        notes: 'Test de deshabilitación',
        createdAt: '2026-05-06T10:00:00.000Z',
        address: null,
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: (status) => {
        currentStatus = status;
      },
    });

    // Override route con delay manual sin bloquear el test
    let requestIntercepted = false;
    await page.route('**/api/orders/*/status', async (route) => {
      if (route.request().method() === 'PATCH') {
        requestIntercepted = true;
        const body = route.request().postDataJSON() as { order_status?: string };
        if (body.order_status) {
          currentStatus = body.order_status;
        }
        // Delay mínimo para capturar el estado de carga sin bloquear el test
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Estado actualizado' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/comercio/pedidos');

    const aceptarBtn = page.getByRole('button', { name: 'Aceptar' });
    await expect(aceptarBtn).toBeVisible();
    await expect(aceptarBtn).toBeEnabled();

    await aceptarBtn.click();

    const aceptandoBtn = page.getByRole('button', { name: 'Aceptando...' });
    await expect(aceptandoBtn).toBeVisible({ timeout: 5000 });
    await expect(aceptandoBtn).toBeDisabled();
  });

  //OM-479
  test('flujo comercio: manejo de errores en aceptar/rechazar', async ({ page }) => {
    let currentStatus = 'PENDING';

    await installCommerceOrdersMock(page, {
      order: {
        id: 9005,
        total: 72300,
        notes: 'Test de error',
        createdAt: '2026-05-06T11:00:00.000Z',
        address: null,
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: (status) => {
        currentStatus = status;
      },
    });

    await page.route('**/api/orders/*/status', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { message: 'No se pudo actualizar el estado del pedido. Intenta de nuevo.' },
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/comercio/pedidos');

    await expect(page.getByText('#ORD-9005')).toBeVisible();
    const estadoInicial = currentStatus;

    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('No se pudo actualizar el estado del pedido. Intenta de nuevo.')).toBeVisible();

    await expect(page.getByText('#ORD-9005')).toBeVisible();
    expect(currentStatus).toBe(estadoInicial);
  });

  //OM-485
  // Mostrar ventana de calificación del delivery al iniciar sesión.
  test('flujo cliente: mostrar ventana de calificación del delivery al iniciar sesión', async ({ page }) => {
    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, role: 'CUSTOMER' } }),
      });
    });

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo' } }),
      });
    });

    await page.route('**/api/orders/pending-delivery-reviews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { orderId: 123, storeName: 'Nissei', deliveryName: 'Juan' },
        ]),
      });
    });

    await page.goto('/login');

    await page.getByPlaceholder('tu@correo.com').fill('cliente@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('form button[type="submit"]').click();

    await expect(page).toHaveURL('/homepage');

    await expect(page.getByRole('heading', { name: 'Califica al delivery' })).toBeVisible();
    await expect(page.getByText('Pedido #123 de Nissei')).toBeVisible();
  });

  //OM-485
  test('flujo cliente: calificar delivery desde la ventana emergente', async ({ page }) => {
    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, role: 'CUSTOMER' } }),
      });
    });

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo' } }),
      });
    });

    await page.route('**/api/orders/pending-delivery-reviews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ orderId: 123, storeName: 'Nissei', deliveryName: 'Juan' }]),
      });
    });

    let postCalled = false;
    await page.route('**/api/orders/123/delivery-review', async (route) => {
      if (route.request().method() === 'POST') {
        postCalled = true;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
        return;
      }
      await route.fallback();
    });

    await page.goto('/login');
    await page.getByPlaceholder('tu@correo.com').fill('cliente@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: 'Califica al delivery' })).toBeVisible();

    await page.getByRole('button', { name: 'Calificar con 5 estrellas' }).click();
    await page.getByPlaceholder('Cuéntanos cómo fue el servicio del delivery').fill('Excelente servicio');

    await page.getByRole('button', { name: 'Enviar calificación' }).click();

    await expect(page.getByRole('heading', { name: 'Califica al delivery' })).not.toBeVisible();
    if (!postCalled) throw new Error('No se llamó al endpoint POST de delivery-review');
  });

  //OM-485
  test('flujo cliente: cerrar la ventana de calificación sin enviar', async ({ page }) => {
    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, role: 'CUSTOMER' } }),
      });
    });

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo' } }),
      });
    });

    await page.route('**/api/orders/pending-delivery-reviews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ orderId: 124, storeName: 'Nissei', deliveryName: 'María' }]),
      });
    });

    let postCalled = false;
    await page.route('**/api/orders/*/delivery-review', async (route) => {
      if (route.request().method() === 'POST') {
        postCalled = true;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
        return;
      }
      await route.fallback();
    });

    await page.goto('/login');
    await page.getByPlaceholder('tu@correo.com').fill('cliente@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: 'Califica al delivery' })).toBeVisible();

    await page.getByRole('button', { name: 'Ahora no' }).click();
    await expect(page.getByRole('heading', { name: 'Califica al delivery' })).not.toBeVisible();
    if (postCalled) throw new Error('Se llamó al endpoint POST al cerrar el modal sin enviar');
  });


  //OM-497
  // este test ya no funciona en webkit porque WebKit no ejecuta el prellenado de campos de la misma forma que Chromium
  // Flujo para convertirse en delivery
  test('flujo cliente: registrarse, iniciar sesion y convertirse en delivery', async ({ page }) => {
    // Variable reactiva para simular que tras el POST /api/deliveries/register
    // el backend actualiza la sesión y ahora el usuario es DELIVERY
    let deliveryRegistered = false;

    // Session usada en login
    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7 } }),
      });
    });

    // session/user-session debe cambiar su role dinámicamente según deliveryRegistered
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      const user = deliveryRegistered
        ? { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Cliente Demo' }
        : { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user }) });
    });

    // Perfil usuario (getCurrentUserForDeliveryForm -> fetchUserProfile)
    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'Cliente Demo', email: 'cliente@test.com', phone: '0981000000', role: 'CUSTOMER' }),
      });
    });

    // POST para registrar como delivery
    await page.route('**/api/deliveries/register', async (route) => {
      if (route.request().method() === 'POST') {
        deliveryRegistered = true;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id_delivery: 5 }) });
        return;
      }
      await route.fallback();
    });

    // Registrar cuenta 
    await page.goto('/login');
    await page.getByRole('button', { name: 'Registrarse' }).click();
    await page.getByPlaceholder('Tu nombre').fill('Cliente Demo');
    await page.getByPlaceholder('tu@correo.com').fill('cliente@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('input[name="confirmPassword"]').fill('12345678');
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // Iniciar sesión
    await page.locator('form button[type="submit"]').click();

    // Ir a la página "Quiero ser delivery"
    await page.goto('/quiero-ser-delivery');

    // Modal debe estar visible
    await expect(page.getByRole('heading', { name: 'Quiero ser delivery' })).toBeVisible();

    // Rellenar teléfono y seleccionar vehículo
    await page.getByPlaceholder('+54 9 11 2345-6789').fill('0981000000');
    await page.locator('#delivery-vehicle').selectOption('AUTOMOVIL');

    // Confirmar (trigger POST -> deliveryRegistered = true)
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // El modal cierra y redirige a homepage (comportamiento actual)
    await expect(page).toHaveURL('/homepage');

    await page.route('**/api/deliveries/5', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id_delivery: 5,
            fk_user: 7,
            delivery_status: 'INACTIVE',
            vehicle_type: 'CAR',
            phone: '0981000000',
            zone: null,
            schedule: null,
            rating: 0,
            total_deliveries: 0,
            total_reviews: 0,
            created_at: new Date().toISOString(),
          }),
        });
      }
    });
    // Navegar manualmente al perfil del delivery para validar que el registro fue exitoso
    await page.goto('/delivery/perfil');

    // Sidebar Panel Delivery debe estar presente
    await expect(page.getByText('Panel Delivery')).toBeVisible();
    await expect(page.getByText('Mi Perfil')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Perfil del Delivery' })).toBeVisible({ timeout: 5000 });
  });

  //OM-497
  test('flujo delivery: visualizar sidebar del panel', async ({ page }) => {
    // Session como DELIVERY
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo' } }) });
    });

    // Perfil de usuario
    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' }) });
    });

    // Navegar al panel delivery
    await page.goto('/delivery');

    // Debe redirigir a /delivery/perfil y mostrar sidebar
    await expect(page).toHaveURL(/\/delivery\/perfil/);
    await expect(page.getByText('Panel Delivery')).toBeVisible();
    await expect(page.getByText('Mi Perfil')).toBeVisible();
    await expect(page.getByText('Órdenes')).toBeVisible();
    await expect(page.getByText('Historial')).toBeVisible();
  });

  //OM-497

  //OM-486
  test('flujo cliente: abrir modal de delivery desde el navbar', async ({ page }) => {
    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, role: 'CUSTOMER' } }),
      });
    });

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo', email: 'cliente@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id_user: 7,
          name: 'Cliente Demo',
          email: 'cliente@test.com',
          phone: '0981000000',
          role: 'CUSTOMER',
        }),
      });
    });

    await page.route('**/api/users/7/carts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/homepage');

    await expect(page.getByRole('link', { name: 'Quiero ser delivery' })).toBeVisible();
    await page.getByRole('link', { name: 'Quiero ser delivery' }).click();

    await expect(page).toHaveURL('/quiero-ser-delivery');
    await expect(page.getByRole('heading', { name: 'Quiero ser delivery' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeVisible();
  });

  //OM-486
  test('flujo cliente: validar formulario y registrar como delivery', async ({ page }) => {
    let deliveryRegistered = false;

    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, role: 'CUSTOMER' } }),
      });
    });

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      const user = deliveryRegistered
        ? { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Cliente Demo', email: 'cliente@test.com' }
        : { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo', email: 'cliente@test.com' };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id_user: 7,
            name: 'Cliente Demo',
            email: 'cliente@test.com',
            phone: '0981000000',
            role: 'CUSTOMER',
          }),
        });
        return;
      }

      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id_user: 7, phone: '0981000000' }),
        });
        return;
      }

      await route.fallback();
    });

    await page.route('**/api/users/7/carts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/deliveries/register', async (route) => {
      if (route.request().method() === 'POST') {
        deliveryRegistered = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id_delivery: 5, message: 'Registrado como delivery' }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/quiero-ser-delivery');

    await expect(page.getByRole('heading', { name: 'Quiero ser delivery' })).toBeVisible();

    await page.getByPlaceholder('+54 9 11 2345-6789').fill('123');
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page.getByText('Ingresá al menos 8 dígitos; solo números y símbolos habituales (+, espacio, guiones, paréntesis)')).toBeVisible();

    await page.getByPlaceholder('+54 9 11 2345-6789').fill('0981000000');
    await page.locator('#delivery-vehicle').selectOption('AUTOMOVIL');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page).toHaveURL('/homepage');

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Cliente Demo', email: 'cliente@test.com' } }),
      });
    });

    await page.route('**/api/deliveries/5', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id_delivery: 5,
            delivery_status: 'INACTIVE',
            vehicle_type: 'CAR',
            coverage_city: 'Asunción',
            coverage_region: 'Central',
            coverage_radius_km: 12,
            availability_notes: 'Lunes a Viernes',
            average_rating: 0,
            total_deliveries: 0,
            reviews_count: 0,
            created_at: new Date().toISOString(),
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/delivery/perfil');
    await expect(page).toHaveURL('/delivery/perfil');
    await expect(page.getByRole('heading', { name: 'Perfil del Delivery' })).toBeVisible();
    await expect(page.getByText('Cliente Demo')).toBeVisible();
    await expect(page.getByText('0981000000')).toBeVisible();
    expect(deliveryRegistered).toBe(true);
  });
  test('flujo delivery: visualizar datos en mi perfil', async ({ page }) => {
    // Session DELIVERY con id_delivery
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo', email: 'delivery@test.com' } }) });
    });

    // Perfil usuario
    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000' }) });
    });

    // Perfil de delivery (getDeliveryProfile)
    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'AVAILABLE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 12,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.8,
      total_deliveries: 42,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDeliveryProfile) });
    });

    await page.goto('/delivery/perfil');

    await expect(page.getByText('Perfil del Delivery')).toBeVisible();
    await expect(page.getByText('Delivery Demo')).toBeVisible();
    await expect(page.getByText('delivery@test.com')).toBeVisible();
    await expect(page.getByText('0981000000')).toBeVisible();
    await expect(page.getByText('CAR')).toBeVisible();
    await expect(page.getByText('Asunción')).toBeVisible();
  });

  // OM-325
  // Toggle de estado del delivery
  test('flujo delivery: activar disponibilidad', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo' } }) });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' }) });
    });

    // Perfil de delivery inicialmente INACTIVE
    const mockDeliveryProfileUnavailable = {
      id_delivery: 5,
      delivery_status: 'INACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 12,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.8,
      total_deliveries: 42,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDeliveryProfileUnavailable) });
    });

    let patchCalled = false;
    let patchBody = null;
    await page.route('**/api/deliveries/5/status', async (route) => {
      patchCalled = true;
      patchBody = route.request().postData();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Estado actualizado' }) });
    });

    await page.goto('/delivery/perfil');

    await expect(page.getByRole('button', { name: 'Conectarme' })).toBeVisible();

    await page.getByRole('button', { name: 'Conectarme' }).click();

    // UI debe reflejar inmediatamente el cambio
    await expect(page.getByText('Disponible')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Desconectarme' })).toBeVisible();

    expect(patchCalled).toBe(true);
    const parsed = patchBody ? JSON.parse(patchBody) : {};
    expect(parsed.delivery_status === 'ACTIVE' || parsed.delivery_status === 'AVAILABLE').toBeTruthy();
  });

  // OM-325
  test('flujo delivery: desactivar disponibilidad', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo' } }) });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' }) });
    });

    // Perfil de delivery inicialmente ACTIVE
    const mockDeliveryProfileAvailable = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 12,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.8,
      total_deliveries: 42,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDeliveryProfileAvailable) });
    });

    let patchCalled = false;
    let patchBody = null;
    await page.route('**/api/deliveries/5/status', async (route) => {
      patchCalled = true;
      patchBody = route.request().postData();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Estado actualizado' }) });
    });

    await page.goto('/delivery/perfil');

    await expect(page.getByText('Disponible')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Desconectarme' })).toBeVisible();

    await page.getByRole('button', { name: 'Desconectarme' }).click();

    // UI debe reflejar inmediatamente el cambio a no disponible
    await expect(page.getByText('No disponible').or(page.getByText('Inactivo'))).toBeVisible();
    await expect(page.getByRole('button', { name: 'Conectarme' })).toBeVisible();

    expect(patchCalled).toBe(true);
    const parsed = patchBody ? JSON.parse(patchBody) : {};
    expect(parsed.delivery_status === 'INACTIVE' || parsed.delivery_status === 'UNAVAILABLE').toBeTruthy();
  });

  // OM-325
  test('flujo delivery: manejo de error al cambiar estado', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo' } }) });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' }) });
    });

    const mockDeliveryProfileAvailable = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 12,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.8,
      total_deliveries: 42,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDeliveryProfileAvailable) });
    });

    await page.route('**/api/deliveries/5/status', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Error interno' }) });
    });

    await page.goto('/delivery/perfil');

    // Estado inicial: disponible
    await expect(page.getByText('Disponible')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Desconectarme' })).toBeVisible();

    // Intenta desconectar, falla y redirige a pantalla de error
    await page.getByRole('button', { name: 'Desconectarme' }).click();

    // Debe redirigir a la pantalla de error 500
    await expect(page).toHaveURL('/error/500');
  });

  // OM-325
  test('flujo delivery: prevenir concurrencia con bloqueo de boton', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo' } }) });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' }) });
    });

    const mockDeliveryProfileAvailable = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 12,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.8,
      total_deliveries: 42,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDeliveryProfileAvailable) });
    });

    let patchRequestCount = 0;
    await page.route('**/api/deliveries/5/status', async (route) => {
      patchRequestCount++;
      // Agregar delay para simular latencia de red
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Estado actualizado' }) });
    });

    await page.goto('/delivery/perfil');

    // Estado inicial: disponible
    await expect(page.getByText('Disponible')).toBeVisible();
    const desconectarBtn = page.getByRole('button', { name: 'Desconectarme' });
    await expect(desconectarBtn).toBeVisible();

    //primer click para desconectar
    await desconectarBtn.click();

    const loadingBtn = page.getByRole('button', { name: '...' });
    await expect(loadingBtn).toBeVisible();
    await expect(loadingBtn).toBeDisabled();


    // Esperar a que se complete la primera solicitud
    await page.waitForTimeout(800);

    // Solo debe haberse enviado 1 request al servidor (prevención de concurrencia)
    expect(patchRequestCount).toBe(1);
  });

  // OM-327
  const installDeliveryOrdersMock = async (
    page: Page,
    options: {
      assignments: Array<{
        id_delivery_assignment: number;
        order: {
          id_order: number;
          order_status?: string;
          total?: number;
          shipping_distance_km?: number;
          created_at?: string;
          user?: { id_user?: number; name?: string; phone?: string; avatar_url?: string | null };
          store?: { name?: string };
          order_items?: Array<{ product?: { name?: string }; quantity?: number }>;
          address?: { address?: string; city?: string; region?: string } | null;
        };
      }>;
      responseStatus?: number;
      responseBody?: Record<string, unknown>;
    },
  ) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id_user: 7, name: 'Delivery Demo', role: 'DELIVERY', id_delivery: 5 },
        }),
      });
    });

    await page.unroute('**/api/deliveries/*/assignments');
    await page.route('**/api/deliveries/*/assignments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          delivery_assignments: options.assignments,
          delivery: { id_delivery: 5 },
        }),
      });
    });

    await page.unroute('**/api/assignments/orders/*/delivery-response');
    await page.route('**/api/assignments/orders/*/delivery-response', async (route) => {
      const status = options.responseStatus ?? 200;
      const body = options.responseBody ?? { message: 'ok' };
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  };

  // OM-327
  test('flujo delivery: Cargar pantalla de pedidos para aceptar', async ({ page }) => {
    await installDeliveryOrdersMock(page, {
      assignments: [
        {
          id_delivery_assignment: 9001,
          order: {
            id_order: 8001,
            order_status: 'PENDING',
            total: 5000,
            shipping_distance_km: 3.2,
            created_at: '2026-05-05T10:00:00.000Z',
            user: { id_user: 123, name: 'Cliente Uno', phone: '0981 123 456' },
            store: { name: 'Nissei' },
            order_items: [{ product: { name: 'Producto A' }, quantity: 1 }],
            address: { address: 'Calle Falsa 123', city: 'Asuncion', region: 'Central' },
          },
        },
      ],
    });

    await page.goto('/delivery/order');

    await expect(page.getByRole('heading', { name: 'Pedidos para aceptar' })).toBeVisible();
    await expect(page.getByText('Nissei')).toBeVisible();
    await expect(page.getByText('Cliente Uno')).toBeVisible();
  });

  // OM-327
  test('flujo delivery: Visualizar tarjeta de pedido', async ({ page }) => {
    await installDeliveryOrdersMock(page, {
      assignments: [
        {
          id_delivery_assignment: 9002,
          order: {
            id_order: 8002,
            order_status: 'PENDING',
            total: 15000,
            shipping_distance_km: 5.5,
            created_at: '2026-05-05T11:00:00.000Z',
            user: { id_user: 124, name: 'Cliente Dos', phone: '0981 555 666' },
            store: { name: 'TechPoint' },
            order_items: [
              { product: { name: 'Producto A' }, quantity: 1 },
              { product: { name: 'Producto B' }, quantity: 2 },
              { product: { name: 'Producto C' }, quantity: 1 },
            ],
            address: { address: 'Av. Siempre Viva 742', city: 'Luque', region: 'Central' },
          },
        },
      ],
    });

    await page.goto('/delivery/order');

    await expect(page.getByText('TechPoint')).toBeVisible();
    await expect(page.getByText('Cliente Dos')).toBeVisible();
    await expect(page.getByText('Producto A × 1')).toBeVisible();
    await expect(page.getByText('Producto B × 2')).toBeVisible();
    await expect(page.getByText('+1 más')).toBeVisible();
    await expect(page.getByText('Av. Siempre Viva 742')).toBeVisible();
    await expect(page.getByText('Tiempo estimado:')).toBeVisible();
  });

  // OM-327
  test('flujo delivery: Aceptar pedido', async ({ page }) => {
    await installDeliveryOrdersMock(page, {
      assignments: [
        {
          id_delivery_assignment: 9003,
          order: {
            id_order: 8003,
            order_status: 'PENDING',
            total: 7800,
            shipping_distance_km: 2.1,
            created_at: '2026-05-05T12:00:00.000Z',
            user: { id_user: 125, name: 'Cliente Tres', phone: '0981 777 888' },
            store: { name: 'Nissei' },
            order_items: [{ product: { name: 'Producto X' }, quantity: 1 }],
            address: { address: 'Bº Jardín 45', city: 'Asuncion', region: 'Central' },
          },
        },
      ],
    });

    await page.goto('/delivery/order');

    const acceptBtn = page.getByRole('button', { name: 'Aceptar' });
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    await expect(page.getByText('Pedido aceptado.')).toBeVisible();
  });

  // OM-327
  test('flujo delivery: Rechazar pedido', async ({ page }) => {
    await installDeliveryOrdersMock(page, {
      assignments: [
        {
          id_delivery_assignment: 9004,
          order: {
            id_order: 8004,
            order_status: 'PENDING',
            total: 22000,
            shipping_distance_km: 7.8,
            created_at: '2026-05-05T13:00:00.000Z',
            user: { id_user: 126, name: 'Cliente Cuatro', phone: '0981 999 000' },
            store: { name: 'Nissei' },
            order_items: [{ product: { name: 'Producto Y' }, quantity: 3 }],
            address: { address: 'Calle Secundaria 2', city: 'Capiata', region: 'Central' },
          },
        },
      ],
    });

    await page.goto('/delivery/order');

    const rejectBtn = page.getByRole('button', { name: 'Rechazar' });
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();

    await expect(page.getByText('Pedido rechazado.')).toBeVisible();
  });

  // OM-327
  test('flujo delivery: Manejo de errores al aceptar/rechazar pedido', async ({ page }) => {
    await installDeliveryOrdersMock(page, {
      assignments: [
        {
          id_delivery_assignment: 9005,
          order: {
            id_order: 8005,
            order_status: 'PENDING',
            total: 4200,
            shipping_distance_km: 1.2,
            created_at: '2026-05-05T14:00:00.000Z',
            user: { id_user: 127, name: 'Cliente Cinco', phone: '0981 111 222' },
            store: { name: 'TechPoint' },
            order_items: [{ product: { name: 'Producto Z' }, quantity: 1 }],
            address: { address: 'Zona 10', city: 'Asuncion', region: 'Central' },
          },
        },
      ],
      responseStatus: 500,
      responseBody: { message: 'Error interno del servidor' },
    });

    await page.goto('/delivery/order');

    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('Error interno del servidor')).toBeVisible();
  });

  // OM-327
  test('flujo delivery: Deshabilita botones durante la petición', async ({ page }) => {
    await installDeliveryOrdersMock(page, {
      assignments: [
        {
          id_delivery_assignment: 9006,
          order: {
            id_order: 8006,
            order_status: 'PENDING',
            total: 9900,
            shipping_distance_km: 4.4,
            created_at: '2026-05-05T15:00:00.000Z',
            user: { id_user: 128, name: 'Cliente Seis', phone: '0981 333 444' },
            store: { name: 'Nissei' },
            order_items: [{ product: { name: 'Producto W' }, quantity: 2 }],
            address: { address: 'Barrio Centro', city: 'Asuncion', region: 'Central' },
          },
        },
      ],
    });

    await page.unroute('**/api/assignments/orders/*/delivery-response');
    await page.route('**/api/assignments/orders/*/delivery-response', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok' }),
      });
    });

    await page.goto('/delivery/order');

    const acceptBtn = page.getByRole('button', { name: 'Aceptar' });
    const rejectBtn = page.getByRole('button', { name: 'Rechazar' });

    await acceptBtn.click();
    await expect(acceptBtn).toBeDisabled();
    await expect(rejectBtn).toBeDisabled();
  });

  // OM-323: Gestionar perfil y datos de contacto del delivery
  //  Navegar a editar perfil
  test('flujo delivery: navegar a editar perfil desde pantalla de perfil', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Delivery Demo', email: 'delivery@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000' }),
      });
    });

    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 12,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.8,
      total_deliveries: 42,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeliveryProfile),
      });
    });

    await page.goto('/delivery/perfil');

    await expect(page.getByRole('heading', { name: 'Perfil del Delivery' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar' })).toBeVisible();

    await page.getByRole('button', { name: 'Editar' }).click();

    await expect(page).toHaveURL('/delivery/perfil/editar');
  });

  // OM-323
  test('flujo delivery: formulario de edición prellenado con datos actuales', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Juan Delivery', email: 'juan@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'Juan Delivery', email: 'juan@test.com', phone: '0981555444' }),
      });
    });

    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'MOTORCYCLE',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 15,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.7,
      total_deliveries: 35,
      reviews_count: 8,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeliveryProfile),
      });
    });

    await page.goto('/delivery/perfil/editar');

    await expect(page.getByText('Editar Perfil')).toBeVisible();
    await expect(page.locator('input[value="Juan Delivery"]')).toBeVisible();
    await expect(page.locator('input[value="juan@test.com"]')).toBeVisible();
    await expect(page.locator('input[value="0981555444"]')).toBeVisible();
    await expect(page.getByRole('combobox')).toHaveValue('MOTORCYCLE');
  });

  // OM-323
  test('flujo delivery: upload de foto de perfil con vista previa', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Carlos Delivery', email: 'carlos@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'Carlos Delivery', email: 'carlos@test.com', phone: '0981777888' }),
      });
    });

    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'BICYCLE',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 8,
      availability_notes: 'Lunes a Sábado',
      average_rating: 4.9,
      total_deliveries: 58,
      reviews_count: 12,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeliveryProfile),
      });
    });

    await page.goto('/delivery/perfil/editar');

    await expect(page.getByText('Sin archivo seleccionado')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/avatar.png');

    await expect(page.getByText('avatar.png')).toBeVisible();
  });

  // OM-323
  test('flujo delivery: guardar cambios del perfil con PUT exitoso', async ({ page }) => {
    let putCalled = false;
    let putBody = null;

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'María Delivery', email: 'maria@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'María Delivery', email: 'maria@test.com', phone: '0981333222' }),
      });
    });

    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 20,
      availability_notes: 'Todos los días',
      average_rating: 4.6,
      total_deliveries: 72,
      reviews_count: 15,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeliveryProfile),
      });
    });

    await page.route('**/api/deliveries/5', async (route) => {
      if (route.request().method() === 'PUT') {
        putCalled = true;

        const postData = route.request().postData() ?? '';
        const getName = (field: string) => {
          const match = new RegExp(`name="${field}"\\s+([^\\s-][^\\r\\n]*)`, 's').exec(postData);
          return match?.[1]?.trim() ?? null;
        };
        putBody = {
          name: getName('name'),
          phone: getName('phone'),
          vehicleType: getName('vehicleType'),
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id_delivery: 5, message: 'Perfil actualizado' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/delivery/perfil/editar');

    await expect(page.locator('input[value="María Delivery"]')).toBeVisible();

    // Cambiar nombre, teléfono y vehículo
    const nameInput = page.locator('#delivery-name');
    await nameInput.clear();
    await nameInput.fill('María Actualizada');

    const phoneInput = page.locator('#delivery-phone');
    await phoneInput.clear();
    await phoneInput.fill('0981999777');

    await page.getByRole('combobox').selectOption('MOTORCYCLE');

    // Guardar cambios
    await page.locator('button', { hasText: 'Actualizar Perfil' }).click();

    // Verificar que se llamó a PUT
    await page.waitForTimeout(500);
    expect(putCalled).toBe(true);
    if (putBody) {
      const parsedBody = putBody as Record<string, unknown>;
      expect(parsedBody.name).toBe('María Actualizada');
      expect(parsedBody.phone).toBe('0981999777');
      expect(parsedBody.vehicleType).toBe('MOTORCYCLE');
    }

    // Verificar toast de éxito
    await expect(page.getByText('Perfil actualizado correctamente.')).toBeVisible();

    // Verificar redirección a perfil
    await expect(page).toHaveURL('/delivery/perfil');
  });

  // OM-323
  test('flujo delivery: validar campos obligatorios del perfil', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Pedro Delivery', email: 'pedro@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'Pedro Delivery', email: 'pedro@test.com', phone: '0981222333' }),
      });
    });

    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 18,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.5,
      total_deliveries: 50,
      reviews_count: 10,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeliveryProfile),
      });
    });

    await page.goto('/delivery/perfil/editar');

    // Borrar nombre
    const nameInput = page.locator('#delivery-name');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();

    await page.locator('button', { hasText: 'Actualizar Perfil' }).click();

    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();

    // Restaurar nombre y borrar teléfono
    await nameInput.fill('Pedro Delivery');

    const phoneInput = page.locator('#delivery-phone');
    await phoneInput.clear();

    await page.locator('button', { hasText: 'Actualizar Perfil' }).click();

    await expect(page.getByText('El teléfono es obligatorio.')).toBeVisible();
  });

  // OM-323
  test('flujo delivery: manejo de error al guardar perfil y estados de carga', async ({ page }) => {
    let putRequestCount = 0;

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_delivery: 5, role: 'DELIVERY', name: 'Ana Delivery', email: 'ana@test.com' } }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id_user: 7, name: 'Ana Delivery', email: 'ana@test.com', phone: '0981444555' }),
      });
    });

    const mockDeliveryProfile = {
      id_delivery: 5,
      delivery_status: 'ACTIVE',
      vehicle_type: 'CAR',
      coverage_city: 'Asunción',
      coverage_region: 'Central',
      coverage_radius_km: 15,
      availability_notes: 'Lunes a Viernes',
      average_rating: 4.5,
      total_deliveries: 45,
      reviews_count: 9,
      created_at: '2025-11-01T10:00:00.000Z'
    };

    await page.route('**/api/deliveries/5', async (route) => {
      if (route.request().method() === 'PUT') {
        putRequestCount++;
        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, 600));
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Error interno del servidor' } }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeliveryProfile),
      });
    });

    await page.goto('/delivery/perfil/editar');

    const nameInput = page.locator('#delivery-name');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill('Ana Actualizada');

    const guardarBtn = page.locator('button', { hasText: 'Actualizar Perfil' });
    await guardarBtn.click();

    // Verificar que el botón muestre estado de carga
    await expect(page.locator('button', { hasText: 'Guardando…' })).toBeVisible({ timeout: 5000 });

    // Buscar el texto en la página de error
    await expect(page.getByText('Error del servidor')).toBeVisible();

  });

  // OM-491: Reseñas de deliveries

  // Helper para instalar mocks de reseñas de delivery
  const installDeliveryReviewsMock = async (
    page: Page,
    options: {
      reviews: Array<{
        id: number;
        customerName: string;
        orderId: number;
        rating: number;
        comment: string;
        createdAt: string;
      }>;
      total: number;
    },
  ) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    await page.route(/\/api\/stores\/\d+\/deliveries\/\d+\/reviews/, async (route) => {
      const url = new URL(route.request().url());
      const minRating = url.searchParams.get('minRating');
      const maxRating = url.searchParams.get('maxRating');
      const search = url.searchParams.get('search');

      let filtered = [...options.reviews];

      if (search) {
        const searchNum = Number(search);
        filtered = filtered.filter(r => r.orderId === searchNum);
      }

      if (minRating && maxRating) {
        const min = Number(minRating);
        const max = Number(maxRating);
        filtered = filtered.filter(r => r.rating >= min && r.rating <= max);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: filtered,
          total: filtered.length,
        }),
      });
    });
  };

  // OM-491
  test('flujo comercio: visualizar reseñas de un delivery', async ({ page }) => {
    const mockReviews = [
      {
        id: 1,
        customerName: 'Cliente Uno',
        orderId: 1001,
        rating: 5,
        comment: 'Excelente entrega, llegó rápido',
        createdAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 2,
        customerName: 'Cliente Dos',
        orderId: 1002,
        rating: 4,
        comment: 'Muy bueno, sin problemas',
        createdAt: '2026-05-02T10:00:00.000Z',
      },
      {
        id: 3,
        customerName: 'Cliente Tres',
        orderId: 1003,
        rating: 5,
        comment: 'Perfecto, excelente servicio',
        createdAt: '2026-05-03T10:00:00.000Z',
      },
    ];

    await installDeliveryReviewsMock(page, {
      reviews: mockReviews,
      total: mockReviews.length,
    });

    await page.goto('/comercio/deliveries/resenas');

    await expect(page.getByRole('heading', { name: 'Reseñas de Repartidores' })).toBeVisible();

    // Ingresar ID del repartidor
    await page.locator('input[placeholder="Ej: 12"]').fill('5');

    // Aplicar filtros (sin búsqueda específica)
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Verificar que se cargaron las reseñas
    await expect(page.getByText('Cliente Uno')).toBeVisible();
    await expect(page.getByText('Cliente Dos')).toBeVisible();
    await expect(page.getByText('Cliente Tres')).toBeVisible();

    // Verificar que muestra la calificación promedio
    await expect(page.getByText('Calificación Promedio')).toBeVisible();
    await expect(page.getByText('4.7')).toBeVisible();

    // Verificar que muestra el total de reseñas
    await expect(page.getByText('Total Reseñas')).toBeVisible();
  });

  // OM-491
  test('flujo comercio: buscar reseñas por código de pedido', async ({ page }) => {
    const mockReviews = [
      {
        id: 1,
        customerName: 'Cliente A',
        orderId: 2001,
        rating: 5,
        comment: 'Entrega perfecta',
        createdAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 2,
        customerName: 'Cliente B',
        orderId: 2002,
        rating: 4,
        comment: 'Buena entrega',
        createdAt: '2026-05-02T10:00:00.000Z',
      },
      {
        id: 3,
        customerName: 'Cliente C',
        orderId: 2003,
        rating: 3,
        comment: 'Aceptable',
        createdAt: '2026-05-03T10:00:00.000Z',
      },
    ];

    await installDeliveryReviewsMock(page, {
      reviews: mockReviews,
      total: mockReviews.length,
    });

    await page.goto('/comercio/deliveries/resenas');

    // Ingresar ID del repartidor
    await page.locator('input[placeholder="Ej: 12"]').fill('1');

    // Ingresar código de pedido
    await page.locator('input[placeholder="Código de pedido"]').fill('2001');

    // Aplicar filtros
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Debe mostrar solo la reseña del pedido 2001
    await expect(page.getByText('Cliente A')).toBeVisible();
    await expect(page.getByText('Entrega perfecta')).toBeVisible();

    // No debe mostrar las otras reseñas
    await expect(page.getByText('Cliente B')).not.toBeVisible();
    await expect(page.getByText('Cliente C')).not.toBeVisible();

    // Verificar que el total es 1
    // Buscar dentro del contexto "Total Reseñas"
    const totalReviewsDiv = page.getByText('Total Reseñas').locator('..');
    await expect(totalReviewsDiv.locator('p').nth(1)).toContainText('1');
  });

  // OM-491
  test('flujo comercio: filtrar reseñas por estrellas', async ({ page }) => {
    const mockReviews = [
      {
        id: 1,
        customerName: 'Usuario 1',
        orderId: 3001,
        rating: 5,
        comment: 'Excelente',
        createdAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 2,
        customerName: 'Usuario 2',
        orderId: 3002,
        rating: 4,
        comment: 'Muy bueno',
        createdAt: '2026-05-02T10:00:00.000Z',
      },
      {
        id: 3,
        customerName: 'Usuario 3',
        orderId: 3003,
        rating: 5,
        comment: 'Perfecto',
        createdAt: '2026-05-03T10:00:00.000Z',
      },
      {
        id: 4,
        customerName: 'Usuario 4',
        orderId: 3004,
        rating: 3,
        comment: 'Regular',
        createdAt: '2026-05-04T10:00:00.000Z',
      },
    ];

    await installDeliveryReviewsMock(page, {
      reviews: mockReviews,
      total: mockReviews.length,
    });

    await page.goto('/comercio/deliveries/resenas');

    // Ingresar ID del repartidor
    await page.locator('input[placeholder="Ej: 12"]').fill('1');

    // Seleccionar filtro de 5 estrellas
    await page.locator('select').selectOption('5');

    // Aplicar filtros
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Debe mostrar solo las reseñas de 5 estrellas
    await expect(page.getByText('Usuario 1')).toBeVisible();
    await expect(page.getByText('Excelente')).toBeVisible();
    await expect(page.getByText('Usuario 3')).toBeVisible();
    await expect(page.getByText('Perfecto')).toBeVisible();

    // No debe mostrar reseñas de otras calificaciones
    await expect(page.getByText('Usuario 2')).not.toBeVisible();
    await expect(page.getByText('Usuario 4')).not.toBeVisible();
  });

  // OM-491
  test('flujo comercio: buscar y filtrar reseñas simultáneamente', async ({ page }) => {
    const mockReviews = [
      {
        id: 1,
        customerName: 'User Alfa',
        orderId: 4001,
        rating: 5,
        comment: 'Excelente servicio',
        createdAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 2,
        customerName: 'User Beta',
        orderId: 4002,
        rating: 5,
        comment: 'Muy satisfecho',
        createdAt: '2026-05-02T10:00:00.000Z',
      },
      {
        id: 3,
        customerName: 'User Gamma',
        orderId: 4001,
        rating: 4,
        comment: 'Buena entrega',
        createdAt: '2026-05-03T10:00:00.000Z',
      },
      {
        id: 4,
        customerName: 'User Delta',
        orderId: 4003,
        rating: 5,
        comment: 'Perfecto',
        createdAt: '2026-05-04T10:00:00.000Z',
      },
    ];

    await installDeliveryReviewsMock(page, {
      reviews: mockReviews,
      total: mockReviews.length,
    });

    await page.goto('/comercio/deliveries/resenas');

    // Ingresar ID del repartidor
    await page.locator('input[placeholder="Ej: 12"]').fill('1');

    // Ingresar código de pedido
    await page.locator('input[placeholder="Código de pedido"]').fill('4001');

    // Seleccionar filtro de 5 estrellas
    await page.locator('select').selectOption('5');

    // Aplicar filtros
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Debe mostrar solo la reseña que coincide con ambos filtros (pedido 4001 + 5 estrellas)
    await expect(page.getByText('User Alfa')).toBeVisible();
    await expect(page.getByText('Excelente servicio')).toBeVisible();

    // No debe mostrar otras reseñas
    await expect(page.getByText('User Beta')).not.toBeVisible();
    await expect(page.getByText('User Gamma')).not.toBeVisible();
    await expect(page.getByText('User Delta')).not.toBeVisible();

    // Verificar que el total es 1
    const totalReviewsDiv = page.getByText('Total Reseñas').locator('..');
    await expect(totalReviewsDiv.locator('p').nth(1)).toContainText('1');
  });

  // OM-491
  test('flujo comercio: mostrar estado vacío cuando no hay resultados', async ({ page }) => {
    const mockReviews = [
      {
        id: 1,
        customerName: 'Reviewer One',
        orderId: 5001,
        rating: 4,
        comment: 'Bueno',
        createdAt: '2026-05-01T10:00:00.000Z',
      },
      {
        id: 2,
        customerName: 'Reviewer Two',
        orderId: 5002,
        rating: 3,
        comment: 'Regular',
        createdAt: '2026-05-02T10:00:00.000Z',
      },
    ];

    await installDeliveryReviewsMock(page, {
      reviews: mockReviews,
      total: mockReviews.length,
    });

    await page.goto('/comercio/deliveries/resenas');

    // Ingresar ID del repartidor
    await page.locator('input[placeholder="Ej: 12"]').fill('5');

    // Buscar un pedido que no existe
    await page.locator('input[placeholder="Código de pedido"]').fill('9999');

    // Aplicar filtros
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Debe mostrar el estado vacío
    await expect(page.getByText('No hay reseñas para los filtros aplicados.')).toBeVisible();

    // Verificar que el total es 0
    await expect(page.locator('p', { hasText: /^0$/ })).toBeVisible();

    // No debe mostrar ninguna reseña
    await expect(page.getByText('Reviewer One')).not.toBeVisible();
    await expect(page.getByText('Reviewer Two')).not.toBeVisible();
  });
});
