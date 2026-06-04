import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../lib/apiClient";
import { PageLoader } from "../../../components/PageLoader";
import { EmptyState } from "../../../components/EmptyState";

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await apiClient.get("/api/notifications");
            setNotifications(data.notifications ?? []);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async (notification) => {
        if (!notification.read) {
            try {
                await apiClient.patch(`/api/notifications/${notification.id}/read`);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n
                    )
                );
            } catch {
                // el interceptor de apiClient maneja errores globales
            }
        }

        const title = notification.title?.toLowerCase() ?? "";
        const isCommerceNotification =
            title === "comercio aprobado" ||
            title === "solicitud de comercio rechazada";

        if (isCommerceNotification) {
            navigate("/comercio");
            return;
        }

        const referenceId = notification.referenceId ?? notification.reference_id;
        if (referenceId) {
            navigate(`/pedidos/${referenceId}`);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="max-w-[1100px] mx-auto w-full">
            {loading ? (
                <PageLoader />
            ) : notifications.length === 0 ? (
                <EmptyState
                    message="No tenés notificaciones"
                    subtitle="Cuando haya novedades, aparecerán aquí."
                />
            ) : (
                <ul className="flex flex-col gap-2">
                    {notifications.map((n) => (
                        <li key={n.id}>
                            <button
                                type="button"
                                aria-pressed={n.read}
                                aria-label={n.title}
                                onClick={() => handleClick(n)}
                                className={`w-full text-left p-4 rounded-lg border transition-colors ${n.read
                                    ? "bg-white border-gray-200 text-gray-500"
                                    : "bg-[#eaf1ec] border-[#a8c5ae] text-[#2d4030] font-medium"
                                    } ${((n.referenceId ?? n.reference_id) || n.title?.toLowerCase() === "comercio aprobado" || n.title?.toLowerCase() === "solicitud de comercio rechazada") ? "hover:bg-[#d6e8da] cursor-pointer" : "hover:bg-gray-50"}`}
                            >
                                <p className="text-sm font-semibold">{n.title}</p>
                                {n.message && (
                                    <p className="text-sm mt-0.5">{n.message}</p>
                                )}
                                <p className="text-xs mt-1 text-gray-400">
                                    {new Date(n.createdAt).toLocaleString("es-PY", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
