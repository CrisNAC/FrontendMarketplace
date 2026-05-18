// src/features/clients/components/cart/DeleteCartModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiBase } from "../../../../lib/cartApi";
import { ConfirmationModal } from "./ConfirmationModal";

export function DeleteCartModal({ cartId, userId, storeName, itemCount, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const apiBase = getApiBase() || "http://localhost:3000";

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await axios.delete(
        `${apiBase}/api/users/${userId}/cart/${cartId}`,
        { withCredentials: true }
      );
      toast.success("Orden eliminada correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || "No se pudo eliminar la orden";
      setError(message);
      console.error("Error eliminando carrito:", err);
    } finally {
      setDeleting(false);
    }
  };

  const warnings = [
    `¿Estás seguro de que deseas eliminar esta orden de compra?`,
    `• Contiene ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`,
    `• Esta acción no se puede deshacer`,
  ];

  return (
    <ConfirmationModal
      isOpen={Boolean(cartId)}
      title="Eliminar orden"
      subtitle={storeName}
      warnings={warnings}
      description="Los productos de esta orden se eliminarán permanentemente."
      onClose={onClose}
      onConfirm={handleDelete}
      confirmText="Eliminar orden"
      isLoading={deleting}
      error={error}
      icon={Trash2}
    />
  );
}

DeleteCartModal.propTypes = {
  cartId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  storeName: PropTypes.string.isRequired,
  itemCount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DeleteCartModal.defaultProps = {
  cartId: null,
  onSuccess: null,
};