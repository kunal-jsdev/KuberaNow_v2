import { IoClose } from 'react-icons/io5';

import { useModalBehavior } from '../../hooks/useModalBehavior';
import AdvertiseStatusBadge from '../advertise/AdvertiseStatusBadge';

type StatusPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  variant: 'success' | 'error';
  title: string;
  message: string;
};

export default function StatusPopup({
  isOpen,
  onClose,
  variant,
  title,
  message,
}: StatusPopupProps) {
  useModalBehavior({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 sm:p-6'
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role='dialog'
      aria-modal='true'
    >
      <div className='bg-surface relative mt-25 max-w-[281px] rounded-lg border border-gray-200 bg-white p-6 shadow-xl md:max-w-[467px]'>
        <div className='flex w-full justify-end'>
          <button
            onClick={onClose}
            className='text-career-dark cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100'
            aria-label='Close modal'
          >
            <IoClose className='size-6' />
          </button>
        </div>
        <div className='flex flex-col items-center text-center'>
          <AdvertiseStatusBadge
            variant={variant}
            className='my-4 size-24 sm:my-8 sm:size-28'
          />
          <div className='mx-14 flex w-full flex-col gap-4'>
            <h2 className='text-career-heading text-center align-middle font-[Noto_Sans] text-2xl leading-7 font-bold tracking-normal sm:text-4xl sm:leading-[3.25rem]'>
              {title}
            </h2>
            <p className='text-career-dark max-w-md self-center text-center align-middle text-base leading-6 font-semibold sm:text-lg sm:leading-7'>
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
