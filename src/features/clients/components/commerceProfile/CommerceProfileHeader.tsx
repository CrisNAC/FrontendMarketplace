import "../../styles/vistaComercio.css";

type Props = {
    name: string;
    category: string;
    isOpen: boolean;
    rating: number;
    reviews: number;
    closesAt: string;
    logoUrl?: string;
};

export const CommerceProfileHeader = ({
    name,
    category,
    isOpen,
    rating,
    reviews,
    closesAt,
    logoUrl,
}: Props) => {
    return (
        <div className="commerce-profile-header rounded-4 p-4 mb-4 mx-4 position-relative">
            <div className="d-flex align-items-center gap-4">
                {/* Logo */}
                <div className="commerce-logo-wrapper d-flex align-items-center justify-content-center rounded-circle bg-white">
                    {logoUrl ? (
                        <img src={logoUrl} alt={name} className="commerce-logo" />
                    ) : (
                        <span className="commerce-logo-placeholder fw-bold text-muted">{name[0]}</span>
                    )}
                </div>

                {/* Info */}
                <div>
                    {/* Name + badges */}
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <h2 className="fw-bold mb-0">{name}</h2>
                        <span className="badge-category">{category}</span>
                        <span className={`badge-status ${isOpen ? "open" : "closed"}`}>
                            {isOpen ? "Abierto" : "Cerrado"}
                        </span>
                    </div>

                    {/* Rating + closing time */}
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span>⭐</span>
                        <span className="fw-bold">{rating}</span>
                        <span className="text-muted small">{reviews} reseñas</span>
                        <span className="text-muted small">· Cierra a las {closesAt}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex gap-2">
                        <button className="btn btn-commerce-action">
                                Llamar
                        </button>
                        <button className="btn btn-commerce-action">
                                Email
                        </button>
                        <button className="btn btn-commerce-action-light">
                                Como llegar
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating search bar */}
            <div className="commerce-search-bar d-flex align-items-center justify-content-between rounded-pill px-3 py-1 bg-white position-absolute">
                <span className="text-muted small">Buscar en {name}</span>
                <div className="commerce-search-icon-btn d-flex align-items-center justify-content-center rounded-circle"></div>
            </div>
        </div>
    );
};