import "../styles/commerces.css";

export const SideBar = () => {
    return (
        <div className="sidebar p-3 d-flex flex-column">
            <h5 className="mb-4 text-white">Mi Comercio</h5>

            <ul className="nav flex-column">
                <li className="nav-item mb-2">
                    <span className="nav-link active">Dashboard</span>
                </li>
                <li className="nav-item mb-2">
                    <span className="nav-link">Productos</span>
                </li>
                <li className="nav-item mb-2">
                    <span className="nav-link">Colecciones</span>
                </li>
                <li className="nav-item mb-2">
                    <span className="nav-link">Delivery</span>
                </li>
                <li className="nav-item mb-2">
                    <span className="nav-link">Perfil</span>
                </li>
                <li className="nav-item mb-2">
                    <span className="nav-link">Cerrar Sesion</span>
                </li>
            </ul>

            <div className="help-box mt-5 p-3 rounded">
                <small>Necesitas ayuda?</small>
                <p className="small mb-0">
                    Consulta nuestra guia para comercios o contacta soporte
                </p>
            </div>
        </div>
    );
};