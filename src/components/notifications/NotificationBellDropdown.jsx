import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";

function formatNotificationTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  return date.toLocaleDateString("es-PY", { day: "numeric", month: "short" });
}

export function resolveNotificationPath(notification, role) {
  const title = (notification.title ?? "").toLowerCase();
  const ref = notification.referenceId ?? notification.reference_id;

  if (role === "SELLER") {
    if (
      title.includes("pedido") ||
      title.includes("delivery") ||
      title.includes("repartidor") ||
      title.includes("sin deliveries")
    ) {
      return "/comercio/pedidos";
    }
    if (title.includes("comercio")) return "/comercio";
    return ref ? "/comercio/pedidos" : null;
  }

  if (role === "DELIVERY") {
    return "/delivery/order";
  }

  if (title === "comercio aprobado" || title === "solicitud de comercio rechazada") {
    return "/comercio";
  }

  return ref ? `/pedidos/${ref}` : null;
}

export function NotificationBellDropdown({
  role = "CUSTOMER",
  iconSize = 22,
  buttonStyle = {},
  className = "",
}) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/api/notifications");
      const list = data.notifications ?? [];
      setNotifications(list);
      setUnreadCount(data.unreadCount ?? list.filter((n) => !n.read).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 45000);
    const onUpdated = () => loadNotifications();
    window.addEventListener("notificationsUpdated", onUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", onUpdated);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (
        panelRef.current?.contains(e.target) ||
        buttonRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    }
  };

  const handleSelect = async (notification) => {
    if (!notification.read) {
      try {
        await apiClient.patch(`/api/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        window.dispatchEvent(new Event("notificationsUpdated"));
      } catch {
        // ignore
      }
    }

    const path = resolveNotificationPath(notification, role);
    setOpen(false);
    if (path) navigate(path);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={className}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          borderRadius: "999px",
          color: "#2f3e39",
          ...buttonStyle,
        }}
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell size={iconSize} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              backgroundColor: "#ef4444",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 360,
              maxWidth: "min(360px, calc(100vw - 24px))",
              backgroundColor: "white",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              border: "1px solid #e5e7eb",
              zIndex: 1000,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f3f4f6",
                fontWeight: 700,
                fontSize: 15,
                color: "#111827",
              }}
            >
              Notificaciones
            </div>

            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {loading && (
                <p style={{ padding: 16, margin: 0, fontSize: 13, color: "#6b7280" }}>
                  Cargando...
                </p>
              )}
              {!loading && notifications.length === 0 && (
                <p style={{ padding: 24, margin: 0, textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
                  No tenés notificaciones nuevas
                </p>
              )}
              {!loading &&
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleSelect(n)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      border: "none",
                      borderBottom: "1px solid #f9fafb",
                      cursor: "pointer",
                      backgroundColor: n.read ? "white" : "#f0fdf4",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: n.read ? 500 : 700,
                        color: "#111827",
                      }}
                    >
                      {n.title}
                    </p>
                    {n.message && (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563", lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    )}
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>
                      {formatNotificationTime(n.createdAt)}
                    </p>
                  </button>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}

NotificationBellDropdown.propTypes = {
  role: PropTypes.string,
  iconSize: PropTypes.number,
  buttonStyle: PropTypes.object,
  className: PropTypes.string,
};
