// src/features/clients/components/DeleteAllCartsModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiBase } from "../../../../lib/cartApi";
import { ConfirmationModal } from "./ConfirmationModal";

export function DeleteAllCartsModal({ userId, totalCarts, totalItems, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const apiBase = getApiBase() || "http://localhost:3000";

  const handleDeleteAll = async () => {
    setDeleting(true);
    setError("");
    try {
      await axios.delete(
        `${apiBase}/api/users/${userId}/carts`,
        { withCredentials: true }
      );
      toast.success("Todas las órdenes fueron eliminadas correctamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || "No se pudo eliminar las órdenes";
      setError(message);
      console.error("Error eliminando carritos:", err);
    } finally {
      setDeleting(false);
    }
  };

  const warnings = [
    `¿Estás seguro de que deseas eliminar TODAS tus órdenes de compra?`,
    `• Se eliminarán ${totalCarts} ${totalCarts === 1 ? "orden" : "órdenes"}`,
    `• Contiene ${totalItems} ${totalItems === 1 ? "producto" : "productos"} en total`,
    `• Esta acción no se puede deshacer`,
  ];

  return (
    <ConfirmationModal
      isOpen={Boolean(userId)}
      title="Eliminar todas las órdenes"
      subtitle="Acción masiva"
      warnings={warnings}
      description="Todos los productos de tus órdenes se eliminarán permanentemente."
      onClose={onClose}
      onConfirm={handleDeleteAll}
      confirmText="Eliminar todas"
      isLoading={deleting}
      error={error}
      icon={Trash2}
    />
  );
}

DeleteAllCartsModal.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalCarts: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DeleteAllCartsModal.defaultProps = {
  userId: null,
  onSuccess: null,
};