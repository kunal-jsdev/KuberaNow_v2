import { IoLogoWhatsapp } from 'react-icons/io5';
import { MdOutlineEmail } from 'react-icons/md';

import { ContactInfoBoxProps, ContactItem } from '@/Payload/types';

function ContactInfoRow({
  contact,
  compact,
  withBorder,
}: {
  contact: ContactItem;
  compact?: boolean;
  withBorder?: boolean;
}) {
  const textClass = compact
    ? 'text-xs md:text-sm font-semibold leading-4 text-career-dark'
    : 'text-xs font-semibold leading-[18px] text-career-dark';

  const iconClass = compact ? 'size-4 md:size-4.5' : 'size-4';
  const gapClass = compact ? 'gap-3' : 'gap-4';

  return (
    <div
      className={`flex items-center ${gapClass} py-2 ${
        withBorder ? 'border-career-stroke border-b' : ''
      }`}
    >
      {contact.type === 'email' ? (
        <MdOutlineEmail
          className={`shrink-0 text-black ${iconClass}`}
          aria-hidden
        />
      ) : (
        <IoLogoWhatsapp
          className={`shrink-0 text-black ${iconClass}`}
          aria-hidden
        />
      )}
      <a
        target='_blank'
        className={`${textClass} hover:text-primary break-all`}
      >
        {contact.value}
      </a>
    </div>
  );
}

export default function ContactInfoBox({
  contacts,
  compact = false,
}: ContactInfoBoxProps) {
  return (
    <div
      className={`border-career-stroke bg-career-tint rounded-md border ${
        compact ? 'rounded px-4 py-2' : 'px-4 py-2'
      }`}
    >
      {contacts.map((contact, index) => (
        <ContactInfoRow
          key={`${contact.type}-${contact.value}`}
          contact={contact}
          compact={compact}
          withBorder={index < contacts.length - 1}
        />
      ))}
    </div>
  );
}
