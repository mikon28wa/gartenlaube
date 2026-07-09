import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function ListingPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: ListingPaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        className="p-2 rounded-lg border border-[#C85A3A] text-[#C85A3A] hover:bg-[#C85A3A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Vorherige Seite"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg border border-[#E8D5C4] text-[#333] hover:bg-[#E8D5C4] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            1
          </button>
          {startPage > 2 && <span className="text-[#999]">...</span>}
        </>
      )}

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`px-3 py-2 rounded-lg transition-all duration-200 ${
            page === currentPage
              ? 'bg-[#C85A3A] text-white border border-[#C85A3A]'
              : 'border border-[#E8D5C4] text-[#333] hover:bg-[#E8D5C4] disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-[#999]">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg border border-[#E8D5C4] text-[#333] hover:bg-[#E8D5C4] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        className="p-2 rounded-lg border border-[#C85A3A] text-[#C85A3A] hover:bg-[#C85A3A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Nächste Seite"
      >
        <ChevronRight size={20} />
      </button>

      {/* Page Info */}
      <div className="ml-4 text-sm text-[#666]">
        Seite {currentPage} von {totalPages}
      </div>
    </div>
  );
}
