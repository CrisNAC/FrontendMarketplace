import "../../styles/vistaComercio.css";

type Props = {
    name: string;
    price: string;
    imageUrl?: string;
};

export const ProductCard = ({ name, price, imageUrl }: Props) => {
    return (
        <div className="product-card rounded-3 overflow-hidden">
            {/* Product image */}
            <div className="product-card-image d-flex align-items-center justify-content-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="product-card-img" />
                ) : (
                    <div className="product-card-img-placeholder" />
                )}
            </div>

            {/* Product info */}
            <div className="product-card-body px-3 pt-2 pb-3">
                <p className="product-card-name small fw-semibold mb-1">{name}</p>
                <p className="product-card-price small text-muted mb-2">{price}</p>
                <button className="btn btn-product-card w-100">Ver mas</button>
            </div>
        </div>
    );
};