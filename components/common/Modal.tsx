import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

import clsx from 'clsx';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6'
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          if (document.querySelector('[data-custom-select-open="true"]')) {
            return;
          }
          onClose();
        }
      }}
    >
      <div
        className={clsx(
          'bg-surface relative flex max-h-[90vh] w-full max-w-285 flex-col rounded-lg shadow-xl',
          className
        )}
        role='dialog'
        aria-modal='true'
      >
        <div className='flex shrink-0 items-center justify-between px-3 pt-4 sm:px-6 sm:pt-6'>
          <div className='border-career-stroke flex w-full items-center justify-between border-b-2 pb-3'>
            {title && (
              <div className='flex items-center gap-3'>
                <span className='bg-primary h-6 w-1 rounded-sm shadow-[2px_0px_0px_0px_var(--color-career-accent)]' />
                <h2 className='text-career-heading text-2xl leading-7 font-bold'>
                  {title}
                </h2>
              </div>
            )}
            <button
              type='button'
              onClick={onClose}
              className='text-career-dark hover:bg-career-tint cursor-pointer rounded-full p-2 transition-colors'
              aria-label='Close modal'
            >
              <IoClose className='size-6' />
            </button>
          </div>
        </div>
        <div className='scrollbar-career overflow-y-auto px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6'>
          {children}
        </div>
      </div>
    </div>
  );
}
