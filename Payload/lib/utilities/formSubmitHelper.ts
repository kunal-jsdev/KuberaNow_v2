import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { Form } from '@/payload-types';

export async function getForm(title: string): Promise<Form | null> {
  if (!title) {
    return null;
  }

  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: false,
    });

    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}

export type SubmitFormResult =
  { success: true } | { success: false; error: string };

export async function submitForm(
  formId: string,
  data: Record<string, string>
): Promise<SubmitFormResult> {
  if (!formId) {
    return { success: false, error: 'Missing form id.' };
  }

  try {
    const payload = await getPayload({ config: configPromise });

    await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId,
        submissionData: Object.entries(data).map(([field, value]) => ({
          field,
          value: String(value ?? ''),
        })),
      },
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not send your message. Please try again.';

    return {
      success: false,
      error: message || 'Could not send your message. Please try again.',
    };
  }
}
