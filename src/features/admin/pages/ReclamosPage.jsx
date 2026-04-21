import { useState } from "react";
import { MessageSquare, Flag } from "lucide-react";
import ProductClaimsPanel from "../../reports/ProductClaimsPanel";
import ReviewReportsPanel from "../../reports/ReviewReportsPanel";

export default function ModeracionResenas() {
  const [tab, setTab] = useState("reviews");

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-4">
          Moderación de reseñas y reclamos
        </h1>

        <div className="bg-gray-200 p-3 rounded-lg text-sm mb-4">
          Reportes de reseñas y reclamos sobre productos cargados.
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab("reviews")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              tab === "reviews"
                ? "bg-[#6B9080] text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            <MessageSquare size={16} />
            Reseñas reportadas
          </button>

          <button
            type="button"
            onClick={() => setTab("claims")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              tab === "claims"
                ? "bg-[#6B9080] text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            <Flag size={16} />
            Reclamos de producto
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl">
          {tab === "reviews" ? (
            <>
              <h2 className="font-semibold mb-3">Reseñas denunciadas</h2>
              <ReviewReportsPanel embedded />
            </>
          ) : (
            <>
              <h2 className="font-semibold mb-3">Reclamos de usuarios</h2>
              <ProductClaimsPanel canResolve={false} embedded />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
