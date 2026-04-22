import ProductClaimsPanel from "../../reports/ProductClaimsPanel";

export default function ReclamosList() {
  return (
    <div className="bg-white p-4 rounded-xl">
      <h2 className="font-semibold mb-1">Reclamos de usuarios</h2>
      <p className="text-sm text-gray-500 mb-4">
        Reportes de productos en todo el marketplace. La resolución la hace cada
        comercio desde su panel.
      </p>
      <ProductClaimsPanel canResolve={false} embedded />
    </div>
  );
}
