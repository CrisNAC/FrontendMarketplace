import { useState } from "react";

type Props = {
    totalPages: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
};

export const Pagination = ({ totalPages, currentPage, onPageChange }: Props) => {
    const [internalPage, setInternalPage] = useState(1);
    const page = currentPage ?? internalPage;

    const handlePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        if (onPageChange) {
            onPageChange(nextPage);
        } else {
            setInternalPage(nextPage);
        }
    };

    const pageBtn = (page: number) => (
        <button
            key={page}
            onClick={() => handlePage(page)}
            className={`shrink-0 py-2 px-3 rounded-lg text-base transition-colors ${
                page === currentPage || (!currentPage && internalPage === page)
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
                    onClick={() => handlePage(page - 1)}
                    disabled={page === 1}
                    className="flex flex-row shrink-0 items-center py-2 px-3 gap-2 rounded-lg text-[#757575] disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                    ← Previous
                </button>

                {/* Pages */}
                <div className="flex flex-row shrink-0 items-center gap-2">
                    {totalPages <= 5
                        ? Array.from({ length: totalPages }, (_, i) => i + 1).map(pageBtn)
                        : (
                            <>
                                {[1, 2, 3].map(pageBtn)}
                                <span className="py-2 px-4 font-bold text-black">...</span>
                                {[totalPages - 1, totalPages].map(pageBtn)}
                            </>
                        )}
                </div>

                {/* Next */}
                <button
                    onClick={() => handlePage(page + 1)}
                    disabled={page === totalPages}
                    className="flex flex-row shrink-0 items-center py-2 px-3 gap-[11px] rounded-lg text-[#1E1E1E] disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};