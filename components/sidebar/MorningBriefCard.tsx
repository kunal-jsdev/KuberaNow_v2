'use client';

import { useActionState } from 'react';
import { MdOutlineMailOutline } from 'react-icons/md';

import type {
  MorningBriefAction,
  MorningBriefFormState,
} from '@/app/(frontend)/actions/morningBrief';

type MorningBriefCardProps = {
  action: MorningBriefAction;
  inputName?: string;
  className?: string;
  heading?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  readersNote?: string;
  scheduleNote?: string;
};

const initialState: MorningBriefFormState = { status: 'idle' };

export default function MorningBriefCard({
  action,
  inputName = 'whatsappNumber',
  className = '',
  heading = 'MORNING BRIEF',
  description = 'Get the top 5 business stories before markets open — delivered to your inbox at 7:30 AM IST.',
  placeholder = 'Enter Whatsapp Number',
  buttonLabel = 'Subscribe Free',
  readersNote = '24,000+ readers',
  scheduleNote = 'Daily 7:30 AM',
}: MorningBriefCardProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <section
      aria-label='Morning Brief Subscription'
      className={`w-87.75 max-w-full rounded-lg bg-[#010874] p-4 text-white shadow-[0_4px_10px_rgba(1,8,116,0.2)] md:w-76 ${className}`}
      aria-labelledby='morning-brief-title'
    >
      <div className='bg-light-navy4 mb-3 inline-flex items-center gap-2 rounded-full px-2 py-1'>
        <MdOutlineMailOutline className='text-career-dark size-3.25' />
        <h2
          id='morning-brief-title'
          className='text-content-small text-career-dark leading-4 font-semibold'
        >
          {heading}
        </h2>
      </div>

      <p className='text-content-small mb-2.5 leading-4 text-white'>
        {description}
      </p>

      <form
        action={formAction}
        className='flex flex-col gap-2.5'
      >
        <label
          htmlFor='morning-brief-whatsapp'
          className='sr-only'
        >
          WhatsApp number
        </label>
        <input
          id='morning-brief-whatsapp'
          name={inputName}
          type='tel'
          inputMode='tel'
          pattern='[+0-9\s-]{8,15}'
          autoComplete='tel'
          placeholder={placeholder}
          required
          className='focus:ring-cyan-blue h-10 w-full rounded-md border border-[#ffffff4b] bg-[#202a88] px-3.25 py-2.5 text-sm text-white placeholder:text-[#b2b4d5] focus:border-white focus:ring-2 focus:outline-none'
        />
        <button
          type='submit'
          disabled={isPending}
          className='text-dark-blue hover:bg-light-navy4 focus-visible:outline-cyan-blue h-9.5 w-full rounded-md bg-white text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
        >
          {isPending ? 'Subscribing...' : buttonLabel}
        </button>
      </form>

      {state.status !== 'idle' && state.message && (
        <p
          className={`mt-2 text-xs ${state.status === 'success' ? 'text-green-200' : 'text-red-200'}`}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {state.message}
        </p>
      )}

      <ul className='mt-3 flex list-disc items-center gap-6 pl-5 text-sm leading-5 text-[#b2b4d5]'>
        <li>{readersNote}</li>
        <li>{scheduleNote}</li>
      </ul>
    </section>
  );
}
