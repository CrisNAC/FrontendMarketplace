import { ArrowLeft } from "lucide-react";
import { CategoryFilterSidebar } from "../components/commerceProfile/CategoryFilterSidebar";
import { CommerceProfileHeader } from "../components/commerceProfile/CommerceProfileHeader";
import { FeaturedProducts } from "../components/commerceProfile/FeaturedProducts";
import { Pagination } from "../components/commerceProfile/Pagination";

// Mock data — reemplazar con datos reales del backend
const MOCK_PRODUCTS = [
    {
        id: 1,
        name: "Samsung Galaxy S24 Ultra",
        price: "8.500.000",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Samsung_Galaxy_S24_Ultra_top.jpg/800px-Samsung_Galaxy_S24_Ultra_top.jpg",
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        price: "8.500.000",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Samsung_Galaxy_S24_Ultra_top.jpg/800px-Samsung_Galaxy_S24_Ultra_top.jpg",
    },
    {
        id: 3,
        name: "Samsung Galaxy S24 Ultra",
        price: "8.500.000",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Samsung_Galaxy_S24_Ultra_top.jpg/800px-Samsung_Galaxy_S24_Ultra_top.jpg",
    },
    {
        id: 4,
        name: "Samsung Galaxy S24 Ultra",
        price: "8.500.000",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Samsung_Galaxy_S24_Ultra_top.jpg/800px-Samsung_Galaxy_S24_Ultra_top.jpg",
    },
];

export const VistaComercioPage = () => {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--background-soft)" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", padding: "16px 24px" }}>
                <ArrowLeft size={24} style={{ cursor: "pointer", color: "#6b7280" }} />
                <h5 style={{ fontWeight: "bold", fontSize: "20px", margin: 0 }}>Comercios / Nissei</h5>
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
            <div style={{ display: "flex", flexDirection: "row", gap: "24px", padding: "40px 24px 24px 24px" }}>
                <CategoryFilterSidebar />
                <FeaturedProducts products={MOCK_PRODUCTS} />
            </div>

            {/* Pagination */}
            <Pagination totalPages={68} />
        </div>
    );
};