export type FormSubmissionField = {
  field: string;
  value: string;
};

export type FormSubmissionPayload = {
  form: string;
  submissionData: FormSubmissionField[];
};

export type PayloadFormField = {
  blockType: string;
  name: string;
  label?: string;
  required?: boolean;
};

export type PayloadForm = {
  id: string;
  title?: string;
  fields?: PayloadFormField[];
  confirmationType?: string;
  confirmationMessage?: unknown;
};

export type AdvertiseFormValues = {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  note: string;
};

function formatFieldValue(
  fieldName: string,
  value: string,
  countryCode?: string
): string {
  if (fieldName === 'phone' && value) {
    return `${countryCode || '+91'} ${value}`.trim();
  }

  return value;
}

export function buildAdvertiseSubmissionData(
  values: AdvertiseFormValues,
  formFields?: PayloadFormField[],
  countryCode?: string
): FormSubmissionField[] {
  const fieldNames =
    formFields?.map((field) => field.name).filter(Boolean) ??
    Object.keys(values);

  return fieldNames.flatMap((fieldName) => {
    const value = values[fieldName as keyof AdvertiseFormValues];

    if (value === undefined || value === '') {
      return [];
    }

    return [
      {
        field: fieldName,
        value: formatFieldValue(fieldName, value, countryCode),
      },
    ];
  });
}

export async function fetchForm(formId: string): Promise<PayloadForm> {
  const response = await fetch(`/api/forms/${formId}`);

  if (!response.ok) {
    throw new Error('Failed to load form');
  }

  return response.json();
}

export async function submitFormSubmission(
  payload: FormSubmissionPayload
): Promise<unknown> {
  const response = await fetch('/api/form-submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      errors?: Array<{ message?: string }>;
      message?: string;
      error?: string;
    } | null;

    throw new Error(
      errorData?.errors?.[0]?.message ||
        errorData?.message ||
        errorData?.error ||
        "We couldn't submit your request at the moment. Please try again in a few minutes."
    );
  }

  return response.json();
}
