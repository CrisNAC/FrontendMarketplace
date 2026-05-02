import { fetchStoreOrders, ordersApiClient } from "./commerceOrdersApi";
import { getBackendErrorMessage } from "./orderApi";

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeDelivery = (item) => ({
  id:
    item?.id_delivery ??
    item?.id ??
    item?.deliveryId ??
    item?.fk_delivery ??
    null,
  name:
    item?.name ??
    item?.full_name ??
    item?.deliveryName ??
    item?.user?.name ??
    "Repartidor",
  email: item?.email ?? item?.user?.email ?? null,
  phone: item?.phone ?? item?.phone_number ?? item?.user?.phone ?? null,
  delivery_status: item?.delivery_status ?? item?.deliveryStatus ?? null,
});

export const getStoreDeliveryReviews = async (storeId, deliveryId, filters = {}) => {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.minRating) params.minRating = filters.minRating;
  if (filters.maxRating) params.maxRating = filters.maxRating;

  try {
    const res = await ordersApiClient.get(
      `/api/stores/${storeId}/deliveries/${deliveryId}/reviews`,
      { params }
    );
    return res.data;
  } catch (error) {
    // Compatibilidad por si el backend expone la ruta en singular.
    if (error?.response?.status === 404) {
      const res = await ordersApiClient.get(
        `/api/store/${storeId}/deliveries/${deliveryId}/reviews`,
        { params }
      );
      return res.data;
    }
    throw error;
  }
};

const getAcceptedAssignmentByOrder = async (orderId) => {
  const response = await ordersApiClient.get(`/api/assignments/orders/${orderId}/accepted`);
  return response.data;
};

const getDeliveriesFromStoreOrders = async (storeId) => {
  const deliveriesById = new Map();
  const firstPage = await fetchStoreOrders(storeId, {
    order_status: ["SHIPPED", "DELIVERED"],
    page: 1,
    limit: 100,
  });

  const orders = Array.isArray(firstPage?.orders) ? [...firstPage.orders] : [];
  const totalPages = Number(firstPage?.total_page ?? 1);

  if (totalPages > 1) {
    const pageRequests = [];
    for (let page = 2; page <= totalPages; page += 1) {
      pageRequests.push(
        fetchStoreOrders(storeId, {
          order_status: ["SHIPPED", "DELIVERED"],
          page,
          limit: 100,
        })
      );
    }
    const pages = await Promise.all(pageRequests);
    pages.forEach((data) => {
      if (Array.isArray(data?.orders)) orders.push(...data.orders);
    });
  }

  const assignments = await Promise.allSettled(
    orders.map((order) => getAcceptedAssignmentByOrder(order.id))
  );

  assignments.forEach((result) => {
    if (result.status !== "fulfilled") return;
    const delivery = normalizeDelivery(result.value?.delivery);
    if (delivery.id === null || delivery.id === undefined) return;
    deliveriesById.set(String(delivery.id), delivery);
  });

  return Array.from(deliveriesById.values());
};

export const getStoreDeliveries = async (storeId) => {
  const candidateUrls = [
    `/api/store/${storeId}/deliveries`,
    `/api/stores/${storeId}/deliveries`,
    `/api/deliveries/store/${storeId}`,
    `/api/deliveries/stores/${storeId}`,
  ];

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const res = await ordersApiClient.get(url);
      const raw = toArray(res?.data?.deliveries ?? res?.data?.items ?? res?.data);
      return raw
        .map(normalizeDelivery)
        .filter((d) => d.id !== null && d.id !== undefined);
    } catch (error) {
      lastError = error;
    }
  }

  try {
    const byOrders = await getDeliveriesFromStoreOrders(storeId);
    if (byOrders.length > 0) return byOrders;
  } catch (_fallbackError) {
    // Se conserva el error original para mejor diagnóstico.
  }

  throw lastError;
};

export const getDeliveryReviewsErrorMessage = (error) =>
  getBackendErrorMessage(error, "No se pudieron cargar las reseñas del repartidor.");
