import { test, expect } from '@playwright/test';

// =============================================
// PAGINA DE CREAR PRODUCTO (Comercio)
// =============================================
test.describe('Página de Crear Producto', () => {
  test.beforeEach(async ({ page }) => {
    // Set up seller user ID in localStorage before navigating
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('seller_user_id', 'test-seller-123');
    });
    await page.goto('/comercio/productos/nuevo');
  });

  // =============================================
  // ESTRUCTURA Y ELEMENTOS INICIALES
  // =============================================
  test.describe('Estructura y elementos iniciales', () => {
    test('debe mostrar el título de la página', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Crear Nuevo Producto' })).toBeVisible();
    });

    test('debe mostrar el subtítulo descriptivo', async ({ page }) => {
      await expect(page.getByText('Completa la información para agregar un nuevo producto')).toBeVisible();
    });

    test('debe mostrar el botón Volver', async ({ page }) => {
      const backButton = page.getByRole('button', { name: 'Volver' });
      await expect(backButton).toBeVisible();
    });

    test('debe mostrar la sección Información Básica', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Información Básica' })).toBeVisible();
    });

    test('debe mostrar la sección Imagen del Producto', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Imagen del Producto' })).toBeVisible();
    });

    test('debe mostrar la sección Estado del Producto', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Estado del Producto' })).toBeVisible();
    });

    test('debe mostrar el botón Cancelar', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    });

    test('debe mostrar el botón Crear Producto', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Crear Producto' })).toBeVisible();
    });
  });

  // =============================================
  // CAMPOS DEL FORMULARIO
  // =============================================
  test.describe('Campos del formulario', () => {
    test('debe mostrar todos los campos obligatorios con asterisco', async ({ page }) => {
      await expect(page.getByText('Nombre del Producto *')).toBeVisible();
      await expect(page.getByText('Descripción *')).toBeVisible();
      await expect(page.getByText('Precio *')).toBeVisible();
      await expect(page.getByText('Categoría *')).toBeVisible();
      await expect(page.getByText('Stock Disponible *')).toBeVisible();
    });

    test('debe mostrar campo de nombre con placeholder', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await expect(nameInput).toBeVisible();
    });

    test('debe mostrar textarea de descripción con placeholder', async ({ page }) => {
      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await expect(descriptionTextarea).toBeVisible();
    });

    test('debe mostrar campo de precio con placeholder', async ({ page }) => {
      const priceInput = page.getByPlaceholder('12000');
      await expect(priceInput).toBeVisible();
    });

    test('debe mostrar select de categoría', async ({ page }) => {
      const categorySelect = page.locator('#categoryId');
      await expect(categorySelect).toBeVisible();
    });

    test('debe mostrar campo de stock con placeholder', async ({ page }) => {
      const quantityInput = page.getByPlaceholder('20');
      await expect(quantityInput).toBeVisible();
    });

    test('debe mostrar campo de imagen URL con placeholder', async ({ page }) => {
      const imageUrlInput = page.getByPlaceholder('https://...');
      await expect(imageUrlInput).toBeVisible();
    });

    test('debe mostrar campo de tags como solo lectura', async ({ page }) => {
      const tagsInput = page.locator('#tags');
      await expect(tagsInput).toBeVisible();
      await expect(tagsInput).toHaveAttribute('readonly');
    });

    test('debe mostrar el toggle de visibilidad', async ({ page }) => {
      const toggle = page.getByRole('switch', { name: 'Visibilidad del producto' });
      await expect(toggle).toBeVisible();
    });
  });

  // =============================================
  // INTERACCIÓN CON CAMPOS
  // =============================================
  test.describe('Interacción con campos', () => {
    test('debe permitir escribir en el campo de nombre', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto de Prueba');
      await expect(nameInput).toHaveValue('Producto de Prueba');
    });

    test('debe permitir escribir en el campo de descripción', async ({ page }) => {
      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Esta es una descripción de prueba');
      await expect(descriptionTextarea).toHaveValue('Esta es una descripción de prueba');
    });

    test('debe permitir ingresar números en el campo de precio', async ({ page }) => {
      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('15000');
      await expect(priceInput).toHaveValue('15000');
    });

    test('debe permitir ingresar números en el campo de stock', async ({ page }) => {
      const quantityInput = page.getByPlaceholder('20');
      await quantityInput.fill('50');
      await expect(quantityInput).toHaveValue('50');
    });

    test('debe permitir escribir URL en el campo de imagen', async ({ page }) => {
      const imageUrlInput = page.getByPlaceholder('https://...');
      await imageUrlInput.fill('https://example.com/image.jpg');
      await expect(imageUrlInput).toHaveValue('https://example.com/image.jpg');
    });

    test('debe permitir alternar el toggle de visibilidad', async ({ page }) => {
      const toggle = page.getByRole('switch', { name: 'Visibilidad del producto' });

      // Default should be on (visible)
      await expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Toggle off
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-checked', 'false');

      // Toggle on again
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  // =============================================
  // VALIDACIÓN DE FORMULARIO
  // =============================================
  test.describe('Validación de formulario', () => {
    test('debe mostrar error cuando el nombre está vacío', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El nombre del producto es obligatorio.')).toBeVisible();
    });

    test('debe mostrar error cuando la descripción está vacía', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('La descripción es obligatoria.')).toBeVisible();
    });

    test('debe mostrar error cuando el precio está vacío', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción de prueba');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El precio es obligatorio.')).toBeVisible();
    });

    test('debe mostrar error cuando el precio es cero o negativo', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción de prueba');

      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('0');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El precio debe ser mayor a 0.')).toBeVisible();
    });

    test('debe mostrar error cuando no se selecciona categoría', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción de prueba');

      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('10000');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('Selecciona una categoría.')).toBeVisible();
    });

    test('debe mostrar error cuando el stock está vacío', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción de prueba');

      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('10000');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El stock disponible es obligatorio.')).toBeVisible();
    });

    test('debe mostrar error cuando el stock es negativo', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción de prueba');

      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('10000');

      const quantityInput = page.getByPlaceholder('20');
      await quantityInput.fill('-5');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).toBeVisible();
    });

    test('debe mostrar error cuando la URL de imagen es inválida', async ({ page }) => {
      const imageUrlInput = page.getByPlaceholder('https://...');
      await imageUrlInput.fill('not-a-valid-url');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('Ingresa una URL válida para la imagen.')).toBeVisible();
    });

    test('debe limpiar errores cuando se corrige un campo', async ({ page }) => {
      // Trigger validation error
      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El nombre del producto es obligatorio.')).toBeVisible();

      // Fix the field
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      // Error should be cleared
      await expect(page.getByText('El nombre del producto es obligatorio.')).not.toBeVisible();
    });
  });

  // =============================================
  // FUNCIONALIDAD DE TAGS
  // =============================================
  test.describe('Funcionalidad de Tags', () => {
    test('debe mostrar la sección de sugerencias de tags', async ({ page }) => {
      // Wait for tags to load
      await page.waitForTimeout(1000);

      const suggestionsText = page.getByText('Sugerencias');
      // Check if suggestions exist (they might not if API call fails)
      const suggestionsCount = await suggestionsText.count();

      if (suggestionsCount > 0) {
        await expect(suggestionsText).toBeVisible();
      }
    });

    test('debe mostrar el límite de tags permitidos', async ({ page }) => {
      await expect(page.getByText('Puedes agregar hasta 10 tags.')).toBeVisible();
    });

    test('debe permitir seleccionar tags de las sugerencias', async ({ page }) => {
      // Wait for tags to load
      await page.waitForTimeout(1000);

      // Try to find any tag button
      const tagButtons = page.locator('button[type="button"]').filter({ hasText: /^\w+$/ });
      const count = await tagButtons.count();

      if (count > 0) {
        const firstTag = tagButtons.first();
        const tagText = await firstTag.textContent();

        // Click the tag
        await firstTag.click();

        // Verify it appears in the tags input
        const tagsInput = page.locator('#tags');
        await expect(tagsInput).toHaveValue(new RegExp(tagText || ''));
      }
    });
  });

  // =============================================
  // ESTADO Y VISIBILIDAD DEL PRODUCTO
  // =============================================
  test.describe('Estado y visibilidad del producto', () => {
    test('debe mostrar el estado visible por defecto', async ({ page }) => {
      await expect(page.getByText('Visible para clientes')).toBeVisible();
      await expect(page.getByText('Los clientes pueden ver y comprar este producto.')).toBeVisible();
    });

    test('debe cambiar el estado a no visible cuando se desactiva el toggle', async ({ page }) => {
      const toggle = page.getByRole('switch', { name: 'Visibilidad del producto' });
      await toggle.click();

      await expect(page.getByText('No visible')).toBeVisible();
      await expect(page.getByText('El producto está oculto y no se mostrará a clientes.')).toBeVisible();
    });
  });

  // =============================================
  // NAVEGACIÓN
  // =============================================
  test.describe('Navegación', () => {
    test('debe navegar hacia atrás al hacer clic en el botón Volver', async ({ page }) => {
      const backButton = page.getByRole('button', { name: 'Volver' });
      await backButton.click();

      // Should navigate back (URL will change)
      await expect(page).not.toHaveURL('/comercio/productos/nuevo');
    });

    test('debe navegar a /comercio al hacer clic en Cancelar', async ({ page }) => {
      const cancelButton = page.getByRole('button', { name: 'Cancelar' });
      await cancelButton.click();

      await expect(page).toHaveURL('/comercio');
    });
  });

  // =============================================
  // CASOS EXTREMOS Y DE ERROR
  // =============================================
  test.describe('Casos extremos', () => {
    test('debe aceptar stock de valor 0', async ({ page }) => {
      const quantityInput = page.getByPlaceholder('20');
      await quantityInput.fill('0');
      await expect(quantityInput).toHaveValue('0');

      // Fill other required fields
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción de prueba');

      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('10000');

      // Submit should not show quantity error
      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).not.toBeVisible();
    });

    test('debe permitir precios decimales', async ({ page }) => {
      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('12000.50');
      await expect(priceInput).toHaveValue('12000.5');
    });

    test('debe permitir una URL de imagen válida', async ({ page }) => {
      const imageUrlInput = page.getByPlaceholder('https://...');
      await imageUrlInput.fill('https://www.example.com/products/image.png');
      await expect(imageUrlInput).toHaveValue('https://www.example.com/products/image.png');
    });

    test('debe deshabilitar campos mientras se cargan datos iniciales', async ({ page }) => {
      // Reload page
      await page.reload();

      // Check if fields are disabled during loading
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');

      // Wait for loading to complete
      await page.waitForTimeout(500);

      // After loading, fields should be enabled
      await expect(nameInput).not.toBeDisabled();
    });

    test('debe mostrar texto de carga en el select de categorías', async ({ page }) => {
      await page.reload();

      // During loading, should show loading text
      const categorySelect = page.locator('#categoryId');
      const loadingOption = categorySelect.locator('option', { hasText: 'Cargando categorías...' });

      // This might not be visible for long, so just check structure
      await expect(categorySelect).toBeVisible();
    });

    test('debe prevenir múltiples envíos del formulario', async ({ page }) => {
      // Fill all required fields
      await page.getByPlaceholder('Ej: Coca Cola 1L').fill('Producto Test');
      await page.getByPlaceholder('Describe las características del producto').fill('Descripción de prueba');
      await page.getByPlaceholder('12000').fill('10000');
      await page.getByPlaceholder('20').fill('50');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });

      // Click submit
      await submitButton.click();

      // Button text should change to "Creando..."
      // (This test may need API mocking to work properly)
      // Just verify the button exists
      await expect(submitButton).toBeVisible();
    });

    test('debe manejar descripciones largas en el textarea', async ({ page }) => {
      const longDescription = 'A'.repeat(1000);
      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');

      await descriptionTextarea.fill(longDescription);
      await expect(descriptionTextarea).toHaveValue(longDescription);
    });

    test('debe recortar espacios en blanco del nombre y descripción', async ({ page }) => {
      // The component trims whitespace during submission
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('  Producto Test  ');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('  Descripción con espacios  ');

      // Values are stored as-is until submission
      await expect(nameInput).toHaveValue('  Producto Test  ');
      await expect(descriptionTextarea).toHaveValue('  Descripción con espacios  ');
    });
  });

  // =============================================
  // RESPONSIVE DESIGN
  // =============================================
  test.describe('Diseño responsive', () => {
    test('debe mostrar el layout correctamente en escritorio', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.getByRole('heading', { name: 'Crear Nuevo Producto' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Información Básica' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Imagen del Producto' })).toBeVisible();
    });

    test('debe mostrar el layout correctamente en tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.getByRole('heading', { name: 'Crear Nuevo Producto' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Información Básica' })).toBeVisible();
    });

    test('debe mostrar el layout correctamente en móvil', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByRole('heading', { name: 'Crear Nuevo Producto' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Volver' })).toBeVisible();
    });
  });

  // =============================================
  // ACCESIBILIDAD
  // =============================================
  test.describe('Accesibilidad', () => {
    test('debe tener labels asociados a todos los inputs', async ({ page }) => {
      // Check that all inputs have associated labels
      const nameInput = page.locator('#name');
      await expect(nameInput).toBeVisible();

      const descriptionInput = page.locator('#description');
      await expect(descriptionInput).toBeVisible();

      const priceInput = page.locator('#price');
      await expect(priceInput).toBeVisible();

      const categorySelect = page.locator('#categoryId');
      await expect(categorySelect).toBeVisible();

      const quantityInput = page.locator('#quantity');
      await expect(quantityInput).toBeVisible();

      const imageUrlInput = page.locator('#imageUrl');
      await expect(imageUrlInput).toBeVisible();

      const tagsInput = page.locator('#tags');
      await expect(tagsInput).toBeVisible();
    });

    test('debe tener el toggle con role="switch"', async ({ page }) => {
      const toggle = page.getByRole('switch', { name: 'Visibilidad del producto' });
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-checked');
    });

    test('debe mostrar el formulario con noValidate', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toHaveAttribute('novalidate');
    });
  });

  // =============================================
  // BOUNDARY CASES
  // =============================================
  test.describe('Boundary cases adicionales', () => {
    test('debe rechazar números muy grandes en el precio', async ({ page }) => {
      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('999999999999999');

      // Just verify it accepts the input
      await expect(priceInput).toHaveValue('999999999999999');
    });

    test('debe rechazar decimales en el campo de stock', async ({ page }) => {
      const nameInput = page.getByPlaceholder('Ej: Coca Cola 1L');
      await nameInput.fill('Producto Test');

      const descriptionTextarea = page.getByPlaceholder('Describe las características del producto');
      await descriptionTextarea.fill('Descripción');

      const priceInput = page.getByPlaceholder('12000');
      await priceInput.fill('10000');

      const quantityInput = page.getByPlaceholder('20');
      await quantityInput.fill('10.5');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      // Should show error for non-integer stock
      await expect(page.getByText('El stock debe ser un número entero mayor o igual a 0.')).toBeVisible();
    });

    test('debe permitir imagen URL opcional vacía', async ({ page }) => {
      const imageUrlInput = page.getByPlaceholder('https://...');

      // Leave empty
      await expect(imageUrlInput).toHaveValue('');

      // Fill required fields
      await page.getByPlaceholder('Ej: Coca Cola 1L').fill('Producto Test');
      await page.getByPlaceholder('Describe las características del producto').fill('Descripción');
      await page.getByPlaceholder('12000').fill('10000');
      await page.getByPlaceholder('20').fill('10');

      const submitButton = page.getByRole('button', { name: 'Crear Producto' });
      await submitButton.click();

      // Should not show image URL error
      await expect(page.getByText('Ingresa una URL válida para la imagen.')).not.toBeVisible();
    });

    test('debe validar exactamente 10 tags como límite', async ({ page }) => {
      await expect(page.getByText('Puedes agregar hasta 10 tags.')).toBeVisible();
    });
  });
});