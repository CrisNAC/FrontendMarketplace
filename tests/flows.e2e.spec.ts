import { test, expect, Page, Route } from '@playwright/test';

type Store = {
  id_store: number;
  name: string;
  store_category?: { name: string };
};

type DeliveryAssignmentItem = {
  id_delivery_assignment: number;
  order: {
    id_order: number;
    user: { name: string };
    order_status: string;
    created_at: string;
  };
};

type DeliveryPutBody = {
  name: string | null;
  phone: string | null;
  vehicleType: string | null;
};

/** Nav lateral del panel delivery. */
const deliverySidebar = (page: Page) => page.getByRole('navigation');

/** Título del panel (fuera de <nav>; filtra el duplicado del header móvil oculto en desktop). */
const deliveryPanelTitle = (page: Page) => page.getByText('Panel Delivery').filter({ visible: true });

/** Misma regla que BecomeDeliveryModal: al menos 8 dígitos en el teléfono enviado por PUT. */
const isValidDeliveryPhone = (phone: string) => /^(?=(?:.*\d){8,})[\d\s+().\-]+$/.test(phone.trim());

async function fulfillUserProfilePut(route: Route, successBody: Record<string, unknown>) {
  let payload: { phone?: unknown };
  try {
    payload = route.request().postDataJSON() as { phone?: unknown };
  } catch {
    payload = {};
  }
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
  if (!phone || !isValidDeliveryPhone(phone)) {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 400, message: 'phone inválido o faltante' } }),
    });
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ...successBody, phone }),
  });
}

const mockStores: Store[] = [
  { id_store: 1, name: 'Nissei', store_category: { name: 'Tecnología' } },
  { id_store: 2, name: 'TechPoint', store_category: { name: 'Electrónica' } },
];


const mockCartProduct = {
  id: 101,
  name: 'Apple iPhone 17 Pro A3256 Dual',
  price: 13290000,
  isOffer: false,
  stock: 8,
};

const mockActiveCart = {
  id: 1,
  storeId: 1,
  commerce: { id: 1, name: 'Nissei' },
  status: 'ACTIVE',
  items: [
    {
      id: 1,
      quantity: 1,
      product: mockCartProduct,
    },
  ],
};

const createBaseProduct = (productId: number) => ({
  id_product: productId,
  name: 'Producto prueba',
  description: 'Desc prueba',
  price: 100,
  quantity: 5,
  visible: true,
  isOffer: false,
  stock: 8,
  offerPrice: null,
  images: [],
  categoryId: 1,
  categories: [{ id: 1, name: 'Cat' }],
  store: { id_store: 1, name: 'Comercio' },
  product_tag_relations: [],
  tags: [],
});

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
        store_status: 'ACTIVE',
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

    await expect(page).toHaveURL('/');
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

    await expect(page).toHaveURL('/');

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
    await page.getByRole('checkbox', { name: 'Celulares' }).click();

    await page.getByRole('button', { name: 'oferta' }).click();
    await page.getByRole('button', { name: 'Crear Producto' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Producto creado')).toBeVisible();
  });

  test('flujo descubrimiento: homepage, busqueda, comparar precios y abrir detalle', async ({ page }) => {
    await page.goto('/');

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
    await page.waitForLoadState('networkidle');
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
                product: mockCartProduct,
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
                    product: mockCartProduct,
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

  //tests de OM-495
  test('flujo lista de deseos: crear nueva lista desde el modal de guardar', async ({ page }) => {
    await page.route('**/api/users/*/wishlists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Mi lista', itemCount: 1, createdAt: new Date().toISOString() },
          ]),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 2, name: 'Nueva lista', itemCount: 0, createdAt: new Date().toISOString() }),
        });
      }
    });

    await page.route('**/api/users/*/wishlists/2/items', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Producto agregado a la lista' }),
        });
      }
    });

    await page.route('**/api/users/*/wishlists/2/items', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 2,
            name: 'Nueva lista',
            items: [
              {
                id: 10,
                quantity: 1,
                product: { ...mockCartProduct, originalPrice: 13290000, offerPrice: null },
              },
            ],
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.goto('/producto-detalle/101');
    await expect(page.getByRole('button', { name: 'Agregar al carrito' })).toBeEnabled({ timeout: 10000 });

    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    //validar campo vacio
    await page.getByRole('button', { name: 'Crear' }).click();
    await expect(page.getByText('Ingresá un nombre para la lista')).toBeVisible();
    //ingresar nombre y crear lista
    await page.getByPlaceholder('Nombre de la lista').fill('Nueva lista');
    await page.getByRole('button', { name: 'Crear' }).click();

    await expect(page.getByText('Producto agregado a "Nueva lista"')).toBeVisible();
  });

  test('flujo cliente: seleccionar lista existente al guardar producto', async ({ page }) => {
    await page.route('**/api/users/*/wishlists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Mi lista', itemCount: 1, createdAt: new Date().toISOString() },
            { id: 2, name: 'Regalos', itemCount: 0, createdAt: new Date().toISOString() },
          ]),
        });
        return;
      }
    });

    await page.route('**/api/users/*/wishlists/2/items', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Producto agregado a la lista' }),
        });
      }
    });

    await page.goto('/producto-detalle/101');
    await expect(page.getByRole('button', { name: 'Agregar al carrito' })).toBeEnabled({ timeout: 10000 });

    await page.getByRole('button', { name: 'Agregar a favoritos' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Regalos' }).click();
    await expect(page.getByText('Producto agregado a la lista')).toBeVisible();
  });

  test('flujo cliente: eliminar lista desde wishlist', async ({ page }) => {
    await page.route('**/api/users/*/wishlists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Mi lista', itemCount: 1, createdAt: new Date().toISOString() },
          ]),
        });
        return;
      }
    });

    await page.route('**/api/users/*/wishlists/1/items', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Mi lista',
            items: [
              {
                id: 10,
                quantity: 2,
                product: { ...mockCartProduct, originalPrice: 13290000, offerPrice: null },
              },
            ],
          }),
        });
      }
    });

    await page.route('**/api/users/*/wishlists/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Lista eliminada' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/wishlist');
    await expect(page.getByRole('heading', { name: 'Lista de deseos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar lista' })).toBeVisible();
    await expect(page.getByText('Apple iPhone 17 Pro A3256 Dual')).toBeVisible();

    // Interceptar el dialog nativo ANTES de hacer click
    page.once('dialog', async (dialog) => {
      await dialog.accept(); // simula click en "Aceptar"
    });

    await page.getByRole('button', { name: 'Eliminar lista' }).click();
    await expect(page.getByText('Lista eliminada')).toBeVisible();
  });


  //hasta aca los de OM-495

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
                product: { ...mockCartProduct, originalPrice: 13290000, offerPrice: null },
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
                    product: { ...mockCartProduct, originalPrice: 13290000 },
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
            logo: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            created_at: '2026-03-22T10:00:00.000Z',
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/admin/comercios-pendientes');

    await expect(page.getByRole('heading', { name: 'Comercios por Aprobar' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Logo de Tienda Demo' })).toBeVisible();
    await page.getByRole('button', { name: 'Evaluar' }).first().click();
    await expect(page.getByText('Detalles del Comercio')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tienda Demo' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Logo de Tienda Demo' }).last()).toBeVisible();
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
    // Restaurar sesión de SELLER al inicio del test
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });
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
    // Restaurar sesión de SELLER al inicio del test
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });
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
    // Restaurar sesión de SELLER al inicio del test
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });
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
    // Restaurar sesión de SELLER al inicio del test
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });
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
    // Restaurar sesión de SELLER al inicio del test
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });
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

    await expect(page).toHaveURL('/');

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

    // Perfil usuario (getCurrentUserForDeliveryForm -> fetchUserProfile / actualizar teléfono)
    await page.route('**/api/users/7', async (route) => {
      if (route.request().method() === 'PUT') {
        await fulfillUserProfilePut(route, {
          id_user: 7,
          name: 'Cliente Demo',
          email: 'cliente@test.com',
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Cliente Demo', email: 'cliente@test.com', phone: '0981000000', role: 'CUSTOMER' } }),
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

    // Teléfono y vehículo
    await page.getByPlaceholder('+54 9 11 2345-6789').fill('0981000000');
    await page.locator('#delivery-vehicle').selectOption('AUTOMOVIL');

    // Confirmar (trigger POST -> deliveryRegistered = true)
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Redirige al panel del delivery tras registro exitoso (OM-533)
    await expect(page).toHaveURL(/\/delivery\/perfil/);

    // Sidebar Panel Delivery debe estar presente
    await expect(deliveryPanelTitle(page)).toBeVisible();
    await expect(deliverySidebar(page).getByText('Mi Perfil')).toBeVisible();

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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' } }) });
    });

    // Navegar al panel delivery
    await page.goto('/delivery');

    // Debe redirigir a /delivery/perfil y mostrar sidebar
    await expect(page).toHaveURL(/\/delivery\/perfil/);
    await expect(deliveryPanelTitle(page)).toBeVisible();
    await expect(deliverySidebar(page).getByText('Mi Perfil')).toBeVisible();
    await expect(deliverySidebar(page).getByText('Órdenes')).toBeVisible();
    await expect(deliverySidebar(page).getByText('Historial')).toBeVisible();
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
          success: true, data: {
            id_user: 7,
            name: 'Cliente Demo',
            email: 'cliente@test.com',
            phone: '0981000000',
            role: 'CUSTOMER',
          }
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

    await page.goto('/');

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
      if (route.request().method() === 'PUT') {
        await fulfillUserProfilePut(route, {
          id_user: 7,
          name: 'Cliente Demo',
          email: 'cliente@test.com',
        });
        return;
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true, data: {
              id_user: 7,
              name: 'Cliente Demo',
              email: 'cliente@test.com',
              phone: '0981000000',
              role: 'CUSTOMER',
            }
          }),
        });
        return;
      }

      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id_user: 7, phone: '0981000000' } }),
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

    await page.goto('/quiero-ser-delivery');

    await expect(page.getByRole('heading', { name: 'Quiero ser delivery' })).toBeVisible();

    await page.getByPlaceholder('+54 9 11 2345-6789').fill('0981000000');
    await page.locator('#delivery-vehicle').selectOption('AUTOMOVIL');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(page).toHaveURL(/\/delivery\/perfil/);
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', addresses: [{ city: 'Asunción' }] } }) });
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
    await expect(page.getByText('Automóvil')).toBeVisible();
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' } }) });
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
    let patchBody: string | null = null;
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' } }) });
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
    let patchBody: string | null = null;
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' } }) });
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000', role: 'DELIVERY' } }) });
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
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Delivery Demo', email: 'delivery@test.com', phone: '0981000000' } }),
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
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Juan Delivery', email: 'juan@test.com', phone: '0981555444' } }),
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
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Carlos Delivery', email: 'carlos@test.com', phone: '0981777888' } }),
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
    let putBody: DeliveryPutBody | null = null;

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
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'María Delivery', email: 'maria@test.com', phone: '0981333222' } }),
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
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Pedro Delivery', email: 'pedro@test.com', phone: '0981222333' } }),
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
        body: JSON.stringify({ success: true, data: { id_user: 7, name: 'Ana Delivery', email: 'ana@test.com', phone: '0981444555' } }),
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
    // Mock sesión
    await page.route('**/api/session/user-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    // Mock listado de deliveries (pagina /comercio/delivery)
    await page.route('**/api/stores/1/deliveries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { total: 1, available: 1, inDelivery: 0, avgRating: 4.8 },
          deliveries: [
            {
              id: 5,
              user: { id: 5, name: 'Repartidor X', email: 'rx@test.com', phone: '098100000' },
              status: 'AVAILABLE',
              completedDeliveries: 10,
              successRate: 90,
              avgRating: 4.8,
              reviewCount: 2,
            },
          ],
        }),
      });
    });

    // Capturar y mockear la petición de reseñas específica del delivery
    let requestedDeliveryId: number | null = null;
    await page.route(/\/api\/stores\/\d+\/deliveries\/\d+\/reviews/, async route => {
      const m = route.request().url().match(/\/deliveries\/(\d+)\/reviews/);
      requestedDeliveryId = m ? Number(m[1]) : null;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            { id: 1, customerName: 'Cliente A', orderId: 1001, rating: 5, comment: 'Excelente', createdAt: '2026-05-01T10:00:00.000Z' },
            { id: 2, customerName: 'Cliente B', orderId: 1002, rating: 4, comment: 'Bien', createdAt: '2026-05-02T10:00:00.000Z' },
          ],
          total: 2,
        }),
      });
    });

    await page.goto('/comercio/delivery');

    await expect(page.getByRole('heading', { name: 'Gestión de Repartidores' })).toBeVisible();

    await page.getByRole('button', { name: 'Ver reseñas' }).first().click();

    // Aserciones: URL, título con el nombre del delivery, reseñas visibles, y request contra el delivery correcto
    await expect(page).toHaveURL(/\/comercio\/deliveries\/resenas\?deliveryId=5/);
    await expect(page.getByRole('heading', { name: 'Reseñas de Repartidor X' })).toBeVisible();
    await expect(page.getByText('Cliente A')).toBeVisible();
    await expect(page.getByText('Cliente B')).toBeVisible();
    expect(requestedDeliveryId).toBe(5);
  });

  // OM-491
  test('flujo comercio: buscar reseñas por código de pedido', async ({ page }) => {
    //mock de sesion
    await page.route('**/api/session/user-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    // Mock listado de deliveries
    await page.route('**/api/stores/1/deliveries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { total: 1, available: 1, inDelivery: 0, avgRating: 4.8 },
          deliveries: [
            {
              id: 5,
              user: { id: 5, name: 'Repartidor X', email: 'rx@test.com', phone: '098100000' },
              status: 'AVAILABLE',
              completedDeliveries: 10,
              successRate: 90,
              avgRating: 4.8,
              reviewCount: 3,
            },
          ],
        }),
      });
    });

    // Mock reviews endpoint y capturar parámetro de búsqueda
    let requestedSearch: string | null = null;
    await page.route(/\/api\/stores\/\d+\/deliveries\/\d+\/reviews/, async route => {
      const url = new URL(route.request().url());
      requestedSearch = url.searchParams.get('search');
      const all = [
        { id: 1, customerName: 'Cliente A', orderId: 1001, rating: 5, comment: 'Excelente', createdAt: '2026-05-01T10:00:00.000Z' },
        { id: 2, customerName: 'Cliente B', orderId: 1002, rating: 4, comment: 'Bien', createdAt: '2026-05-02T10:00:00.000Z' },
        { id: 3, customerName: 'Cliente C', orderId: 1003, rating: 5, comment: 'Perfecto', createdAt: '2026-05-03T10:00:00.000Z' },
      ];
      const filtered = requestedSearch ? all.filter(r => String(r.orderId) === requestedSearch) : all;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: filtered, total: filtered.length }),
      });
    });

    await page.goto('/comercio/delivery');
    await page.getByRole('button', { name: 'Ver reseñas' }).first().click();

    await expect(page).toHaveURL(/\/comercio\/deliveries\/resenas\?deliveryId=5/);
    await expect(page.getByRole('heading', { name: /Reseñas de Repartidor X/ })).toBeVisible();

    // buscar por código de pedido 1002
    await page.getByPlaceholder(/N.*de pedido/i).fill('1002');

    // Aplicar filtros
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Debe mostrar solo la reseña del pedido 1002 y la petición incluyó el parámetro de búsqueda correcto
    await expect(page.getByText('Cliente B')).toBeVisible();
    await expect(page.getByText('Cliente A')).not.toBeVisible();
    await expect(page.getByText('Cliente C')).not.toBeVisible();
    expect(requestedSearch).toBe('1002');
  });

  // OM-491
  test('flujo comercio: filtrar reseñas por estrellas', async ({ page }) => {
    await page.route('**/api/session/user-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    // Mock listado de deliveries
    await page.route('**/api/stores/1/deliveries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { total: 1, available: 1, inDelivery: 0, avgRating: 4.8 },
          deliveries: [
            {
              id: 5,
              user: { id: 5, name: 'Repartidor X', email: 'rx@test.com', phone: '098100000' },
              status: 'AVAILABLE',
              completedDeliveries: 10,
              successRate: 90,
              avgRating: 4.8,
              reviewCount: 3,
            },
          ],
        }),
      });
    });

    // Mock reviews endpoint y capturar min/max rating
    let requestedMin: string | null = null;
    let requestedMax: string | null = null;
    await page.route(/\/api\/stores\/\d+\/deliveries\/\d+\/reviews/, async route => {
      const url = new URL(route.request().url());
      requestedMin = url.searchParams.get('minRating');
      requestedMax = url.searchParams.get('maxRating');

      const all = [
        { id: 1, customerName: 'Cliente 5A', orderId: 1101, rating: 5, comment: 'Excelente', createdAt: '2026-05-01T10:00:00.000Z' },
        { id: 2, customerName: 'Cliente 4', orderId: 1102, rating: 4, comment: 'Bien', createdAt: '2026-05-02T10:00:00.000Z' },
        { id: 3, customerName: 'Cliente 5B', orderId: 1103, rating: 5, comment: 'Perfecto', createdAt: '2026-05-03T10:00:00.000Z' },
      ];

      const filtered = (requestedMin && requestedMax)
        ? all.filter(r => r.rating >= Number(requestedMin) && r.rating <= Number(requestedMax))
        : all;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: filtered, total: filtered.length }),
      });
    });

    // Navegar desde la lista y abrir reseñas
    await page.goto('/comercio/delivery');
    await page.getByRole('button', { name: 'Ver Reseñas' }).first().click();

    await expect(page).toHaveURL(/\/comercio\/deliveries\/resenas\?deliveryId=5/);
    await expect(page.getByRole('heading', { name: /Reseñas de Repartidor X/ })).toBeVisible();

    // Seleccionar filtro de 5 estrellas y aplicar
    await page.selectOption('select', '5');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Aserciones: solo aparecen reseñas con 5 estrellas y la petición incluyó min/max = 5
    await expect(page.getByText('Cliente 5A')).toBeVisible();
    await expect(page.getByText('Cliente 5B')).toBeVisible();
    await expect(page.getByText('Cliente 4')).not.toBeVisible();
    expect(requestedMin).toBe('5');
    expect(requestedMax).toBe('5');
  });

  // OM-491
  test('flujo comercio: buscar y filtrar reseñas simultáneamente', async ({ page }) => {
    await page.route('**/api/session/user-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    // Mock listado de deliveries
    await page.route('**/api/stores/1/deliveries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { total: 1, available: 1, inDelivery: 0, avgRating: 4.8 },
          deliveries: [
            {
              id: 5,
              user: { id: 5, name: 'Repartidor X', email: 'rx@test.com', phone: '098100000' },
              status: 'AVAILABLE',
              completedDeliveries: 10,
              successRate: 90,
              avgRating: 4.8,
              reviewCount: 3,
            },
          ],
        }),
      });
    });

    // Mock reviews endpoint y capturar parámetros
    let requestedSearch: string | null = null;
    let requestedMin: string | null = null;
    let requestedMax: string | null = null;
    await page.route(/\/api\/stores\/\d+\/deliveries\/\d+\/reviews/, async route => {
      const url = new URL(route.request().url());
      requestedSearch = url.searchParams.get('search');
      requestedMin = url.searchParams.get('minRating');
      requestedMax = url.searchParams.get('maxRating');

      const all = [
        { id: 1, customerName: 'Cliente 5A', orderId: 1101, rating: 5, comment: 'Excelente', createdAt: '2026-05-01T10:00:00.000Z' },
        { id: 2, customerName: 'Cliente 4', orderId: 1102, rating: 4, comment: 'Bien', createdAt: '2026-05-02T10:00:00.000Z' },
        { id: 3, customerName: 'Cliente 5B', orderId: 1103, rating: 5, comment: 'Perfecto', createdAt: '2026-05-03T10:00:00.000Z' },
      ];

      const filtered = all
        .filter(r => !requestedSearch || String(r.orderId) === requestedSearch)
        .filter(r => !(requestedMin && requestedMax) || (r.rating >= Number(requestedMin) && r.rating <= Number(requestedMax)));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: filtered, total: filtered.length }),
      });
    });

    // Navegar desde la lista y abrir reseñas
    await page.goto('/comercio/delivery');
    await page.getByRole('button', { name: 'Ver Reseñas' }).first().click();

    await expect(page).toHaveURL(/\/comercio\/deliveries\/resenas\?deliveryId=5/);
    await expect(page.getByRole('heading', { name: /Reseñas de Repartidor X/ })).toBeVisible();

    // Aplicar búsqueda por código y filtro de 5 estrellas
    await page.getByPlaceholder(/N.*de pedido/i).fill('1103');
    await page.selectOption('select', '5');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    // Aserciones
    await expect(page.getByText('Cliente 5B')).toBeVisible();
    await expect(page.getByText('Cliente 5A')).not.toBeVisible();
    await expect(page.getByText('Cliente 4')).not.toBeVisible();
    expect(requestedSearch).toBe('1103');
    expect(requestedMin).toBe('5');
    expect(requestedMax).toBe('5');
  });

  // OM-491
  test('flujo comercio: mostrar estado vacío cuando no hay resultados', async ({ page }) => {
    await page.route('**/api/session/user-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    // Mock listado de deliveries
    await page.route('**/api/stores/1/deliveries', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { total: 1, available: 1, inDelivery: 0, avgRating: 4.8 },
          deliveries: [
            {
              id: 5,
              user: { id: 5, name: 'Repartidor X', email: 'rx@test.com', phone: '098100000' },
              status: 'AVAILABLE',
              completedDeliveries: 10,
              successRate: 90,
              avgRating: 4.8,
              reviewCount: 3,
            },
          ],
        }),
      });
    });

    // Mock reviews endpoint con filtros que devuelven vacío
    await page.route(/\/api\/stores\/\d+\/deliveries\/\d+\/reviews/, async route => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search');
      const minRating = url.searchParams.get('minRating');

      // Si hay búsqueda o filtro muy restrictivo, devolver vacío
      if (search === '9999' || minRating === '1') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ reviews: [], total: 0 }),
        });
        return;
      }

      // Caso por defecto: devolver reseñas
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [
            { id: 1, customerName: 'Cliente A', orderId: 1101, rating: 5, comment: 'Excelente', createdAt: '2026-05-01T10:00:00.000Z' },
          ],
          total: 1,
        }),
      });
    });

    // Navegar desde la lista y abrir reseñas
    await page.goto('/comercio/delivery');
    await page.getByRole('button', { name: 'Ver Reseñas' }).first().click();

    await expect(page).toHaveURL(/\/comercio\/deliveries\/resenas\?deliveryId=5/);

    // Aplicar búsqueda con código inexistente para generar estado vacío
    await page.getByPlaceholder(/N.* de pedido/i).fill('9999');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();

    //se muestra el estado vacío
    await expect(page.getByText('No hay reseñas para los filtros aplicados.')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Reseñas/ })).toBeVisible();
  });
  // OM-488: Historial de delivery



  // OM-488
  test('flujo delivery: Ver historial de pedidos', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 42, role: 'DELIVERY', id_delivery: 99, name: 'Delivery Demo' }, success: true }),
      });
    });
    await page.route('**/api/assignments/**/orders**', async (route) => {
      const url = new URL(route.request().url());
      const pageParam = Number(url.searchParams.get('page') || '1');
      const assignment_status = url.searchParams.get('assignment_status') || '';
      const items = [
        { id_delivery_assignment: 1, order: { id_order: 555, user: { name: 'Cliente Uno' }, order_status: 'DELIVERED', created_at: '2026-05-01T10:00:00.000Z' } },
        { id_delivery_assignment: 2, order: { id_order: 556, user: { name: 'Cliente Dos' }, order_status: 'SHIPPED', created_at: '2026-05-02T12:00:00.000Z' } },
      ].filter(it => {
        if (assignment_status && it.order.order_status !== assignment_status) return false;
        return true;
      });
      const payload = { content: items, total_elements: items.length, total_pages: 1, page: pageParam, size: 10 };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/delivery/history');

    await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();

    await expect(page.getByRole('cell', { name: '#555' })).toBeVisible();

    await expect(page.getByRole('cell', { name: 'Cliente Uno' })).toBeVisible();

    await expect(page.locator('td span').filter({ hasText: 'Entregado' }).first()).toBeVisible();

    await expect(page.getByText(/Mostrando/)).toBeVisible();
  });

  // OM-488
  test('flujo delivery: Paginación funciona correctamente', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 42, role: 'DELIVERY', id_delivery: 99, name: 'Delivery Demo' }, success: true }),
      });
    });
    await page.route('**/api/assignments/**/orders**', async (route) => {
      const url = new URL(route.request().url());
      const pageParam = Number(url.searchParams.get('page') || '1');
      const assignment_status = url.searchParams.get('assignment_status') || '';
      const total = 25;
      const size = 10;
      const totalPages = Math.ceil(total / size);
      const start = (pageParam - 1) * size + 1;
      const end = Math.min(pageParam * size, total);
      const items: DeliveryAssignmentItem[] = [];
      for (let i = start; i <= end; i++) {
        items.push({
          id_delivery_assignment: i,
          order: { id_order: 1000 + i, user: { name: `Cliente ${i}` }, order_status: 'SHIPPED', created_at: '2026-05-01T10:00:00.000Z' },
        });
      }
      const filtered = assignment_status ? items.filter(it => it.order.order_status === assignment_status) : items;
      const payload = { content: filtered, total_elements: total, total_pages: totalPages, page: pageParam, size };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/delivery/history');

    await expect(page.getByRole('cell', { name: '#1001' })).toBeVisible();

    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByRole('cell', { name: '#1011' })).toBeVisible({ timeout: 2000 });

    await expect(page.getByText(/de 25 resultados/)).toBeVisible();
  });

  // OM-488
  test('flujo delivery: Filtrado por periodo y por estado', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 42, role: 'DELIVERY', id_delivery: 99, name: 'Delivery Demo' }, success: true }),
      });
    });
    await page.route('**/api/assignments/**/orders**', async (route) => {
      const url = new URL(route.request().url());
      const pageParam = Number(url.searchParams.get('page') || '1');
      const period = url.searchParams.get('period') || '';
      const assignment_status = url.searchParams.get('assignment_status') || '';
      const items: DeliveryAssignmentItem[] = [];
      if (period === '7d') {
        items.push({ id_delivery_assignment: 10, order: { id_order: 2001, user: { name: 'Reciente' }, order_status: 'DELIVERED', created_at: '2026-05-05T10:00:00.000Z' } });
      } else if (period === '1m') {
        items.push({ id_delivery_assignment: 11, order: { id_order: 2101, user: { name: 'Mes' }, order_status: 'SHIPPED', created_at: '2026-04-10T10:00:00.000Z' } });
      } else {
        items.push({ id_delivery_assignment: 12, order: { id_order: 2201, user: { name: 'Todo' }, order_status: 'PENDING', created_at: '2026-03-01T10:00:00.000Z' } });
      }
      const filtered = assignment_status ? items.filter(it => it.order.order_status === assignment_status) : items;
      const payload = { content: filtered, total_elements: filtered.length, total_pages: 1, page: pageParam, size: 10 };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    await page.goto('/delivery/history');

    await page.getByRole('button', { name: '7 días' }).click();
    await expect(page.getByRole('cell', { name: 'Reciente' })).toBeVisible();

    await page.getByRole('button', { name: 'Filtros' }).click().catch(() => { });
    await page.selectOption('select', 'DELIVERED');

    await expect(page.locator('td span').filter({ hasText: 'Entregado' }).first()).toBeVisible();
  });

  // OM-488
  test('flujo delivery: Estado vacío y manejo de error/carga', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 42, role: 'DELIVERY', id_delivery: 99, name: 'Delivery Demo' }, success: true }),
      });
    });
    let mockMode = 'empty';

    await page.route('**/api/assignments/**/orders**', async (route) => {
      if (mockMode === 'error') {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Server error' }) });
        return;
      }
      if (mockMode === 'delay') {
        await new Promise((res) => setTimeout(res, 300));
      }
      const payload = { content: [], total_elements: 0, total_pages: 1, page: 1, size: 10 };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
    });

    //Estado vacío
    await page.goto('/delivery/history');
    await expect(page.getByText('No hay pedidos que coincidan con los filtros.')).toBeVisible({ timeout: 5000 });

    // Error 500
    mockMode = 'error';
    await page.goto('/delivery/history');
    await expect(page.getByText('Error del servidor')).toBeVisible();

    // Loading spinner
    mockMode = 'delay';
    const historialPromise = page.waitForResponse('**/api/assignments/**/orders**');
    await page.goto('/delivery/history');
    await expect(page.getByText('Cargando historial…')).toBeVisible();
    await historialPromise; // esperar que termine la petición
  });

  // OM-321: Gestión de repartidores vinculados (Comercio)

  const installCommerceDeliveriesMock = async (
    page: Page,
    options?: {
      deliveries?: Array<{
        id: number;
        user: { id: number; name: string; email: string; phone?: string };
        status: 'AVAILABLE' | 'IN_DELIVERY' | 'UNAVAILABLE' | 'ASSIGNED' | string;
        completedDeliveries: number;
        successRate: number | null;
        avgRating: number | null;
        reviewCount: number;
      }>;
      stats?: {
        total: number;
        available: number;
        inDelivery: number;
        assigned?: number;
        avgRating: number | null;
      };
      deleteShouldFail?: boolean;
    },
  ) => {
    const deliveries =
      options?.deliveries ??
      [
        {
          id: 10,
          user: {
            id: 2,
            name: 'Juan Pérez',
            email: 'juan@delivery.com',
            phone: '+595971111111',
          },
          status: 'AVAILABLE',
          completedDeliveries: 156,
          successRate: 97.4,
          avgRating: 4.8,
          reviewCount: 3,
        },
        {
          id: 11,
          user: {
            id: 3,
            name: 'María González',
            email: 'maria@delivery.com',
            phone: '+595972222222',
          },
          status: 'IN_DELIVERY',
          completedDeliveries: 243,
          successRate: 99.2,
          avgRating: 4.9,
          reviewCount: 5,
        },
        {
          id: 12,
          user: {
            id: 4,
            name: 'Ana López',
            email: 'ana@delivery.com',
            phone: '+595973333333',
          },
          status: 'UNAVAILABLE',
          completedDeliveries: 87,
          successRate: 97,
          avgRating: null,
          reviewCount: 0,
        },
      ];

    let mutableDeliveries = [...deliveries];

    const stats =
      options?.stats ??
      {
        total: mutableDeliveries.length,
        available: mutableDeliveries.filter((d) => d.status === 'AVAILABLE').length,
        inDelivery: mutableDeliveries.filter((d) => d.status === 'IN_DELIVERY').length,
        assigned: mutableDeliveries.filter((d) => d.status === 'ASSIGNED').length,
        avgRating: 4.8,
      };

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' },
        }),
      });
    });

    await page.route('**/api/stores/1/deliveries', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            stats: {
              ...stats,
              total: mutableDeliveries.length,
              available: mutableDeliveries.filter((d) => d.status === 'AVAILABLE').length,
              inDelivery: mutableDeliveries.filter((d) => d.status === 'IN_DELIVERY').length,
            },
            deliveries: mutableDeliveries,
          }),
        });
        return;
      }
    });

    await page.route(/\/api\/stores\/1\/deliveries\/\d+$/, async (route) => {
      if (route.request().method() === 'DELETE') {
        if (options?.deleteShouldFail) {
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'No se pudo desvincular el repartidor.' }),
          });
          return;
        }

        const url = route.request().url();
        const deliveryId = Number(url.split('/').pop());
        mutableDeliveries = mutableDeliveries.filter((d) => d.id !== deliveryId);

        await route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });
  };

  // OM-321
  test('flujo comercio: cargar repartidores vinculados con stats y listado', async ({ page }) => {
    await installCommerceDeliveriesMock(page);

    await page.goto('/comercio/delivery');

    await expect(page.getByRole('heading', { name: 'Gestión de Repartidores' })).toBeVisible();

    // Stats superiores
    await expect(page.getByText('Disponibles')).toBeVisible();
    await expect(page.getByText('En Entrega', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Total Repartidores')).toBeVisible();
    await expect(page.getByText('Rating Promedio')).toBeVisible();

    // Verificar que se cargaron cards
    await expect(page.getByText('Juan Pérez')).toBeVisible();
    await expect(page.getByText('María González')).toBeVisible();
    await expect(page.getByText('Ana López')).toBeVisible();
    await expect(page.getByText('Cant. Entregas', { exact: true })).toHaveCount(3);
  });

  // OM-321
  test('flujo comercio: toggle entre vista cards y vista tabla', async ({ page }) => {
    await installCommerceDeliveriesMock(page);

    await page.goto('/comercio/delivery');

    await page.getByRole('button', { name: 'Tabla' }).click();

    // Headers de la tabla
    await expect(page.getByText('Nombre Completo')).toBeVisible();
    await expect(page.getByText('Estado').nth(1)).toBeVisible();
    await expect(page.getByText('Teléfono')).toBeVisible();
    await expect(page.getByText('Correo')).toBeVisible();
    await expect(page.getByText('Entregas')).toBeVisible();
    await expect(page.getByText('% Éxito')).toBeVisible();
    await expect(page.getByText('Calificación')).toBeVisible();

    await page.getByRole('button', { name: 'Cards' }).click();
    await expect(page.getByText('Nombre Completo')).not.toBeVisible();
    await expect(page.getByText('Juan Pérez')).toBeVisible();
  });



  // OM-321
  test('flujo comercio: abrir y cerrar modal de desvinculación', async ({ page }) => {
    await installCommerceDeliveriesMock(page);

    await page.goto('/comercio/delivery');

    await page.getByRole('button', { name: 'Eliminar' }).first().click();

    await expect(page.getByText('Desvincular repartidor')).toBeVisible();
    await expect(page.getByText(/Desvincular a/)).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.getByText('Desvincular repartidor')).not.toBeVisible();
  });

  // OM-321
  test('flujo comercio: desvincular repartidor y refrescar listado', async ({ page }) => {
    await installCommerceDeliveriesMock(page);

    await page.goto('/comercio/delivery');

    await expect(page.getByText('Juan Pérez')).toBeVisible();

    await page.getByRole('button', { name: 'Eliminar' }).first().click();
    await page.getByRole('button', { name: 'Desvincular' }).click();

    // El modal se cierra y el listado se recarga sin el delivery eliminado
    await expect(page.getByText('Desvincular repartidor')).not.toBeVisible();
    await expect(page.getByText('Juan Pérez')).not.toBeVisible();

    // Se mantiene el resto de deliveries
    await expect(page.getByText('María González')).toBeVisible();
    await expect(page.getByText('Ana López')).toBeVisible();
  });

  // OM-408: Agregar repartidor existente al comercio

  const installStoreDeliveriesSearchMock = async (
    page: Page,
    options: {
      deliveries?: Array<{
        id_user: number;
        name: string;
        email: string;
        phone?: string;
        total_deliveries?: number;
        success_rate?: number;
        average_rating?: number;
      }>;
      linkShouldFail?: boolean;
      linkErrorStatus?: number;
    } = {},
  ) => {
    const defaultDeliveries = [
      {
        id_user: 201,
        name: 'Juan Repartidor',
        email: 'juan.delivery@example.invalid',
        phone: '+595900111111',
        total_deliveries: 48,
        success_rate: 0.95,
        average_rating: 4.8,
      },
      {
        id_user: 202,
        name: 'María Entrega',
        email: 'maria.entrega@example.invalid',
        phone: '+595900222222',
        total_deliveries: 32,
        success_rate: 0.88,
        average_rating: 4.5,
      },
      {
        id_user: 203,
        name: 'Carlos Mensajería',
        email: 'carlos.msg@example.invalid',
        phone: '+595900333333',
        total_deliveries: 61,
        success_rate: 0.92,
        average_rating: 4.7,
      },
    ];

    const deliveriesToUse = options.deliveries ?? defaultDeliveries;

    // GET /api/deliveries/search - lista de repartidores disponibles
    // CAMBIO: agregado ** al final para matchear URLs con query params (?q=maria)
    await page.route('**/api/deliveries/search**', async (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q');

      if (!q) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(deliveriesToUse),
        });
        return;
      }

      // Filtrar por query (correo o teléfono)
      // FIX: phone es opcional, usar ?? '' para evitar TypeError
      const filtered = deliveriesToUse.filter(
        (d) =>
          d.email.toLowerCase().includes(q.toLowerCase()) ||
          (d.phone ?? '').includes(q),
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filtered),
      });
    });

    // GET /api/stores/:id/deliveries - lista de repartidores ya vinculados (devolver vacío para tests)
    // POST /api/stores/:id/deliveries - vincular repartidor
    // CAMBIO: agregado ** al final para matchear URLs con query params
    await page.route('**/api/stores/*/deliveries**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            stats: {
              total: 0,
              available: 0,
              inDelivery: 0,
              avgRating: null,
            },
            deliveries: [],
          }),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        if (options.linkShouldFail) {
          await route.fulfill({
            status: options.linkErrorStatus ?? 400,
            contentType: 'application/json',
            body: JSON.stringify({
              message:
                options.linkErrorStatus === 409
                  ? 'Ese repartidor ya está vinculado.'
                  : 'Error al vincular repartidor.',
            }),
          });
          return;
        }

        const body = route.request().postData();
        const { fk_user } = JSON.parse(body || '{}');

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id_delivery: 5000 + fk_user,
            fk_user,
            delivery_status: 'AVAILABLE',
            created_at: new Date().toISOString(),
          }),
        });
        return;
      }

      await route.fallback();
    });
  };

  // OM-408
  test('flujo comercio: navegar a pantalla Agregar Delivery', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page);
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /Agregar delivery/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /Agregar delivery/i }).first().click();

    await expect(page).toHaveURL('/comercio/delivery/agregar');
    await expect(page.getByRole('heading', { name: /Agregar delivery/i })).toBeVisible();
  });

  // OM-408
  test('flujo comercio: búsqueda por correo en tiempo real', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page);
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery/agregar');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/Filtrar por nombre, correo o teléfono/i);
    await expect(searchInput).toBeVisible();

    await page.waitForTimeout(300);

    await searchInput.fill('maria');
    await page.waitForTimeout(300);

    await expect(page.locator('text=María Entrega')).toBeVisible();
    await expect(page.getByText('maria.entrega@example.invalid')).toBeVisible();
  });

  // OM-408
  test('flujo comercio: búsqueda por teléfono en tiempo real', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page);
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery/agregar');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/Filtrar por nombre, correo o teléfono/i);
    await page.waitForTimeout(300);

    await searchInput.fill('+595900111111');
    await page.waitForTimeout(300);

    await expect(page.locator('text=Juan Repartidor')).toBeVisible();
    await expect(page.getByText('+595900111111')).toBeVisible();
  });

  // OM-408
  test('flujo comercio: tarjeta de resultado con datos completos', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page);
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery/agregar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await expect(page.locator('text=Juan Repartidor')).toBeVisible();

    await expect(page.locator('text=/Teléfono.*\\+595900111111/')).toBeVisible();
    await expect(page.locator('text=/Correo.*juan.delivery@example.invalid/')).toBeVisible();
    await expect(page.locator('text=/Entregas.*48/')).toBeVisible();
    await expect(page.locator('text=/% éxito.*95 %/')).toBeVisible();
    await expect(page.locator('text=/Calificación.*4.8/')).toBeVisible();

    await expect(page.locator("button:has-text('Agregar')").first()).toBeVisible();
  });

  // OM-408
  test('flujo comercio: agregar delivery con confirmación exitosa', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page);
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery/agregar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await page.locator("button:has-text('Agregar')").first().click();

    await expect(page.locator('dialog')).toBeVisible();
    await expect(page.getByText('¿Agregar a tu comercio?')).toBeVisible();

    await page.locator("button:has-text('Confirmar')").click();

    await expect(page.getByText(/Repartidor agregado|agregado/i)).toBeVisible();

    await page.waitForURL('/comercio/delivery');
    await expect(page).toHaveURL('/comercio/delivery');
  });

  // OM-408
  test('flujo comercio: error al agregar delivery (ya vinculado)', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page, { linkShouldFail: true, linkErrorStatus: 409 });
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery/agregar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await page.locator("button:has-text('Agregar')").first().click();
    await page.locator("button:has-text('Confirmar')").click();

    await expect(page.getByText(/ya está vinculado|No se pudo agregar/i)).toBeVisible();
  });

  // OM-408
  test('flujo comercio: cancelar modal de confirmación', async ({ page }) => {
    await installStoreDeliveriesSearchMock(page);
    await setupCommonApiMocks(page);

    await page.goto('/comercio/delivery/agregar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await page.locator("button:has-text('Agregar')").first().click();

    await expect(page.locator('dialog')).toBeVisible();

    await page.locator("button:has-text('Cancelar')").click();

    await expect(page.locator('dialog')).not.toBeVisible();
    await expect(page).toHaveURL('/comercio/delivery/agregar');
  });

  // OM-489

  test('flujo comercio: Listar deliveries elegibles y mostrarlos en modal', async ({ page }) => {
    // Restaurar sesión de SELLER
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    let currentStatus = 'PENDING';
    await installCommerceOrdersMock(page, {
      order: {
        id: 9011,
        total: 150000,
        notes: 'Pedido para asignación',
        createdAt: '2026-05-06T10:00:00.000Z',
        address: { address: 'Calle Falsa 123', city: 'Asuncion' },
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: () => { /* no-op */ },
    });

    // Mock del endpoint de deliveries: backend retorna solo deliveries elegibles (ACTIVE, sin asignaciones)
    await page.route('**/api/stores/1/orders/9011/deliveries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          available_deliveries: [
            { id_delivery: 11, name: 'Delivery Activo Uno', phone: '0991 111111' },
            { id_delivery: 12, name: 'Delivery Activo Dos', phone: '0992 222222' },
          ],
          delivery_address: { address: 'Calle Falsa 123', city: 'Asuncion' },
          order_id: 9011,
          order_status: 'PENDING',
        }),
      });
    });

    await page.goto('/comercio/pedidos');
    await expect(page.getByText('#ORD-9011')).toBeVisible();

    // Abrir modal de asignación
    await page.getByRole('button', { name: 'Asignar delivery' }).click();

    // Modal visible y lista con los deliveries retornados
    await expect(page.getByText('Delivery Activo Uno')).toBeVisible();
    await expect(page.getByText('Delivery Activo Dos')).toBeVisible();
  });

  // OM-489
  //Asignar delivery desde modal y POST /api/assignments
  test('flujo comercio: Asignar delivery desde modal con exito', async ({ page }) => {
    // Restaurar sesión SELLER
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    let currentStatus = 'PENDING';
    await installCommerceOrdersMock(page, {
      order: {
        id: 9020,
        total: 99000,
        notes: 'Pedido para prueba de asignación',
        createdAt: '2026-05-06T15:00:00.000Z',
        address: { address: 'Calle Test 55', city: 'Asuncion' },
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: () => { /* no-op */ },
    });

    // Mock GET deliveries (lista elegible)
    await page.route('**/api/stores/1/orders/9020/deliveries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          available_deliveries: [
            { id_delivery: 52, name: 'Delivery Selector', phone: '0995 555555' },
            { id_delivery: 53, name: 'Delivery Otra', phone: '0996 666666' },
          ],
          delivery_address: { address: 'Calle Test 55', city: 'Asuncion' },
          order_id: 9020,
          order_status: 'PENDING',
        }),
      });
    });

    // Capturamos el POST a /api/assignments
    let capturedBody: Record<string, unknown> | null = null;
    await page.route('**/api/assignments', async (route) => {
      if (route.request().method() === 'POST') {
        capturedBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Asignación creada', fk_order: 9020, fk_delivery: 52 }),
        });
        return;
      }
      await route.fallback();
    });

    // Ir a la página de pedidos del comercio y abrir modal
    await page.goto('/comercio/pedidos');
    await expect(page.getByText('#ORD-9020')).toBeVisible();
    await page.getByRole('button', { name: 'Asignar delivery' }).click();

    // Seleccionar el delivery y confirmars
    await page.getByText('Delivery Selector').click();
    await page.getByRole('button', { name: 'Asignar delivery' }).click();

    // Esperar que el modal se cierre
    await expect(page.getByRole('heading', { name: 'Asignar delivery' })).not.toBeVisible();

  });

  // OM-489
  test('flujo comercio: Sin deliveries disponibles muestra mensaje sin deliveries disponibles y boton Asignar desactivado', async ({ page }) => {
    // Restaurar sesión SELLER
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    let currentStatus = 'PENDING';
    await installCommerceOrdersMock(page, {
      order: {
        id: 9015,
        total: 45000,
        notes: 'Sin deliveries',
        createdAt: '2026-05-06T14:00:00.000Z',
        address: { address: 'Calle Vacia 0', city: 'Villarrica' },
        items: [{ id: 1, quantity: 1 }],
      },
      getStatus: () => currentStatus,
      setStatus: () => { /* no-op */ },
    });

    // Endpoint devuelve lista vacía
    await page.route('**/api/stores/1/orders/9015/deliveries', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          available_deliveries: [],
          delivery_address: { address: 'Calle Vacia 0', city: 'Villarrica' },
          order_id: 9015,
          order_status: 'PENDING',
        }),
      });
    });

    await page.goto('/comercio/pedidos');
    await expect(page.getByText('#ORD-9015')).toBeVisible();
    await page.getByRole('button', { name: 'Asignar delivery' }).click();

    // Debe mostrar mensaje de estado vacío y el botón principal debe estar deshabilitado
    await expect(page.getByText('No hay deliveries disponibles')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Asignar delivery' })).toBeDisabled();
  });

  // OM-490
  test('flujo delivery: finalizar pedido activo', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id_user: 7,
            name: 'Delivery Demo',
            role: 'DELIVERY',
            id_delivery: 5,
          },
        }),
      });
    });

    const assignmentId = 9005;
    const orderId = 8005;

    await page.route('**/api/assignments/deliveries/**/assignments**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id_delivery_assignment: 9005,
            order: {
              id_order: 8005,
              order_status: 'SHIPPED',
              total: 12500,
              created_at: '2026-05-05T13:00:00.000Z',
              user: {
                id_user: 123,
                name: 'Cliente Demo',
                phone: '0981 111 222',
                avatar_url: null,
              },
              store: { name: 'Nissei' },
              order_items: [{ product: { name: 'Producto A' }, quantity: 1 }],
              address: { address: 'Calle 1', city: 'Asunción', region: 'Central' },
            },
          },
        ]),
      });
    });

    await page.route(`**/api/assignments/${assignmentId}/complete`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Entrega finalizada correctamente',
          assignmentId,
          orderId,
          order_status: 'DELIVERED',
        }),
      });
    });

    await page.route('**/api/users/7', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true, data: {
            id_user: 7,
            name: 'Delivery Demo',
            email: 'delivery@test.com',
            phone: '0981 111 222',
            role: 'DELIVERY',
          }
        }),
      });
    });

    await page.goto('/delivery/pedidos');

    await expect(page.getByRole('heading', { name: 'Mis Pedidos en Curso' })).toBeVisible();
    await expect(page.getByText("#ORD-" + orderId)).toBeVisible();
    await expect(page.getByText('Cliente Demo')).toBeVisible();

    const finishButton = page.getByRole('button', { name: 'Finalizado' });
    await expect(finishButton).toBeVisible();
    await finishButton.click();

    await expect(page.getByText('Entrega finalizada correctamente')).toBeVisible();
    await expect(page.getByText('¡No tienes pedidos activos! Buen trabajo completando entregas.')).toBeVisible();
  });

  // OM-514 - Gestión de stock de productos

  test('flujo comercio: Editar stock disponible de un producto', async ({ page }) => {
    const productId = 101;


    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });


    await page.unroute('**/products/101');

    const baseProduct = createBaseProduct(productId);

    let putBody: any = null;
    let updatedProduct = { ...baseProduct };

    const handler = async (route: any) => {
      const req = route.request();
      if (req.method() === 'PUT') {
        const bodyText = await req.postData();
        putBody = bodyText ? JSON.parse(bodyText) : {};
        updatedProduct = {
          ...updatedProduct,
          quantity: putBody.quantity ?? updatedProduct.quantity,
          categoryId: putBody.categoryIds?.[0] ?? updatedProduct.categoryId,
          categories: putBody.categoryIds?.length
            ? putBody.categoryIds.map((id: number) => ({ id, name: `Cat ${id}` }))
            : updatedProduct.categories,
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(updatedProduct) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(updatedProduct) });
      }
    };

    await page.route(`**/products/${productId}`, handler);
    await page.route(`**/api/products/${productId}`, handler);

    await page.goto(`/comercio/productos/${productId}/editar`);

    // Esperar que el componente termina de cargar
    await expect(page.getByLabel('Stock Disponible *')).not.toBeDisabled({ timeout: 10000 });
    await expect(page.getByLabel('Stock Disponible *')).toHaveValue('5');

    await page.getByLabel('Stock Disponible *').fill('8');
    await page.getByRole('button', { name: /Actualizar/i }).click();

    expect(putBody).not.toBeNull();
    expect(putBody.quantity).toBe(8);

    await page.goto(`/producto-detalle/${productId}`);
    await expect(page.getByText('En stock')).toBeVisible();
  });

  test('flujo comercio: Validar stock inválido en edición', async ({ page }) => {
    const productId = 101;

    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: 1, name: 'Comerciante Demo' } }),
      });
    });

    await page.unroute('**/products/101');

    const baseProduct = createBaseProduct(productId);

    let putRequestCount = 0;

    const handler = async (route: any) => {
      const req = route.request();
      if (req.method() === 'PUT') {
        putRequestCount += 1;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseProduct) });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(baseProduct) });
    };

    await page.route(`**/products/${productId}`, handler);
    await page.route(`**/api/products/${productId}`, handler);

    await page.goto(`/comercio/productos/${productId}/editar`);

    const stockInput = page.getByLabel('Stock Disponible *');
    await expect(stockInput).not.toBeDisabled({ timeout: 10000 });
    await expect(stockInput).toHaveValue('5');

    await stockInput.fill('-1');
    await page.getByRole('button', { name: /Actualizar/i }).click();

    await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).toBeVisible();
    expect(putRequestCount).toBe(0);

    // Validar stock negativo
    await stockInput.fill('-1');
    await page.getByRole('button', { name: /Actualizar/i }).click();
    await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).toBeVisible();
    expect(putRequestCount).toBe(0);

    // Validar stock decimal
    await stockInput.fill('3.5');
    await page.getByRole('button', { name: /Actualizar/i }).click();
    await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).toBeVisible();
    expect(putRequestCount).toBe(0);
  });

  //OM-514
  test('flujo carrito: mostrar sin stock y bloquear compra', async ({ page }) => {
    let cartPostCalls = 0;

    // Mock del producto sin stock (sobrescribe el mock común)
    await page.route('**/products/101', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id_product: 101,
          name: 'Apple iPhone 17 Pro A3256 Dual',
          description: 'Smartphone premium',
          price: 13290000,
          quantity: 0,
          averageRating: 4.7,
          reviewCount: 542,
          category: { name: 'Celulares' },
          commerce: { name: 'Nissei' },
          tags: [{ id: 1, name: 'OLED' }],
        }),
      });
    });

    // Contador de intentos de compra
    await page.route('**/api/users/*/cart/items', async (route) => {
      if (route.request().method() === 'POST') {
        cartPostCalls += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, items: [] }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, items: [] }),
      });
    });

    await page.goto('/producto-detalle/101');

    await expect(page.getByText('Sin stock')).toBeVisible();

    const addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    await expect(page.getByText('Este producto no tiene stock disponible')).toBeVisible();
    await expect.poll(() => cartPostCalls).toBe(0);
  });

  //OM-514
  test('flujo cliente: descontar stock al confirmar compra', async ({ page }) => {
    let currentStock = 1;
    let orderPostCalls = 0;

    await page.unroute('**/products/101');

    const buildProduct = () => ({
      id_product: 101,
      name: 'Apple iPhone 17 Pro A3256 Dual',
      description: 'Smartphone premium',
      price: 13290000,
      quantity: currentStock,
      averageRating: 4.7,
      reviewCount: 542,
      category: { name: 'Celulares' },
      commerce: { name: 'Nissei' },
      tags: [{ id: 1, name: 'OLED' }],
    });

    const productHandler = async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildProduct()),
      });
    };

    await page.route('**/products/101', productHandler);
    await page.route('**/api/products/101', productHandler);

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
                    product: { ...mockCartProduct, originalPrice: 13290000 },
                  },
                ],
              },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.route('**/api/users/*/addresses', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.fallback();
    });

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        orderPostCalls += 1;
        currentStock = Math.max(0, currentStock - 1);

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 556,
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
        return;
      }
      await route.fallback();
    });

    await page.goto('/producto-detalle/101');
    await expect(page.getByText('En stock')).toBeVisible();

    await page.goto('/confirmar-pedido/1');
    await expect(page.getByRole('heading', { name: 'Confirmar Pedido' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar Pedido' }).click();

    await expect(page).toHaveURL('/pedido-confirmado');
    await expect.poll(() => orderPostCalls).toBe(1);

    await page.goto('/producto-detalle/101');
    await expect(page.getByText('Sin stock')).toBeVisible();
  });

  // OM-506 - Validación de todos los formularios
  test('flujo login/registro: Login y registro inválidos', async ({ page }) => {

    await page.unroute('**/api/users/register');
    let registerCalled = false;
    await page.route('**/api/users/register', async (route) => {
      registerCalled = true;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'should not be called' }) });
    });

    await page.unroute('**/api/session');
    let loginCalled = false;
    await page.route('**/api/session', async (route) => {
      loginCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'x', user: { id_user: 1 } }) });
    });

    // Ir a la página de auth y abrir formulario de registro
    await page.goto('/login');
    await page.getByRole('button', { name: 'Registrarse' }).click();

    // Rellenar con valores inválidos
    await page.getByPlaceholder('Tu nombre').fill(''); // nombre vacío
    await page.getByPlaceholder('tu@correo.com').fill('correo-invalido');
    await page.locator('input[name="password"]').fill('123'); // < 8
    await page.locator('input[name="confirmPassword"]').fill('1234'); // distinto

    // Intentar enviar
    await page.locator('form button[type="submit"]').click();

    // Validaciones esperadas (registro)
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(page.getByText('Ingresá un correo válido')).toBeVisible();
    await expect(page.getByText('La contraseña debe tener mínimo 8 caracteres')).toBeVisible();
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();

    expect(registerCalled).toBe(false);

    // Volver a login y probar validaciones de login inválido
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await page.getByPlaceholder('tu@correo.com').fill('correo-invalido');
    await page.locator('input[name="password"]').fill(''); // vacío

    await page.locator('form button[type="submit"]').click();

    // Validaciones esperadas (login)
    await expect(page.getByText('Ingresá un correo válido')).toBeVisible();
    await expect(page.getByText('La contraseña es obligatoria')).toBeVisible();

    expect(loginCalled).toBe(false);
  });

  //OM-506
  test('flujo comercio: Campos inválidos al crear producto', async ({ page }) => {
    // Evitar que la creación realmente se ejecute; detectar si se llamó
    await page.unroute('**/products');
    let createCalled = false;
    await page.route('**/products', async (route) => {
      createCalled = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id_product: 999 }),
      });
    });

    // Mock: devolver muchas tags (para poder mostrar >10)
    await page.unroute('**/products/tags**');
    await page.route('**/products/tags**', async (route) => {
      const tags = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `tag${i + 1}`, status: true }));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tags) });
    });

    // Mock sesión como SELLER
    await page.unroute('**/api/session');
    await page.route('**/api/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id_user: 7, role: 'SELLER', id_store: 1 } }),
      });
    });
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'SELLER', id_store: 1, name: 'Seller Demo' } }),
      });
    });

    // Login
    await page.goto('/login');
    await page.getByPlaceholder('tu@correo.com').fill('comercio@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('form button[type="submit"]').click();

    // Ir a crear producto
    await page.goto('/comercio/productos/nuevo');
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Producto' })).toBeVisible();



    // Rellenar con valores inválidos
    await page.getByLabel('Nombre del Producto *').fill(''); // nombre vacío
    await page.getByLabel('Descripcion *').fill(''); // descripción vacía
    await page.getByLabel('Precio *').fill('0'); // precio <= 0
    await page.getByLabel('Stock Disponible *').fill('-5'); // stock inválido

    // Expandir lista de tags (mostrar todos)
    await page.getByRole('button', { name: 'Ver mas' }).click();

    // Asegurarse que los tags estén visibles
    await expect(page.getByRole('button', { name: 'tag1' }).first()).toBeVisible({ timeout: 5000 });

    // NO seleccionar categorías (dejar vacío)
    // Seleccionar 10 tags (máximo permitido) — UI debe bloquear el 11
    for (let i = 1; i <= 10; i++) {
      await page.getByRole('button', { name: `tag${i}` }).first().click();
    }

    // El tag 11 debe existir pero estar deshabilitado por la app
    const tag11 = page.getByRole('button', { name: 'tag11' }).first();
    await expect(tag11).toBeVisible();
    await expect(tag11).toBeDisabled();

    // Intentar enviar
    await page.getByRole('button', { name: 'Crear Producto' }).click();

    // Validaciones esperadas (mensajes del esquema/productSchema)
    await expect(page.getByText('El nombre del producto es obligatorio.')).toBeVisible();
    await expect(page.getByText('La descripcion es obligatoria.')).toBeVisible();
    await expect(page.getByText('El precio debe ser mayor a 0.')).toBeVisible();
    await expect(page.getByText('Selecciona al menos una categoria.')).toBeVisible();
    await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).toBeVisible();

    expect(createCalled).toBe(false);
  });

  //OM-506
  test('flujo cliente: Campos inválidos al agregar dirección', async ({ page }) => {
    // Mock session como CUSTOMER
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id_user: 7, id_store: 1, name: 'Cliente Demo' } }),
      });
    });

    // Mock addresses endpoint y detectar POST
    await page.unroute('**/api/users/*/addresses**');
    let postCalled = false;
    await page.route('**/api/users/*/addresses**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      if (method === 'POST') {
        postCalled = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ data: { id_address: 2 } }),
        });
        return;
      }
      await route.fallback();
    });

    // Ir a la página de direcciones
    await page.goto('/direcciones');
    await expect(page.getByRole('heading', { name: 'Mi Cuenta' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Libreta de direcciones' })).toBeVisible();

    // Abrir modal de agregar dirección
    await page.getByRole('button', { name: 'Agregar dirección' }).first().click();

    // Dejar el campo dirección vacío y NO seleccionar punto en el mapa
    await page.getByPlaceholder('Ej: Av. República del Paraguay 1234').fill('');

    // Enviar formulario
    await page.locator('form').getByRole('button', { name: 'Agregar dirección' }).click();

    // Validaciones esperadas
    await expect(page.getByText('La dirección es obligatoria')).toBeVisible();
    await page.getByPlaceholder('Ej: Av. República del Paraguay 1234').fill('Avda falsa 123');

    // Enviar formulario
    await page.locator('form').getByRole('button', { name: 'Agregar dirección' }).click();

    await expect(page.getByText('Debes seleccionar un punto en el mapa')).toBeVisible();

    // Asegurarse de que no se llamó al POST debido a errores de validación
    expect(postCalled).toBe(false);
  });

  //OM-506
  test('flujo cliente: Campos inválidos al crear comercio', async ({ page }) => {
    // Interceptar creación para asegurar que NO se llame cuando hay errores
    await page.unroute('**/api/commerces');
    let createCalled = false;
    await page.route('**/api/commerces', async (route) => {
      if (route.request().method() === 'POST') {
        createCalled = true;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id_store: 999 }) });
        return;
      }
      await route.fallback();
    });

    // Mock sesión como CUSTOMER (CommerceCreationForm lee /api/session/user-session)
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo' } }),
      });
    });

    // Mock categories (la UI muestra opciones, pero dejaremos sin seleccionar para validar)
    await page.unroute('**/api/commerces/categories');
    await page.route('**/api/commerces/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Comida' },
          { id: 2, name: 'Ropa' },
        ]),
      });
    });

    // Ir a la página de creación de comercio
    await page.goto('/crear-comercio');
    await expect(page.getByText('Crear Comercio')).toBeVisible();

    // Rellenar formulario con valores inválidos según el ticket
    await page.getByPlaceholder('Ej: Mi Tienda Online').fill(''); // nombre vacio
    await page.getByPlaceholder('contacto@mitienda.com').fill('correo-invalido'); // email inválido
    await page.getByPlaceholder('+595XXXXXXXXX').fill('12345'); // phone inválido (no +595XXXXXXXXX)

    await page.getByPlaceholder('Calle Principal 123').fill(''); // dirección vacia
    //No se pone descripcion

    //No seleccionar categorías, se deja vacío

    // No seleccionar punto en el mapa

    // Precios negativos
    await page.getByPlaceholder('Ej: 2500').fill('-10');
    await page.getByPlaceholder('Ej: 4000').fill('-5');

    // URLs inválidas (sin http/https)
    await page.getByPlaceholder('https://mi-comercio.com').fill('ftp://mi-sitio.com');
    await page.getByPlaceholder('https://instagram.com/mi_comercio').fill('instagram.com/mi_tienda');
    await page.getByPlaceholder('https://tiktok.com/@mi_comercio').fill('tiktok.com/@mi_tienda');

    // Intentar enviar
    await page.getByRole('button', { name: 'Registrar Comercio' }).click();

    // Aserciones de validación esperadas
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(page.getByText('Ingresá un correo válido')).toBeVisible();
    await expect(page.getByText('El teléfono debe tener el formato +595XXXXXXXXX')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria')).toBeVisible();
    await expect(page.getByText('Debes seleccionar al menos una categoría')).toBeVisible();
    await expect(page.getByText('La descripción es obligatoria')).toBeVisible();
    await expect(page.getByText('Selecciona un punto en el mapa')).toBeVisible();
    await expect(page.getByText('El precio base debe ser mayor o igual a 0')).toBeVisible();
    await expect(page.getByText('El precio de distancia debe ser mayor o igual a 0')).toBeVisible();
    await expect(page.getByText('El sitio web debe iniciar con http:// o https://')).toBeVisible();
    await expect(page.getByText('Instagram debe iniciar con http:// o https://')).toBeVisible();
    await expect(page.getByText('TikTok debe iniciar con http:// o https://')).toBeVisible();

    // Asegurar que no se intentó crear el comercio por errores de validación
    expect(createCalled).toBe(false);
  });

  //OM-506
  test('flujo comercio: Campos inválidos al editar comercio', async ({ page }) => {
    // Interceptar update para asegurar que NO se llame cuando hay errores
    await page.unroute('**/api/commerces/**');
    let updateCalled = false;
    await page.route('**/api/commerces/**', async (route) => {
      const method = route.request().method();
      if (method === 'GET' && route.request().url().includes('/api/commerces/my/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id_store: 1,
            name: 'Tienda Demo',
            email: 'store@demo.com',
            phone: '+595981000000',
            description: 'Descripción demo',
            categories: [],
            addresses: [{ address: 'Av Demo 123', latitude: null, longitude: null }],
            logo: null,
            website_url: 'https://mi-comercio.com',
            instagram_url: '',
            tiktok_url: '',
            base_price: 1000,
            distance_price: 2000,
          }),
        });
        return;
      }

      if (method !== 'GET') {
        updateCalled = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id_store: 1 }) });
        return;
      }
      await route.fallback();
    });

    // Mock sesión como SELLER (tiene id_store = 1)
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'SELLER', id_store: 1, name: 'Seller Demo' } }),
      });
    });

    // Mock categorías (la página las carga pero dejaremos categoryIds vacías en el store)
    await page.unroute('**/api/commerces/categories');
    await page.route('**/api/commerces/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Comida' },
          { id: 2, name: 'Ropa' },
        ]),
      });
    });

    // Mock detalle del comercio (sin categorías y sin punto en mapa para forzar validaciones)
    await page.unroute('**/api/commerces/my/1');
    await page.route('**/api/commerces/my/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id_store: 1,
          name: 'Tienda Demo',
          email: 'store@demo.com',
          phone: '+595981000000',
          description: 'Descripción demo',
          categories: [],            // sin categorías
          addresses: [{ address: 'Av Demo 123', latitude: null, longitude: null }],
          logo: null,
          website_url: 'https://mi-comercio.com',
          instagram_url: '',
          tiktok_url: '',
          base_price: 1000,
          distance_price: 2000,
        }),
      });
    });

    // Ir a editar comercio
    await page.goto('/comercio/editar');
    await expect(page.getByText('Perfil del Comercio')).toBeVisible();

    // Dejar nombre vacío
    await page.locator('input[value="Tienda Demo"]').fill('');

    // Email inválido
    await page.locator('input[value="store@demo.com"]').fill('correo-invalido');

    // Teléfono inválido (no cumple +595...)
    await page.locator('input[value="+595981000000"]').fill('');

    // URLs inválidas
    await page.locator('input[value="https://mi-comercio.com"]').fill('ftp://mi-sitio.com');
    await page.getByPlaceholder('https://instagram.com/mi_comercio').fill('instagram.com/mi_tienda');
    await page.getByPlaceholder('https://tiktok.com/@mi_comercio').fill('tiktok.com/@mi_tienda');

    // Precios negativos
    await page.getByPlaceholder('Ej: 2500').fill('-50');
    await page.getByPlaceholder('Ej: 4000').fill('-10');

    // Asegurarse de que no hay punto en el mapa (mock ya lo dejó null)
    // Intentar enviar cambios
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    // Validaciones esperadas
    await expect(page.getByText('El nombre del comercio es obligatorio')).toBeVisible();
    await expect(page.getByText('Ingresá un email válido')).toBeVisible();
    await expect(page.getByText('El teléfono es obligatorio')).toBeVisible();
    await expect(page.getByText(/Selecciona un punto en el mapa/i)).toBeVisible();
    await expect(page.getByText('Ingresá un precio base válido mayor o igual a 0')).toBeVisible();
    await expect(page.getByText('Ingresá un precio para larga distancia válido mayor o igual a 0')).toBeVisible();
    await expect(page.getByText('La URL de sitio web debe iniciar con http:// o https://')).toBeVisible();
    await expect(page.getByText('La URL de Instagram debe iniciar con http:// o https://')).toBeVisible();
    await expect(page.getByText('La URL de TikTok debe iniciar con http:// o https://')).toBeVisible();

    // No debe haberse llamado al endpoint de actualización
    expect(updateCalled).toBe(false);
  });

  //OM-506
  test('flujo admin: Campos inválidos al editar categoria en admin', async ({ page }) => {
    // Mock session como ADMIN
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 1, role: 'ADMIN', name: 'Admin Demo' } }),
      });
    });

    // Interceptar GET/PUT de la categoría
    await page.unroute('**/api/admin/categories/1');
    let putCalled = false;
    await page.route('**/api/admin/categories/1', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Electrónica',
            visible: true,
            status: true,
            productCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
        return;
      }
      if (method === 'PUT') {
        putCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'X', visible: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        });
        return;
      }
      await route.fallback();
    });

    // Ir a detalle de categoría admin
    await page.goto('/admin/categorias/1');
    await expect(page.getByRole('heading', { name: 'Electrónica' })).toBeVisible();

    // Abrir modal de edición
    await page.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('heading', { name: 'Editar Categoría' })).toBeVisible();

    // Localizar el input dentro del modal (no depende del value)
    const nameInput = page.locator('label:has-text("Nombre *") + input, label:has-text("Nombre *") ~ input').first();

    // Validación: nombre vacío
    await nameInput.fill('');
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();
    await expect(page.getByText('El nombre es requerido.')).toBeVisible();
    expect(putCalled).toBe(false);

    // Toggle cambia estado visual en el modal (sin guardar)
    // Rellenar con nombre válido para no bloquear el toggle visual
    await nameInput.fill('Nombre Válido');
    const ocultaBtn = page.getByRole('button', { name: 'Oculta' }).first();
    const visibleBtn = page.getByRole('button', { name: 'Visible' }).first();

    // Estado inicial: "Visible" seleccionado 
    const visibleBgBefore = await visibleBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Cambiar a "Oculta"
    await ocultaBtn.click();
    const ocultaBgAfter = await ocultaBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const visibleBgAfter = await visibleBtn.evaluate((el) => getComputedStyle(el).backgroundColor);

    // Comprobar que la apariencia cambió
    expect(ocultaBgAfter).not.toBe(visibleBgBefore);
    expect(visibleBgAfter).not.toBe(ocultaBgAfter);


    expect(putCalled).toBe(false);
  });

  //OM-506
  test('flujo cliente: Campos inválidos al comentar producto', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, role: 'CUSTOMER', name: 'Cliente Demo' } }),
      });
    });

    await page.unroute('**/products/reviews/101');
    await page.route('**/products/reviews/101', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviews: [],
          stats: { averageRating: 0, totalReviews: 0 },
        }),
      });
    });

    let postCalled = false;
    await page.unroute('**/products/101/reviews');
    await page.route('**/products/101/reviews', async (route) => {
      if (route.request().method() === 'POST') {
        postCalled = true;
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 999 }) });
        return;
      }
      await route.fallback();
    });

    await page.goto('/comentarios/101');
    await expect(page.getByRole('heading', { name: 'Comentarios' })).toBeVisible();

    // Abrir modal
    await page.getByRole('button', { name: 'Escribir mi opinión' }).click();
    await expect(page.getByText('Agregar una reseña')).toBeVisible();

    // Validar comentario vacío
    const commentTextarea = page.getByPlaceholder('Tu comentario');
    await commentTextarea.fill('');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('El comentario es obligatorio')).toBeVisible();
    expect(postCalled).toBe(false);
  });

  //OM-511 -  Eliminar una o todas las ordenes de compra
  test('flujo cliente: eliminar orden individual (cancelar y aceptar)', async ({ page }) => {
    let carts = [
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
            },
          },
        ],
      },
      {
        id: 2,
        storeId: 2,
        commerce: { id: 2, name: 'TechPoint' },
        status: 'ACTIVE',
        items: [
          {
            id: 2,
            quantity: 2,
            product: {
              id: 102,
              name: 'Samsung Galaxy S24 Ultra',
              price: 8999000,
            },
          },
        ],
      },
      {
        id: 3,
        storeId: 3,
        commerce: { id: 3, name: 'DigiStore' },
        status: 'ACTIVE',
        items: [
          {
            id: 3,
            quantity: 1,
            product: {
              id: 103,
              name: 'MacBook Air M3',
              price: 25990000,
            },
          },
        ],
      },
    ];

    await page.route('**/api/users/*/carts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ carts }),
        });
        return;
      }
      await route.fallback();
    });

    await page.route('**/api/users/*/cart/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        const url = new URL(route.request().url());
        const parts = url.pathname.split('/');
        const cartId = Number(parts[parts.length - 1]);
        carts = carts.filter((c) => c.id !== cartId);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Orden eliminada correctamente' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/carrito');
    await expect(page.getByRole('heading', { name: 'Ordenes de Compras' })).toBeVisible();

    // Verificar que las tres tiendas están visibles
    await expect(page.getByText('Nissei')).toBeVisible();
    await expect(page.getByText('TechPoint')).toBeVisible();
    await expect(page.getByText('DigiStore')).toBeVisible();


    await page.locator('div.rounded-2xl').filter({ has: page.locator('h2', { hasText: 'Nissei' }) })
      .getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('¿Estás seguro de que deseas eliminar esta orden de compra?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.getByText('Nissei')).toBeVisible();
    await expect(page.getByText('TechPoint')).toBeVisible();
    await expect(page.getByText('DigiStore')).toBeVisible();
    await expect(page.locator('text=Orden eliminada correctamente')).toHaveCount(0);

    // Aceptar eliminación de Nissei

    await page.locator('div.rounded-2xl').filter({ has: page.locator('h2', { hasText: 'Nissei' }) })
      .getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('¿Estás seguro de que deseas eliminar esta orden de compra?')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar orden' }).click();

    await expect(page.getByText('Orden eliminada correctamente')).toBeVisible();
    await expect(page.getByText('Nissei')).not.toBeVisible();
    await expect(page.getByText('TechPoint')).toBeVisible();
    await expect(page.getByText('DigiStore')).toBeVisible();
  });

  //OM-511
  test('flujo cliente: eliminar todas las órdenes (cancelar y aceptar)', async ({ page }) => {
    let carts = [
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
            },
          },
        ],
      },
      {
        id: 2,
        storeId: 2,
        commerce: { id: 2, name: 'TechPoint' },
        status: 'ACTIVE',
        items: [
          {
            id: 2,
            quantity: 2,
            product: {
              id: 102,
              name: 'Samsung Galaxy S24 Ultra',
              price: 8999000,
            },
          },
        ],
      },
      {
        id: 3,
        storeId: 3,
        commerce: { id: 3, name: 'DigiStore' },
        status: 'ACTIVE',
        items: [
          {
            id: 3,
            quantity: 1,
            product: {
              id: 103,
              name: 'MacBook Air M3',
              price: 25990000,
            },
          },
        ],
      },
    ];

    await page.route('**/api/users/*/carts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ carts }),
        });
        return;
      }
      if (route.request().method() === 'DELETE') {
        carts = [];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Todas las órdenes fueron eliminadas correctamente' }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto('/carrito');
    await expect(page.getByRole('heading', { name: 'Ordenes de Compras' })).toBeVisible();

    // Verificar que las tres tiendas están visibles
    await expect(page.getByText('Nissei')).toBeVisible();
    await expect(page.getByText('TechPoint')).toBeVisible();
    await expect(page.getByText('DigiStore')).toBeVisible();

    //Cancelar eliminación de todas las órdenes
    await page.getByRole('button', { name: 'Eliminar todas' }).click();

    await expect(page.getByText('¿Estás seguro de que deseas eliminar TODAS tus órdenes de compra?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // Las tres órdenes deben seguir visibles
    await expect(page.getByText('Nissei')).toBeVisible();
    await expect(page.getByText('TechPoint')).toBeVisible();
    await expect(page.getByText('DigiStore')).toBeVisible();

    // Aceptar eliminación de todas las órdenes
    await page.getByRole('button', { name: 'Eliminar todas' }).click();
    await expect(page.getByText('¿Estás seguro de que deseas eliminar TODAS tus órdenes de compra?')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar todas' }).nth(1).click();

    // Todas las órdenes deben desaparecer y mostrarse el toast de éxito
    await expect(page.getByText('Todas las órdenes fueron eliminadas correctamente')).toBeVisible();
    await expect(page.getByText('Nissei')).not.toBeVisible();
    await expect(page.getByText('TechPoint')).not.toBeVisible();
    await expect(page.getByText('DigiStore')).not.toBeVisible();

    // Debe mostrarse el estado vacío
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();
  });

  //OM-505 - Notificaciones 


  // notificación de pedido confirmado — badge, lista, marcar leída y navegación
  test('flujo notificaciones: notificación de pedido confirmado (badge, lista, marcar leída y navegación)', async ({ page }) => {
    // Mock: sesión (usuario autenticado)
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id_user: 7, id_store: null, name: 'Cliente Demo' } }),
      });
    });

    // Mock: carts del usuario (fetchCartsApi) — evitar que falle el refresh del navbar
    await page.route('**/api/users/7/carts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ carts: [] }),
      });
    });

    // Mock: GET /api/notifications con una notificación de pedido confirmado
    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unreadCount: 1,
          notifications: [
            {
              id: 123,
              title: '¡Tu pedido #555 fue confirmado!',
              message: 'Tu pago fue registrado y el pedido fue confirmado.',
              referenceId: 555,
              read: false,
              createdAt: '2026-05-18T12:00:00.000Z',
            },
          ],
        }),
      });
    });

    // Interceptar PATCH que marca la notificación como leída
    let patchCalled = false;
    await page.route('**/api/notifications/123/read', async (route) => {
      patchCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 123,
          title: '¡Tu pedido #555 fue confirmado!',
          referenceId: 555,
          read: true,
          createdAt: '2026-05-18T12:00:00.000Z',
        }),
      });
    });

    // Mock: GET orders for user — necesario para la página /pedidos/:id
    await page.route('**/api/users/7/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 555,
            createdAt: '2026-05-18T11:50:00.000Z',
            status: 'PROCESSING',
            items: [],
            total: 13290000,
            address: null,
            notes: null,
          },
        ]),
      });
    });

    // Ir a la home para que el Navbar haga el fetch y muestre el badge
    await page.goto('/');

    // Esperar que el badge del navbar muestre "1"
    const bellBadge = page.locator('a[aria-label="Notificaciones"] span');
    await expect(bellBadge).toHaveText('1');

    // Abrir centro de notificaciones desde la campana
    await page.click('a[aria-label="Notificaciones"]');
    await expect(page).toHaveURL(/\/notificaciones$/);

    // Verificar que la notificación de pedido confirmado está en la lista
    const notifButton = page.getByRole('button', { name: '¡Tu pedido #555 fue confirmado!' });
    await expect(notifButton).toBeVisible();

    // Hacer click en la notificación: debe llamar al PATCH y navegar a /pedidos/555
    await notifButton.click();

    // Esperar navegación a detalle del pedido
    await page.waitForURL('**/pedidos/555');

    // Verificar que el PATCH fue ejecutado
    expect(patchCalled).toBeTruthy();

    // En la página de detalle del pedido debe mostrarse el número del pedido
    await expect(page.getByText(/Pedido N° 555/)).toBeVisible();
  });

  //OM-521
  test('flujo cliente: Customer sin comercio intenta acceder a comercio, este redirige a crear comercio', async ({ page }) => {
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,  // ← esto faltaba
          user: { id_user: 7, name: 'Cliente Demo', role: 'CUSTOMER', id_store: null },
        }),
      });
    });

    await page.route('**/api/users/7/carts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ carts: [] }),
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0, notifications: [] }),
      });
    });

    await page.route('**/api/commerces/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Comida' },
          { id: 2, name: 'Tecnología' },
        ]),
      });
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Comercio' }).click();
    await expect(page).toHaveURL('/crear-comercio');
    await expect(page.getByText('Crear Comercio')).toBeVisible();
  });

  // OM-521
  test('flujo comercio: usuario SELLER intenta acceder a crear comercio, pero redirige a panel de comercio y muestra toast', async ({ page }) => {
    // Sesión como SELLER
    await page.unroute('**/api/session/user-session');
    await page.route('**/api/session/user-session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id_user: 7,
            id_store: 1,
            name: 'Comerciante Demo',
            role: 'SELLER',
          },
        }),
      });
    });

    // Mocks usados por Navbar en ambas pantallas
    await page.route('**/api/users/7/carts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ carts: [] }),
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unreadCount: 0,
          notifications: [],
        }),
      });
    });

    // Mock del panel de comercio al que redirige
    await page.route('**/api/commerces/my/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id_store: 1,
          name: 'Comercio Demo',
          store_status: 'ACTIVE',
          products: [],
        }),
      });
    });

    // Ir directo a la vista de crear comercio
    await page.goto('/crear-comercio');

    // Debe redirigir automáticamente al panel de comercio
    await expect(page).toHaveURL('/comercio');

    // Toast de aviso
    await expect(page.getByText('Ya tenés un comercio registrado.')).toBeVisible();

    // Validación de que se cargó el panel
    await expect(page.getByText('Dashboard - Comercio Demo')).toBeVisible();
  });


  // OM-504
  test('flujo login: volver al inicio, bloquear campos, error personalizado y mostrar contraseña', async ({ page }) => {
    await page.goto('/login');

    const backButton = page.getByRole('button', { name: /Inicio/i });
    await expect(backButton).toBeVisible();

    await page.getByPlaceholder('tu@correo.com').fill('invalid-email');
    await page.locator('input[name="password"]').fill('12345');

    // Selector corregido: Lucide renderiza clases como lucide-eye en el SVG
    const eyeButton = page.locator('button').filter({
      has: page.locator('svg.lucide-eye, svg.lucide-eye-off'),
    }).first();
    await expect(eyeButton).toBeVisible();
    await eyeButton.click();

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await eyeButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText('Ingresá un correo válido')).toBeVisible();
    // Corregido: la contraseña "12345" tiene 5 chars, falla por longitud mínima (8), no por obligatoriedad
    await expect(page.getByText('La contraseña debe tener mínimo 8 caracteres')).toBeVisible();

    const submitButton = page.locator('form button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    await page.getByPlaceholder('tu@correo.com').fill('user@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await expect(page.getByPlaceholder('tu@correo.com')).toBeEnabled();

    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  // OM-504
  test('flujo registro: volver al inicio, bloquear campos, error personalizado y mostrar contraseña', async ({ page }) => {
    await page.goto('/login');

    // Cambiar a pestaña Registrarse
    await page.getByRole('button', { name: 'Registrarse' }).click();

    // Verificar que existe el botón de volver al Inicio
    const backButton = page.getByRole('button', { name: /Inicio/i });
    await expect(backButton).toBeVisible();

    // Validaciones: enviar datos inválidos
    await page.getByPlaceholder('Tu nombre').fill(''); // vacío
    await page.getByPlaceholder('tu@correo.com').fill('bad-email');
    await page.locator('input[name="password"]').fill('short');
    await page.locator('input[name="confirmPassword"]').fill('different');

    // Mostrar/ocultar password y confirmPassword
    const pwdEye = page.locator('input[name="password"] + button');
    const confirmPwdEye = page.locator('input[name="confirmPassword"] + button');
    await pwdEye.click();
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');
    await pwdEye.click();
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');

    await confirmPwdEye.click();
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'text');
    await confirmPwdEye.click();
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('type', 'password');

    // Intentar enviar y verificar mensajes de error personalizados debajo de cada campo
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(page.getByText('Ingresá un correo válido')).toBeVisible();
    await expect(page.getByText('La contraseña debe tener mínimo 8 caracteres')).toBeVisible();
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();

    // Ahora probar bloqueo de campos durante la petición: interceptamos y retardamos la respuesta
    await page.route('**/api/users/register', async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Registro exitoso' }),
      });
    });

    // Rellenar datos válidos y enviar
    await page.getByPlaceholder('Tu nombre').fill('Test User');
    await page.getByPlaceholder('tu@correo.com').fill('user@test.com');
    await page.locator('input[name="password"]').fill('12345678');
    await page.locator('input[name="confirmPassword"]').fill('12345678');

    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click();

    // Durante la petición los inputs y botones deben estar deshabilitados
    await expect(page.getByPlaceholder('Tu nombre')).toBeDisabled();
    await expect(page.getByPlaceholder('tu@correo.com')).toBeDisabled();
    await expect(page.locator('input[name="password"]')).toBeDisabled();
    await expect(page.locator('input[name="confirmPassword"]')).toBeDisabled();
    await expect(submitBtn).toBeDisabled();

    // Volver al inicio usando el botón de flecha
    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  
});
