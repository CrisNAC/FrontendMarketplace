import { SearchProductCard } from "./SearchProductCard";

type Product = {
    id: number;
    name: string;
    price: string;
    imageUrl?: string;
};

type Props = {
    query: string;
    products: Product[];
};

export const SearchResultsGrid = ({ query, products }: Props) => {
    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-5">
                <span className="cursor-pointer text-gray-500 text-lg">←</span>
                <h5 className="font-bold text-xl mb-0">
                    Resultado de Búsqueda para:{" "}
                    <span style={{ color: "var(--primary-dark)" }}>{query}</span>
                </h5>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                    <SearchProductCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        imageUrl={product.imageUrl}
                    />
                ))}
            </div>
        </div>
    );
};