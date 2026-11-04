'use client';

import { useRef } from 'react';

import {
  FormSubmit,
  useConfig,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useHotkey,
  useOperation,
  useTranslation,
} from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { formatAdminURL } from 'payload/shared';

/**
 * Drop-in replacement for Payload's SaveButton (same label, Ctrl/Cmd+S and
 * disabled rules) that sends the editor back to the collection list after a
 * new document is created successfully. Updates stay on the edit page, and
 * documents created inside a drawer are left to Payload.
 */
export const SaveAndReturnButton = () => {
  const { t } = useTranslation();
  const { submit } = useForm();
  const modified = useFormModified();
  const editDepth = useEditDepth();
  const operation = useOperation();
  const { collectionSlug, uploadStatus } = useDocumentInfo();
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();
  const router = useRouter();
  const ref = useRef<HTMLButtonElement>(null);

  const disabled =
    (operation === 'update' && !modified) || uploadStatus === 'uploading';

  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (e) => {
    e.preventDefault();
    e.stopPropagation();
    ref.current?.click();
  });

  const handleSubmit = async () => {
    if (uploadStatus === 'uploading') return;

    const result = await submit();

    if (
      operation === 'create' &&
      editDepth === 1 &&
      collectionSlug &&
      result &&
      result.res?.ok
    ) {
      router.push(
        formatAdminURL({ adminRoute, path: `/collections/${collectionSlug}` })
      );
    }
  };

  return (
    <FormSubmit
      buttonId='action-save'
      disabled={disabled}
      onClick={() => void handleSubmit()}
      ref={ref}
      size='medium'
      type='button'
    >
      {t('general:save')}
    </FormSubmit>
  );
};

export default SaveAndReturnButton;
