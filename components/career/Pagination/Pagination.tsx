import { Dispatch, SetStateAction } from 'react';
import { BiSolidChevronLeft, BiSolidChevronRight } from 'react-icons/bi';

import { PaginationItem } from './PaginationItem';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: Dispatch<SetStateAction<number>>;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <nav
      aria-label='Pagination'
      className='flex w-full items-center justify-center gap-1.5 pt-6 pb-4'
    >
      <PaginationItem
        aria-label='Previous page'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <BiSolidChevronLeft
          className='text-career-heading size-4'
          aria-hidden
        />
      </PaginationItem>

      {pages[0] > 1 && (
        <>
          <PaginationItem onClick={() => onPageChange(1)}>1</PaginationItem>
          {pages[0] > 2 && (
            <span
              className='text-career-dark px-1 text-sm leading-4 font-semibold'
              aria-hidden
            >
              ...
            </span>
          )}
        </>
      )}

      {pages.map((page) => (
        <PaginationItem
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PaginationItem>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span
              className='text-career-dark px-1 text-sm leading-4 font-semibold'
              aria-hidden
            >
              ...
            </span>
          )}
          <PaginationItem onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationItem>
        </>
      )}

      <PaginationItem
        aria-label='Next page'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <BiSolidChevronRight
          className='text-career-heading size-4'
          aria-hidden
        />
      </PaginationItem>
    </nav>
  );
}
