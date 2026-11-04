import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';

import clsx from 'clsx';
import { useFormik } from 'formik';

import { JOB_LISTINGS, JobListing } from '../../constants/careers';
import { GUJARAT_CITIES } from '../../constants/cities';
import { applyJobValidationSchema } from '../../validations/applyJobValidation';
import Modal from '../common/Modal';
import StatusPopup from '../common/StatusPopup';
import { FormField, Input, InputSelect, Textarea } from '../ui';

const POST_OPTIONS = JOB_LISTINGS.map((j) => ({
  value: j.id,
  label: j.title,
}));

type ApplyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing | null;
};

export default function ApplyModal({ isOpen, onClose, job }: ApplyModalProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    formik.resetForm();
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  const formik = useFormik({
    initialValues: {
      postTitle:
        POST_OPTIONS.find((post) => post?.label === job?.title)?.value || '',
      name: '',
      email: '',
      phone: '',
      city: '',
      experience: '',
      linkedin: '',
      portfolio: '',
      note: '',
      resume: null as File | null,
    },
    enableReinitialize: true,
    validationSchema: applyJobValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setStatus('idle');
      setErrorMessage('');

      setSubmitLoading(true);

      const resumeFile = values.resume;
      if (!resumeFile) {
        setSubmitLoading(false);
        formik.setFieldError('resume', 'Resume is required');
        return;
      }

      try {
        const formData = new FormData();
        const positionLabel =
          POST_OPTIONS.find((opt) => opt.value === values.postTitle)?.label ||
          values.postTitle;
        formData.append('position', positionLabel);
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('phone', values.phone);
        if (values.city) formData.append('currentCity', values.city);
        if (values.experience)
          formData.append('totalExperience', values.experience);
        if (values.linkedin) formData.append('linkedinUrl', values.linkedin);
        if (values.portfolio) formData.append('portfolioUrl', values.portfolio);
        if (values.note) formData.append('notes', values.note);
        formData.append('resume', resumeFile);
        formData.append('website', '');
        const res = await fetch('/api/job-application', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || 'Failed to submit application');
        }

        resetForm();
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setSubmitLoading(false);
      }
    },
  });

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    formik.setFieldValue('resume', file);
    formik.setFieldTouched('resume', true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  if (status === 'success') {
    return (
      <StatusPopup
        isOpen={isOpen}
        onClose={handleClose}
        variant='success'
        title='Submit Successfully'
        message="Thanks for applying. We'll review your application and get in touch with you soon."
      />
    );
  }

  if (status === 'error') {
    return (
      <StatusPopup
        isOpen={isOpen}
        onClose={handleClose}
        variant='error'
        title='Submission Failed!'
        message={
          errorMessage ||
          "We couldn't submit your request at the moment. Please try again in a few minutes."
        }
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Application'
    >
      <form
        onSubmit={formik.handleSubmit}
        className='flex flex-col gap-6'
      >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Post Applied For */}
          <FormField
            label='Post Applied For'
            required
          >
            <InputSelect
              options={POST_OPTIONS}
              value={formik.values.postTitle}
              onValueChange={(value) =>
                formik.setFieldValue('postTitle', value)
              }
              placeholder='Select a position'
              error={
                formik.touched.postTitle && formik.errors.postTitle
                  ? (formik.errors.postTitle as string)
                  : undefined
              }
            />
          </FormField>

          {/* Name */}
          <FormField
            label='Name'
            required
          >
            <Input
              type='text'
              name='name'
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Your full name'
              error={
                formik.touched.name && formik.errors.name
                  ? (formik.errors.name as string)
                  : undefined
              }
            />
          </FormField>

          {/* Email Address */}
          <FormField
            label='Email Address'
            required
          >
            <Input
              type='email'
              name='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='you@example.com'
              error={
                formik.touched.email && formik.errors.email
                  ? (formik.errors.email as string)
                  : undefined
              }
            />
          </FormField>

          {/* Phone Number */}
          <FormField
            label='Phone Number'
            required
          >
            <Input
              type='tel'
              name='phone'
              value={formik.values.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+ ]/g, '');
                formik.setFieldValue('phone', val);
              }}
              onBlur={formik.handleBlur}
              placeholder='+91 98765 43210'
              maxLength={15}
              error={
                formik.touched.phone && formik.errors.phone
                  ? (formik.errors.phone as string)
                  : undefined
              }
            />
          </FormField>

          {/* Current City */}
          <FormField label='Current City'>
            <InputSelect
              options={GUJARAT_CITIES}
              value={formik.values.city}
              onValueChange={(value) => formik.setFieldValue('city', value)}
              placeholder='Enter city name'
              searchable
              error={
                formik.touched.city && formik.errors.city
                  ? (formik.errors.city as string)
                  : undefined
              }
            />
          </FormField>

          {/* Total Experience */}
          <FormField label='Total Experience'>
            <Input
              type='text'
              name='experience'
              value={formik.values.experience}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='e.g. 2 years'
              error={
                formik.touched.experience && formik.errors.experience
                  ? (formik.errors.experience as string)
                  : undefined
              }
            />
          </FormField>

          {/* LinkedIn Profile URL */}
          <FormField label='LinkedIn Profile URL'>
            <Input
              type='url'
              name='linkedin'
              value={formik.values.linkedin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='linkedin.com/in/yourprofile'
              error={
                formik.touched.linkedin && formik.errors.linkedin
                  ? (formik.errors.linkedin as string)
                  : undefined
              }
            />
          </FormField>

          {/* Portfolio Link */}
          <FormField label='Portfolio Link'>
            <Input
              type='url'
              name='portfolio'
              value={formik.values.portfolio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='yourportfolio.com'
              error={
                formik.touched.portfolio && formik.errors.portfolio
                  ? (formik.errors.portfolio as string)
                  : undefined
              }
            />
          </FormField>
        </div>

        {/* Note */}
        <FormField label='Note'>
          <Textarea
            name='note'
            rows={2}
            value={formik.values.note}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder='Anything you would like us to know…'
            className='resize-none'
            error={
              formik.touched.note && formik.errors.note
                ? (formik.errors.note as string)
                : undefined
            }
          />
        </FormField>

        {/* Upload Resume/CV */}
        <FormField
          label='Upload Resume/CV'
          required
        >
          {!formik.values.resume ? (
            <div
              className={clsx(
                'flex h-30 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors sm:max-w-75',
                {
                  'border-primary bg-career-tint': isDragging,
                  'border-red-500 bg-red-50':
                    !isDragging &&
                    formik.touched.resume &&
                    formik.errors.resume,
                  'border-career-input-border bg-white':
                    !isDragging &&
                    !(formik.touched.resume && formik.errors.resume),
                }
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className='text-center'>
                <p className='text-career-dark text-sm'>
                  <span className='text-lg'>+</span>
                  <br />
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='text-primary font-medium hover:underline'
                  >
                    browse
                  </button>{' '}
                  or drop file
                </p>
                <p className='text-career-muted mt-1 text-[10px]'>
                  Pdf or Doc. (max 10mb)
                </p>
              </div>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
                accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                className='hidden'
              />
            </div>
          ) : (
            <div className='border-career-input-border bg-career-tint flex h-max w-full max-w-75 flex-col items-center justify-between rounded-lg border p-4'>
              <div className='flex w-full items-center gap-3'>
                <div
                  className={clsx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded text-xs font-bold',
                    (formik.values.resume as File).name
                      .toLowerCase()
                      .endsWith('.pdf')
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  )}
                >
                  {(formik.values.resume as File).name
                    .toLowerCase()
                    .endsWith('.pdf')
                    ? 'PDF'
                    : 'DOC'}
                </div>
                <div className='flex flex-col overflow-hidden'>
                  <span
                    title={(formik.values.resume as File).name}
                    className='text-career-dark truncate text-sm font-medium'
                  >
                    {(formik.values.resume as File).name}
                  </span>
                  <span className='text-career-muted text-xs'>
                    {(
                      (formik.values.resume as File).size /
                      1024 /
                      1024
                    ).toFixed(2)}{' '}
                    MB
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => formik.setFieldValue('resume', null)}
                  className='text-career-muted hover:text-career-dark ml-auto cursor-pointer rounded-full p-1 transition-colors hover:bg-white'
                >
                  <IoClose className='size-5' />
                </button>
              </div>
            </div>
          )}
        </FormField>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={submitLoading}
            className='focus:ring-primary inline-flex cursor-pointer items-center gap-2 rounded-md bg-[linear-gradient(to_right,#000764,#000EC0)] px-8 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            {submitLoading && (
              <AiOutlineLoading3Quarters
                className='size-4 animate-spin'
                aria-hidden
              />
            )}
            {submitLoading ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
