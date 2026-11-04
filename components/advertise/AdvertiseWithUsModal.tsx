import { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

import { useFormik } from 'formik';

import { ADVERTISE_FORM_ID } from '../../constants/advertise';
import {
  buildAdvertiseSubmissionData,
  fetchForm,
  PayloadFormField,
  submitFormSubmission,
} from '../../lib/forms/api';
import { advertiseValidationSchema } from '../../validations/advertiseValidation';
import Modal from '../common/Modal';
import StatusPopup from '../common/StatusPopup';
import { FormField, Input, Textarea } from '../ui';

type AdvertiseWithUsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type FormView = 'idle' | 'success' | 'error';

export default function AdvertiseWithUsModal({
  isOpen,
  onClose,
}: AdvertiseWithUsModalProps) {
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [view, setView] = useState<FormView>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formFields, setFormFields] = useState<PayloadFormField[]>();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    fetchForm(ADVERTISE_FORM_ID)
      .then((form) => {
        if (!isCancelled && form.fields) {
          setFormFields(form.fields);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setFormFields(undefined);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const handleClose = () => {
    formik.resetForm();
    setView('idle');
    setErrorMessage('');
    onClose();
  };

  const formik = useFormik({
    initialValues: {
      companyName: '',
      name: '',
      email: '',
      phone: '',
      website: '',
      note: '',
    },
    validationSchema: advertiseValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setErrorMessage('');
      setSubmitLoading(true);

      try {
        await submitFormSubmission({
          form: ADVERTISE_FORM_ID,
          submissionData: buildAdvertiseSubmissionData(values, formFields),
        });

        resetForm();
        setView('success');
      } catch (err) {
        setView('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setSubmitLoading(false);
      }
    },
  });

  if (view === 'success') {
    return (
      <StatusPopup
        isOpen={isOpen}
        onClose={handleClose}
        variant='success'
        title='Request Received'
        message="Thanks for your interest. We'll get in touch with you soon."
      />
    );
  }

  if (view === 'error') {
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
      title='Advertise With Us'
      className='rounded-lg border border-[#DADCFF]'
    >
      <form
        onSubmit={formik.handleSubmit}
        className='flex flex-col gap-6'
      >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            label='Company Name'
            required
          >
            <Input
              type='text'
              name='companyName'
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter'
              error={
                formik.touched.companyName && formik.errors.companyName
                  ? (formik.errors.companyName as string)
                  : undefined
              }
            />
          </FormField>

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
              placeholder='Enter'
              error={
                formik.touched.name && formik.errors.name
                  ? (formik.errors.name as string)
                  : undefined
              }
            />
          </FormField>

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

          <FormField
            label='Phone Number'
            required
          >
            <div className='flex'>
              <span className='border-career-input-border flex h-11 items-center rounded-l-md border border-r-0 bg-white px-3 text-sm text-gray-600'>
                +91
              </span>
              <Input
                type='tel'
                name='phone'
                value={formik.values.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9 ]/g, '');
                  formik.setFieldValue('phone', val);
                }}
                onBlur={formik.handleBlur}
                placeholder='00000 00000'
                maxLength={15}
                className='rounded-l-none'
                error={
                  formik.touched.phone && formik.errors.phone
                    ? (formik.errors.phone as string)
                    : undefined
                }
              />
            </div>
          </FormField>
        </div>

        <div className='grid grid-cols-1 gap-4'>
          <FormField label='Website Link'>
            <Input
              type='text'
              name='website'
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter'
              error={
                formik.touched.website && formik.errors.website
                  ? (formik.errors.website as string)
                  : undefined
              }
            />
          </FormField>

          <FormField label='Note'>
            <Textarea
              name='note'
              rows={2}
              value={formik.values.note}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Enter'
              className='resize-none'
              error={
                formik.touched.note && formik.errors.note
                  ? (formik.errors.note as string)
                  : undefined
              }
            />
          </FormField>
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={submitLoading}
            className='focus:ring-primary inline-flex cursor-pointer items-center gap-2 rounded-md bg-[linear-gradient(to_right,#000764,#000EC0)] px-8 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-60'
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
