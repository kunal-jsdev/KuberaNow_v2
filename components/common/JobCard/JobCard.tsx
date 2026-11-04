'use client';

import type { IconType } from 'react-icons';
import { GoArrowRight } from 'react-icons/go';
import { HiOutlineBriefcase } from 'react-icons/hi2';
import { IoLocationOutline } from 'react-icons/io5';
import { TbCurrencyRupee } from 'react-icons/tb';

import Link from 'next/link';

import type { JobListing } from '../../../constants/careers';

import './JobCard.css';

type JobDetailKey = 'experience' | 'salary' | 'location';

const JOB_DETAIL_ROWS: { key: JobDetailKey; Icon: IconType }[] = [
  { key: 'experience', Icon: HiOutlineBriefcase },
  { key: 'salary', Icon: TbCurrencyRupee },
  { key: 'location', Icon: IoLocationOutline },
];

type JobCardProps = {
  job: JobListing;
  isExpanded?: boolean;
  onToggle?: () => void;
  onApply?: (job: JobListing) => void;
  className?: string;
};

export default function JobCard({
  job,
  isExpanded = false,
  onToggle,
  onApply,
  className = '',
}: JobCardProps) {
  const hasRequirements = Boolean(job.requirements?.length);

  return (
    <article
      role='button'
      aria-expanded={isExpanded}
      onClick={onToggle}
      className={`job-card flex h-fit w-full cursor-pointer flex-col rounded-lg p-4 md:max-w-72.5 ${
        isExpanded ? 'job-card--expanded' : ''
      } ${className}`}
    >
      <div className='flex w-full flex-col gap-4'>
        <div className='border-career-stroke flex w-full flex-col gap-1 border-b pb-1'>
          <h3
            className={`text-career-dark xs:text-wrap-none flex min-h-11 items-center text-lg leading-5.5 font-bold text-wrap ${
              isExpanded ? '' : 'truncate'
            }`}
          >
            {job.title}
          </h3>
        </div>

        <div className='flex w-full flex-col gap-4'>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex flex-col gap-2'>
              {JOB_DETAIL_ROWS.map(({ key, Icon }) => (
                <div
                  key={key}
                  className='flex items-center gap-1'
                >
                  <Icon className='text-career-dark size-4 shrink-0' />
                  <p className='text-career-dark text-sm leading-4.5'>
                    {job[key]}
                  </p>
                </div>
              ))}
            </div>
            {isExpanded && hasRequirements && (
              <ul className='text-career-dark list-none space-y-0 text-xs leading-4'>
                {job.requirements.map((item) => (
                  <li
                    key={item}
                    className='before:mr-1 before:content-["."]'
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className='flex w-full items-start justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className='border-career-stroke bg-career-tint text-career-dark inline-flex items-center justify-center rounded-[36px] border px-2.5 py-1 text-xs leading-4 font-semibold'
                >
                  {tag}
                </span>
              ))}
            </div>

            {onApply ? (
              <button
                type='button'
                onClick={() => onApply(job)}
                className='text-primary inline-flex shrink-0 cursor-pointer items-center gap-1 rounded text-sm leading-4.5 font-semibold'
              >
                Apply
                <GoArrowRight
                  className='size-4'
                  aria-hidden
                />
              </button>
            ) : (
              <Link
                href={job.applyHref}
                className='text-primary inline-flex shrink-0 items-center gap-1 rounded text-sm leading-4.5 font-semibold'
              >
                Apply
                <GoArrowRight
                  className='size-4'
                  aria-hidden
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
