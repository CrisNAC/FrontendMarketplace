import "../../styles/commerces.css";

export const CollectionCard = ({ title, description, products }) => {
    return (
        <div className="collection-card p-3 rounded h-100">
            <h6 className="fw-semibold mb-2">{title}</h6>
            <p className="small text-muted">{description}</p>

            <div className="mt-3 text-primary small fw-semibold cursor-pointer">
                {products}
            </div>
        </div>
    );
};