import { useState } from "react";

export const Pagination = ({ totalPages }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const pageBtn = (page) => (
        <button
            key={page}
            onClick={() => handlePage(page)}
            style={{
                flexShrink: 0,
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                backgroundColor: currentPage === page ? "#2C2C2C" : "transparent",
                color: currentPage === page ? "#f5f5f5" : "#1E1E1E",
            }}
        >
            {page}
        </button>
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                paddingTop: "16px",
                paddingBottom: "16px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <button
                    onClick={() => handlePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "8px 12px",
                        gap: "8px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        color: "#757575",
                        opacity: currentPage === 1 ? 0.4 : 1,
                    }}
                >
                    ← Previous
                </button>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {[1, 2, 3].map(pageBtn)}
                    <span
                        style={{
                            padding: "8px 16px",
                            fontWeight: "bold",
                            color: "#000",
                        }}
                    >
                        ...
                    </span>
                    {[totalPages - 1, totalPages].map(pageBtn)}
                </div>

                <button
                    onClick={() => handlePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        padding: "8px 12px",
                        gap: "11px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        color: "#1E1E1E",
                        opacity: currentPage === totalPages ? 0.4 : 1,
                    }}
                >
                    Next →
                </button>
            </div>
        </div>
    );
};