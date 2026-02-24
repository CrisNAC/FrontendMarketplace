import "../styles/commerces.css";

export const ProductItem = ({ name, detail }) => {
    return (
        <div className="product-item p-2 rounded mb-2">
            <div>
                <strong>{name}</strong>
                <div className="small text-muted">{detail}</div>
            </div>
        </div>
    );
};