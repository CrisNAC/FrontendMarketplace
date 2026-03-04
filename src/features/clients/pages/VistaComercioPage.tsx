import { ArrowLeft } from "lucide-react";
import { CategoryFilterSidebar } from "../components/commerceProfile/CategoryFilterSidebar";
import { CommerceProfileHeader } from "../components/commerceProfile/CommerceProfileHeader";
import { FeaturedProducts } from "../components/commerceProfile/FeaturedProducts";
import { Pagination } from "../components/commerceProfile/Pagination";

// Mock data — reemplazar con datos reales del backend
const MOCK_PRODUCTS = [
    {
        id: 1,
        name: "Apple iPhone 15 A3092 Dual",
        price: "6.900.000",
        imageUrl: "https://compumarket.com.py/storage/sku/apple-smartphone-apple-iphone-15-128gb-blue-dual-chip-a3092-1-1-1717678175.jpg?v=1717678175",
    },
    {
        id: 2,
        name: "Realme C67 RMX3890 Dual",
        price: "1.042.000",
        imageUrl: "https://m.media-amazon.com/images/I/715bzjyJkYL.jpg_BO30,255,255,255_UF750,750_SR1910,1000,0,C_QL100_.jpg",
    },
    {
        id: 3,
        name: "Samsung Galaxy A25",
        price: "2.045.000",
        imageUrl: "https://compumarket.com.py/storage/sku/samsung-smartphone-samsung-galaxy-a25-duos-128gb-blue-1-1-1705093909.jpg?v=1705093909",
    },
    {
        id: 4,
        name: "Samsung Galaxy S24 Ultra",
        price: "8.500.000",
        imageUrl: "https://www.hardreset.info/media/resetinfo/2024/128/f171dde54dfd4fc09917a7e18b1e61e1.jpg",
    },
    {
        id: 5,
        name: "Apple iPhone 17 Pro Max",
        price: "13.250.000",
        imageUrl: "https://cdn.thewirecutter.com/wp-content/media/2025/09/BG-IPHONE-2048px_IPHONE-17-PRO-MAX_BACK.jpg?auto=webp&quality=75&width=1024",
    },
    {
        id: 6,
        name: "Samsung A36",
        price: "2.350.000",
        imageUrl: "https://www.gonzalezgimenez.com.py/storage/sku/samsung-celulares-celular-samsung-a36-256gb-5g-awesome-white-sm-a366eza-1-1-1744405011.jpg?v=1744405011",
    },
    {
        id: 7,
        name: "Apple iPhone 13",
        price: "4.587.000",
        imageUrl: "https://buy.gazelle.com/cdn/shop/files/iPhone_13_Pro_-_Gold_-_Overlap_Trans-cropped.jpg?v=1757019229&width=1946",
    },
    {
        id: 8,
        name: "Xiaomi Redmi Note 13 Pro Duos",
        price: "2.679.000",
        imageUrl: "https://compumarket.com.py/storage/sku/xiaomi-telefonia-xiaomi-redmi-note-13-pro-duos-5g-8gb256gb-ocean-teal-turquesa-2-1-1726079262.jpg?v=1726079262",
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
                category="Productos varios"
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