const CART_KEY = "carrito";

function readCartRaw() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Agrega líneas de favoritos al carrito local (merge por productId sumando cantidades).
 * Dispara el evento `cartUpdated` para actualizar el navbar.
 */
export function mergeWishlistLinesIntoLocalCart(lines) {
  if (!lines?.length) return;

  const cart = readCartRaw();
  const idxByProduct = new Map(cart.map((row, i) => [row.productId, i]));

  for (const line of lines) {
    const productId = line.productId;
    const addQty = Math.max(1, Number(line.cantidad) || 1);
    const i = idxByProduct.get(productId);
    if (i !== undefined) {
      cart[i] = {
        ...cart[i],
        cantidad: (Number(cart[i].cantidad) || 0) + addQty,
        nombre: line.nombre ?? cart[i].nombre,
        precio: line.precio ?? cart[i].precio,
        storeId: line.storeId ?? cart[i].storeId,
        storeName: line.storeName ?? cart[i].storeName,
        marca: line.marca ?? cart[i].marca,
      };
    } else {
      cart.push({
        productId,
        nombre: line.nombre,
        precio: line.precio,
        cantidad: addQty,
        storeId: line.storeId,
        storeName: line.storeName,
        marca: line.marca,
      });
      idxByProduct.set(productId, cart.length - 1);
    }
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Sincroniza el carrito local con la respuesta de POST /api/users/:id/cart/items
 * (merge por productId; no borra líneas de otras tiendas).
 */
export function mergeCartResponseFromApi(cartResponse) {
  const items = cartResponse?.items;
  if (!Array.isArray(items) || items.length === 0) return;

  const storeId = cartResponse?.storeId ?? cartResponse?.commerce?.id;
  const storeName = cartResponse?.commerce?.name;

  const lines = items.map((row) => {
    const p = row.product || {};
    const id = p.id ?? p.id_product;
    return {
      productId: id,
      nombre: p.name,
      precio: p.price,
      cantidad: row.quantity,
      storeId,
      storeName,
    };
  }).filter((line) => line.productId != null);

  if (!lines.length) return;
  mergeWishlistLinesIntoLocalCart(lines);
}
