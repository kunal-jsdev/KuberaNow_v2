import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Image from 'next/image';
import Link from 'next/link';

import { FOOTER_LINKS } from '../constants/navigation';

import SocialLinks from './common/SocialLinks';

dayjs.extend(utc);
dayjs.extend(timezone);
type NavLink = { label: string; href: string };

function NavColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div className='flex w-45 flex-col gap-4 font-sans even:w-35.5 xl:min-w-45.75'>
      <h3 className='text-sm leading-4.5 font-normal tracking-wider text-[#00FFEE] uppercase'>
        {title}
      </h3>

      {links.map((link) => (
        <div
          className='leading-4.5 hover:scale-y-105'
          key={link.label}
        >
          <Link
            href={link.href}
            className='text-sm transition-colors hover:text-white'
          >
            {link.label}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className='bg-dark-navy1 border-primary-navy w-full border-t-2 px-4 py-6 pt-6 pb-6 font-sans text-gray-300 xl:pt-10 xl:pb-4'>
      <div className='mx-auto w-full md:max-w-7xl'>
        <div className='flex w-full flex-col justify-between gap-6 md:flex-row'>
          <div className='flex w-fit max-w-85.75 flex-col gap-4'>
            <Link href='/'>
              <Image
                src='/logo-white.svg'
                alt='KuberaNow'
                width={140}
                height={40}
                className='object-contain'
              />
            </Link>
            <p className='mx-w-80 text-sm leading-relaxed xl:max-w-70'>
              Independent business and financial journalism trusted by
              India&apos;s investors, executives and policymakers. Real-time
              market data, expert analysis and breaking news.
            </p>
            <SocialLinks
              className='mt-0 flex-wrap xl:mt-2'
              iconSize={26}
            />
          </div>
          <div className='flex w-full flex-wrap justify-between gap-y-6 xl:w-max xl:gap-0'>
            {FOOTER_LINKS.map((column) => (
              <NavColumn
                key={column.title}
                title={column.title}
                links={column.links}
              />
            ))}
          </div>
        </div>
        <div className='mt-6 flex flex-col items-center justify-between gap-2 border-t border-[#ffffff0b] pt-5 md:flex-row'>
          <p className='text-center text-[10px] md:text-left xl:text-xs'>
            © {dayjs().tz('Asia/Kolkata').format('YYYY')} K Globes Digital Media
            Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
