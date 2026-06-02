import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { getApiBase } from "@/lib";
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
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || "No se pudo eliminar el carrito";
      setError(message);
      console.error("Error eliminando carrito:", err);
    } finally {
      setDeleting(false);
    }
  };

  const warnings = [
    `¿Estás seguro de que deseas eliminar este carrito?`,
    `• Contiene ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`,
    `• Esta acción no se puede deshacer`,
  ];

  return (
    <ConfirmationModal
      isOpen={Boolean(cartId)}
      title="Eliminar carrito"
      subtitle={storeName}
      warnings={warnings}
      description="Los productos de este carrito se eliminarán permanentemente."
      onClose={onClose}
      onConfirm={handleDelete}
      confirmText="Eliminar carrito"
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