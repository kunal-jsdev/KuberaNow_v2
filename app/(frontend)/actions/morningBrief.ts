'use server';

import { MORNING_BRIEF_FORM_TITLE } from '@/constants/forms';
import { getForm, submitForm } from '@/Payload/lib/utilities/formSubmitHelper';

const WHATSAPP_NUMBER_PATTERN = /^[+0-9\s-]{8,15}$/;

export type MorningBriefFormState = {
  message?: string;
  status: 'error' | 'idle' | 'success';
};

export type MorningBriefAction = (
  state: MorningBriefFormState,
  formData: FormData
) => Promise<MorningBriefFormState>;

export const submitMorningBrief: MorningBriefAction = async (
  _state,
  formData
) => {
  try {
    const whatsappNumber = String(formData.get('whatsappNumber') ?? '').trim();

    if (!WHATSAPP_NUMBER_PATTERN.test(whatsappNumber)) {
      return {
        status: 'error',
        message: 'Enter a valid WhatsApp number.',
      };
    }

    const form = await getForm(MORNING_BRIEF_FORM_TITLE);

    if (!form) {
      return {
        status: 'error',
        message:
          'Subscriptions are temporarily unavailable. Please try again later.',
      };
    }

    const result = await submitForm(form.id, { whatsappNumber });

    if (!result.success) {
      return {
        status: 'error',
        message: result.error,
      };
    }

    return {
      status: 'success',
      message: 'You are subscribed to the Morning Brief.',
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong while processing your subscription. Please try again later.';

    return {
      status: 'error',
      message:
        message ||
        'Something went wrong while processing your subscription. Please try again later.',
    };
  }
};
