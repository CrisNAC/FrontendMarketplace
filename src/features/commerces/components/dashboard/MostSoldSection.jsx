import "../../styles/commerces.css";

export const MostSoldSection = ({ products = [] }) => {
    return (
        <div className="card shadow-sm p-3">
            <div className="d-flex justify-content-between mb-3">
                <h6>Más Vendidos</h6>
                <span className="text-primary small cursor-pointer">Ver todos</span>
            </div>

            {products.length === 0 && (
                <p className="small text-muted">No hay productos disponibles.</p>
            )}

            {products.map((product, index) => (
                <div
                    key={product.id_product}
                    className={`sold-item p-2 rounded d-flex justify-content-between align-items-center ${index < products.length - 1 ? "mb-3" : ""}`}
                >
                    <div>
                        <strong>{product.name}</strong>
                        <div className="small text-muted">
                            $ {Number(product.price).toLocaleString("es-CL")}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};