import { useState } from "react";

type Props = {
    totalPages: number;
};

export const Pagination = ({ totalPages }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const pageBtn = (page: number) => (
        <button
            key={page}
            onClick={() => handlePage(page)}
            className={`shrink-0 py-2 px-3 rounded-lg text-base transition-colors ${
                currentPage === page
                    ? "bg-[#2C2C2C] text-neutral-100"
                    : "text-[#1E1E1E] hover:bg-gray-100"
            }`}
        >
            {page}
        </button>
    );

    return (
        <div className="flex flex-col items-center w-full py-4">
            <div className="flex flex-row items-center gap-2">
                {/* Previous */}
                <button
                    onClick={() => handlePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex flex-row shrink-0 items-center py-2 px-3 gap-2 rounded-lg text-[#757575] disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                    ← Previous
                </button>

                {/* Pages */}
                <div className="flex flex-row shrink-0 items-center gap-2">
                    {[1, 2, 3].map(pageBtn)}
                    <span className="py-2 px-4 font-bold text-black">...</span>
                    {[totalPages - 1, totalPages].map(pageBtn)}
                </div>

                {/* Next */}
                <button
                    onClick={() => handlePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex flex-row shrink-0 items-center py-2 px-3 gap-[11px] rounded-lg text-[#1E1E1E] disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};