import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchFilterSidebar } from "../components/search/SearchFilterSidebar";
import { SearchProductCard } from "../components/search/SearchProductCard";
import { Pagination } from "../components/commerceProfile/Pagination";


// Mock data — reemplazar con resultados reales del backend
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

type Props = {
    query?: string;
};

export const BusquedaPage = ({ query = "Celular" }: Props) => {
    const navigate = useNavigate();

    const columns = [
        MOCK_PRODUCTS.slice(0, 2),
        MOCK_PRODUCTS.slice(2, 4),
        MOCK_PRODUCTS.slice(4, 6),
        MOCK_PRODUCTS.slice(6, 8),
    ];

    const handleBack = () => {
        navigate(-1); // Volver a la página anterior
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", backgroundColor: "#F3F3F3", paddingBottom: "44px" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "20px", marginLeft: "25px", marginTop: "16px", gap: "4px" }}>
                <ArrowLeft
                    size={24}
                    style={{ cursor: "pointer", color: "#6b7280" }}
                    onClick={handleBack} 
                />
                <span style={{ color: "#000000", fontSize: "25px", fontWeight: "bold" }}>
                    Resultado de Búsqueda para: {query}
                </span>
            </div>

            {/* Main content */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", width: "100%", paddingLeft: "26px", paddingRight: "26px", gap: "28px", marginBottom: "40px", boxSizing: "border-box" }}>

                {/* Sidebar */}
                <div style={{ flexShrink: 0, width: "220px" }}>
                    <SearchFilterSidebar
                        onPriceApply={(min, max) => console.log("Precio:", min, max)}
                    />
                </div>

                {/* 4 columnas */}
                {columns.map((col, colIdx) => (
                    <div key={colIdx} style={{ display: "flex", flexDirection: "column", flex: 1, gap: "29px" }}>
                        {col.map((product) => (
                            <SearchProductCard
                                key={product.id}
                                name={product.name}
                                price={product.price}
                                imageUrl={product.imageUrl}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <Pagination totalPages={68} />
        </div>
    );
};