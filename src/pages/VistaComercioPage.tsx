import { CategoryFilterSidebar } from "../features/commerces/components/CategoryFilterSidebar";
import { CommerceProfileHeader } from "../features/commerces/components/CommerceProfileHeader";
import { FeaturedProducts } from "../features/commerces/components/FeaturedProducts";
import { Pagination } from "../features/commerces/components/Pagination";
import "../styles/vistaComercio.css";

// Mock data — reemplazar con datos reales cuando se conecte el backend
const MOCK_PRODUCTS = [
    { id: 1, name: "Samsung Galaxy S24 Ultra", price: "Gs. 8.500.000" },
    { id: 2, name: "Samsung Galaxy S24 Ultra", price: "Gs. 8.500.000" },
    { id: 3, name: "Samsung Galaxy S24 Ultra", price: "Gs. 8.500.000" },
    { id: 4, name: "Samsung Galaxy S24 Ultra", price: "Gs. 8.500.000" },
];

export const VistaComercioPage = () => {
    return (
        <div className="vista-comercio-container">
            {/* Breadcrumb */}
            <div className="d-flex align-items-center gap-2 px-4 py-3">
                <span className="cursor-pointer text-muted">←</span>
                <h5 className="fw-bold mb-0">Comercios / Nissei</h5>
            </div>

            {/* Commerce profile banner */}
            <CommerceProfileHeader
                name="Nissei"
                category="Produtos varios"
                isOpen={true}
                rating={4.7}
                reviews={542}
                closesAt="20:00"
            />

            {/* Main content: sidebar + products */}
            <div className="d-flex gap-4 px-4 pb-4">
                <CategoryFilterSidebar />

                <div className="flex-grow-1">
                    <FeaturedProducts products={MOCK_PRODUCTS} />
                </div>
            </div>

            {/* Pagination */}
            <Pagination totalPages={68} />
        </div>
    );
};