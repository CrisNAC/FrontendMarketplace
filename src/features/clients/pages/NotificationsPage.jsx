import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarClientProfile } from "../../../components/SidebarClientProfile";
import apiClient from "../../../lib/apiClient";

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

        const referenceId = notification.referenceId ?? notification.reference_id;
        if (referenceId) {
            const title = notification.title?.toLowerCase() ?? "";
            const isCommerceNotification =
                title === "comercio aprobado" ||
                title === "solicitud de comercio rechazada";

            if (isCommerceNotification) {
                navigate("/comercio");
                return;
            }
            navigate(`/pedidos/${referenceId}`);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="flex gap-6 p-6 max-w-5xl mx-auto">
            <aside className="w-56 shrink-0">
                <SidebarClientProfile />
            </aside>

            <main className="flex-1">
                <h1 className="text-2xl font-bold text-[#2d4030] mb-4">
                    Notificaciones
                </h1>

                {loading ? (
                    <p className="text-gray-500">Cargando...</p>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg font-medium">No tenés notificaciones</p>
                        <p className="text-sm mt-1">Cuando haya novedades, aparecerán aquí.</p>
                    </div>
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
                                        } ${(n.referenceId ?? n.reference_id) ? "hover:bg-[#d6e8da] cursor-pointer" : "hover:bg-gray-50"}`}
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
            </main>
        </div>
    );
};

export default NotificationsPage;
