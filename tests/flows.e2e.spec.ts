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

    await page.getByRole('button', { name: 'Ver más' }).first().click();
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

    await page.getByText('Celulares').click();
    await expect(page).toHaveURL(/\/busqueda\?categoryId=1/);
    await expect(page.getByText('Resultado de Búsqueda para: Celulares')).toBeVisible();

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
    await expect(page.getByText('ORD-2024-001543')).toBeVisible();

    await page.getByText('ORD-2024-001543').click();
    await expect(page).toHaveURL('/pedidos/ORD-2024-001543');
    await expect(page.getByText('Pedido N° ORD-2024-001543')).toBeVisible();
    await expect(page.getByText('Dirección de envío')).toBeVisible();
  });
});
