// Import el badge de activo despues
import "../../styles/commerces.css";

export const MostSoldSection = () => {
    return (
        <div className="card shadow-sm p-3">
            <div className="d-flex justify-content-between mb-3">
                <h6>Más Vendidos</h6>
                <span className="text-primary small cursor-pointer">
                    Ver todos
                </span>
            </div>

            <div className="sold-item p-2 rounded mb-3 d-flex justify-content-between align-items-center">
                <div>
                    <strong>Lámpara de Escritorio LED</strong>
                    <div className="small text-muted">
                        <span className="text-danger fw-semibold">243 ventas</span> · $ 24.990
                    </div>
                </div>
                {/*<Badge bg="success">Activo</Badge>*/}
            </div>

            <div className="sold-item p-2 rounded mb-3 d-flex justify-content-between align-items-center">
                <div>
                    <strong>Silla Ergonómica Oficina</strong>
                    <div className="small text-muted">
                        <span className="text-danger fw-semibold">156 ventas</span> · $ 89.990
                    </div>
                </div>
                {/*<Badge bg="success">Activo</Badge>*/}
            </div>

            <div className="sold-item p-2 rounded d-flex justify-content-between align-items-center">
                <div>
                    <strong>Organizador de Escritorio</strong>
                    <div className="small text-muted">
                        <span className="text-danger fw-semibold">89 ventas</span> · $ 15.990
                    </div>
                </div>
                {/*<Badge bg="success">Activo</Badge>*/}
            </div>
        </div>
    );
};