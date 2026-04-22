import ProductClaimsPanel from "../../reports/ProductClaimsPanel";

export default function CommerceClaims() {
  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="font-semibold text-lg mb-1">Reclamos sobre tus productos</h2>
        <p className="text-sm text-gray-500 mb-4">
          Reclamos reportados por compradores sobre productos de tu tienda.
        </p>
        <ProductClaimsPanel canResolve={true} />
      </main>
    </div>
  );
}
