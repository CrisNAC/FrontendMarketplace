import "../styles/commerces.css";

export const StatCard = ({ title, value }) => {
    return (
        <div className="card shadow-sm stat-card">
            <div className="card-body">
                <p className="text-muted mb-1">{title}</p>
                <h4 className="fw-bold">{value}</h4>
            </div>
        </div>
    );
};
