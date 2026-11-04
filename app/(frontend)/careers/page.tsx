'use client';

import { useState } from 'react';

import CareersSection from '@/components/career/CareersSection';
import Pagination from '@/components/career/Pagination/Pagination';
import ContentPanel from '@/components/common/ContentPanel';

export default function CareerPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  return (
    <>
      <ContentPanel>
        <CareersSection
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setTotalPages={setTotalPages}
        />
      </ContentPanel>

      {totalPages > 1 && (
        <div className='mx-auto w-full max-w-[950px] min-w-0'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
}
