import { FaRegUser } from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import { MdOutlineEmail } from 'react-icons/md';

import { CONTACT_GRIEVANCE } from '../../constants/contact';

import ContactCardShell from './ContactCardShell';
import ContactIconBadge from './ContactIconBadge';

function GrievanceDetailRow({
  icon,
  children,
  withBorder = true,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  withBorder?: boolean;
}) {
  return (
    <div
      className={`flex min-h-7 items-start gap-2 ${
        withBorder ? 'border-career-stroke/50 mb-2.5 border-b' : ''
      }`}
    >
      <span className='text-primary mt-0.5 shrink-0'>{icon}</span>
      <span className='text-career-dark text-xs leading-4 font-semibold'>
        {children}
      </span>
    </div>
  );
}

export default function ContactGrievanceSection() {
  const { officer, sla } = CONTACT_GRIEVANCE;

  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div className='flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-4'>
        <div className='flex min-w-0 flex-1 flex-col gap-4 lg:justify-between lg:self-stretch'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3 lg:gap-4'>
              <ContactIconBadge
                size='sm'
                className='lg:hidden'
              >
                <FaRegUser className='size-3.5' />
              </ContactIconBadge>
              <ContactIconBadge className='hidden lg:flex'>
                <FaRegUser className='size-4.5' />
              </ContactIconBadge>
              <h2 className='text-career-dark text-base leading-5 font-bold lg:text-xl lg:leading-6'>
                {CONTACT_GRIEVANCE.title}
              </h2>
            </div>
            <p className='text-career-dark text-sm leading-4.5 lg:text-base lg:leading-5'>
              {CONTACT_GRIEVANCE.description}
            </p>
          </div>
          <p className='text-career-dark text-sm leading-4.5 lg:text-base lg:leading-5'>
            {CONTACT_GRIEVANCE.complaintNote}
          </p>
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-4'>
          <div className='border-career-stroke bg-career-tint rounded-md border p-3 lg:rounded-md lg:p-4'>
            <GrievanceDetailRow
              icon={<FaRegUser className='text-career-dark size-4' />}
            >
              {officer.name}
            </GrievanceDetailRow>
            <GrievanceDetailRow
              icon={<LuBriefcaseBusiness className='text-career-dark size-4' />}
            >
              {officer.role}
            </GrievanceDetailRow>
            <GrievanceDetailRow
              icon={<MdOutlineEmail className='text-career-dark size-4' />}
            >
              <a
                href={`mailto:${officer.email}`}
                className='hover:text-primary'
              >
                {officer.email}
              </a>
            </GrievanceDetailRow>
            <GrievanceDetailRow
              icon={
                <HiOutlineLocationMarker className='text-career-dark size-4' />
              }
              withBorder={false}
            >
              {officer.address.split(/(<sup>.*?<\/sup>)/g).map((part, i) => {
                const match = part.match(/^<sup>(.*?)<\/sup>$/);
                if (match) {
                  return <sup key={part}>{match[1]}</sup>;
                }
                return part;
              })}
            </GrievanceDetailRow>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            {sla.map((item) => (
              <div
                key={item.label}
                className='border-career-stroke rounded-md border px-4 py-2 lg:rounded-md'
              >
                <p className='text-career-dark text-xs leading-4 font-semibold lg:text-sm lg:leading-4.5'>
                  {item.label}
                </p>
                <p className='text-primary text-xl leading-6 font-bold lg:text-2xl lg:leading-7'>
                  {item.value}
                </p>
                <p className='text-career-dark text-xs leading-4 lg:text-sm lg:leading-4.5'>
                  {item.suffix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContactCardShell>
  );
}
