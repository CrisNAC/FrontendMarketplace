import { ProductCard } from "./ProductCard";
import "../styles/vistaComercio.css";

type Product = {
    id: number;
    name: string;
    price: string;
    imageUrl?: string;
};

type Props = {
    products: Product[];
};

export const FeaturedProducts = ({ products }: Props) => {
    return (
        <div className="flex-grow-1">
            <h5 className="fw-bold mb-4">Productos Destacados</h5>

            <div className="row g-4">
                {products.map((product) => (
                    <div key={product.id} className="col-md-3">
                        <ProductCard
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};