'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';

import { JOB_LISTINGS, JobListing } from '../../constants/careers';
import { STATIC_PAGE_SEO } from '../../constants/pageSeo';
import JobCard from '../common/JobCard/JobCard';

import ApplyModal from './ApplyModal';

type CareersSectionProps = {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setTotalPages: Dispatch<SetStateAction<number>>;
};

export default function CareersSection({
  currentPage,
  setCurrentPage,
  setTotalPages,
}: CareersSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJobForApplication, setSelectedJobForApplication] =
    useState<JobListing | null>(null);
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 9;

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return JOB_LISTINGS;
    }

    return JOB_LISTINGS.filter((job) =>
      job.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  useEffect(() => {
    setTotalPages(totalPages);
  }, [totalPages, setTotalPages]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage]);

  const toggleJob = (jobId: string) => {
    setExpandedJobIds((current) => {
      const next = new Set(current);

      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }

      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className='flex flex-col gap-3 md:gap-6'>
      <div className='border-career-stroke border-b-2 pb-2'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='relative flex h-8.25 shrink-0 items-center'>
            <span className='bg-primary absolute left-0 h-5.5 w-1 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)]' />
            <h1 className='text-career-heading text-heading-small pl-3 leading-7 font-bold md:text-2xl'>
              {STATIC_PAGE_SEO.careers.h1}
            </h1>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className='border-career-input-border bg-surface flex h-10.5 w-full shrink-0 items-center gap-2 rounded-md border py-1 pr-1 pl-2 lg:ml-auto lg:max-w-79.25'
          >
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <IoIosSearch className='text-career-muted size-4 shrink-0' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder='Search opportunities'
                className='placeholder:text-career-muted text-career-dark min-w-0 flex-1 border-none bg-transparent text-sm leading-4.5 focus:outline-none'
                aria-label='Search opportunities'
              />
            </div>
            <button
              type='submit'
              className='bg-career-search shrink-0 rounded px-3 py-[9px] text-xs leading-4 font-semibold text-white transition-opacity hover:opacity-90'
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className='xs:grid-cols-2 grid grid-cols-1 justify-items-center gap-4 md:gap-5 lg:grid-cols-3'>
        {(paginatedJobs?.length ?? 0) > 0 ? (
          paginatedJobs?.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isExpanded={expandedJobIds.has(job.id)}
              onToggle={() => toggleJob(job.id)}
              onApply={() => setSelectedJobForApplication(job)}
            />
          ))
        ) : (
          <p className='text-career-muted w-full py-4 text-sm'>
            No opportunities found
          </p>
        )}
      </div>

      <ApplyModal
        key={selectedJobForApplication?.id}
        isOpen={!!selectedJobForApplication}
        onClose={() => setSelectedJobForApplication(null)}
        job={selectedJobForApplication}
      />
    </section>
  );
}
