import { SearchFilterSidebar } from "../components/SearchFilterSidebar";
import { SearchProductCard } from "../components/SearchProductCard";
import { Pagination } from "../components/Pagination";

// Mock data — reemplazar con resultados reales al conectar el backend
const MOCK_PRODUCTS = [
    { id: 1, name: "Apple iPhone 15 A3092 Dual", price: "6.900.000" },
    { id: 2, name: "Realme C67 RMX3890 Dual",    price: "1.042.000" },
    { id: 3, name: "Samsung Galaxy A25",           price: "2.045.000" },
    { id: 4, name: "Samsung Galaxy S24 Ultra",     price: "8.500.000" },
    { id: 5, name: "Apple iPhone 15 A3092 Dual",  price: "6.900.000" },
    { id: 6, name: "Apple iPhone 15 A3092 Dual",  price: "6.900.000" },
    { id: 7, name: "Apple iPhone 15 A3092 Dual",  price: "6.900.000" },
    { id: 8, name: "Apple iPhone 15 A3092 Dual",  price: "6.900.000" },
];

type Props = {
    query?: string;
};

export const BusquedaPage = ({ query = "Celular" }: Props) => {
    // 4 columnas de 2 productos cada una (igual al Figma)
    const columns = [
        MOCK_PRODUCTS.slice(0, 2),
        MOCK_PRODUCTS.slice(2, 4),
        MOCK_PRODUCTS.slice(4, 6),
        MOCK_PRODUCTS.slice(6, 8),
    ];

    return (
        <div className="flex flex-col items-start w-full bg-[#F3F3F3] pb-11">

            {/* Breadcrumb */}
            <div className="flex flex-row items-center mb-5 ml-[25px] mt-4 gap-1">
                <span className="text-gray-500 cursor-pointer text-2xl">←</span>
                <span className="text-black text-[25px] font-bold">
                    Resultado de Busqueda para: {query}
                </span>
            </div>

            {/* Main content: sidebar + 4 columnas de productos */}
            <div className="flex flex-row items-start w-full mb-[101px] px-[26px] gap-7">

                {/* Sidebar: ancho fijo, no crece */}
                <SearchFilterSidebar
                    onPriceApply={(min, max) => console.log("Precio:", min, max)}
                />

                {/* 4 columnas de productos */}
                {columns.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-1 flex-col gap-[29px]">
                        {col.map((product) => (
                            <SearchProductCard
                                key={product.id}
                                name={product.name}
                                price={product.price}
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