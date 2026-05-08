/**
 * Persistencia local de deliveries vinculados desde esta sesión (POST exitoso).
 * Sirve de respaldo hasta que exista GET /api/stores/:id/deliveries en el backend.
 */
const storageKey = (storeId) => `fe_store_deliveries_cache_v1_${storeId}`;

export function readCachedStoreDeliveries(storeId) {
    if (storeId == null) return [];
    try {
        const raw = sessionStorage.getItem(storageKey(storeId));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * @param {object} entry - { id_delivery, fk_user, name, email, phone, delivery_status?, addedAt }
 */
export function prependCachedStoreDelivery(storeId, entry) {
    if (storeId == null || !entry?.fk_user) return;
    const prev = readCachedStoreDeliveries(storeId);
    if (prev.some((p) => Number(p.fk_user) === Number(entry.fk_user))) return;
    const next = [{ ...entry, addedAt: entry.addedAt ?? new Date().toISOString() }, ...prev];
    try {
        sessionStorage.setItem(storageKey(storeId), JSON.stringify(next));
    } catch (error) {
        console.warn("No se pudo persistir cache local de deliveries.", error);
    }
}