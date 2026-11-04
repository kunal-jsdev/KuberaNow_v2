'use client';

import {
  type ComponentType,
  type CSSProperties,
  useCallback,
  useMemo,
} from 'react';

import {
  RelationshipInput,
  useConfig,
  useField,
  useTranslation,
  withCondition,
} from '@payloadcms/ui';
import type { RelationshipFieldClientProps } from 'payload';

type Option = { label: string; options?: Option[] };
type OptionGroup = { label: string; options: Option[] };
type PolymorphicValue = { relationTo: string; value: number | string };
type Labels = Record<string, string> | string | undefined;

// RelationshipInput's props are a union discriminated on `hasMany`; this
// wrapper passes both variants through one element.
const Input = RelationshipInput as unknown as ComponentType<
  Record<string, unknown>
>;

const translate = (labels: Labels, language: string) => {
  if (!labels || typeof labels === 'string') return labels ?? '';
  return labels[language] ?? Object.values(labels)[0] ?? '';
};

/**
 * Polymorphic relationship field for the Navigation Page / Pages fields.
 *
 * Payload's default field lists option groups in the order they were loaded,
 * so when a custom nav link is already selected its group ends up on top.
 * This wrapper renders Payload's own `RelationshipInput` but always orders the
 * groups by `relationTo` — News Categories first, Custom Nav Links last (they
 * load as the editor scrolls to the bottom).
 */
const NavPageRelationshipFieldComponent = (
  props: RelationshipFieldClientProps
) => {
  const {
    field,
    field: {
      admin: {
        allowCreate = true,
        allowEdit = true,
        appearance = 'select',
        className,
        description,
        isSortable = true,
        placeholder,
        sortOptions,
      } = {},
      hasMany,
      label,
      localized,
      relationTo: relationToProp,
      required,
    },
    path: pathFromProps,
    readOnly,
    validate,
  } = props;

  const { getEntityConfig } = useConfig();
  const { i18n } = useTranslation();

  const relationTo = useMemo(
    () => (Array.isArray(relationToProp) ? relationToProp : [relationToProp]),
    [relationToProp]
  );

  const memoizedValidate = useCallback(
    (value: unknown, validationOptions: Record<string, unknown>) => {
      if (typeof validate === 'function') {
        return validate(
          value as never,
          {
            ...validationOptions,
            required,
          } as never
        );
      }
      return true;
    },
    [validate, required]
  );

  const {
    customComponents: {
      AfterInput,
      BeforeInput,
      Description,
      Error,
      Label,
    } = {},
    disabled,
    filterOptions,
    initialValue,
    path,
    setValue,
    showError,
    value,
  } = useField<PolymorphicValue | PolymorphicValue[] | null>({
    potentiallyStalePath: pathFromProps,
    validate: memoizedValidate as never,
  });

  const groupOrder = useMemo(
    () =>
      relationTo.map((collectionSlug) =>
        translate(
          getEntityConfig({ collectionSlug })?.labels?.plural as Labels,
          i18n.language
        )
      ),
    [relationTo, getEntityConfig, i18n.language]
  );

  const formatDisplayedOptions = useCallback(
    (groups: OptionGroup[]) =>
      [...groups].sort(
        (a, b) => groupOrder.indexOf(a.label) - groupOrder.indexOf(b.label)
      ),
    [groupOrder]
  );

  const sameValue = (
    a?: PolymorphicValue | null,
    b?: PolymorphicValue | null
  ) => a?.value === b?.value && a?.relationTo === b?.relationTo;

  const handleChangeHasMany = useCallback(
    (newValue: PolymorphicValue[] | null) => {
      if (!newValue) {
        setValue(null, newValue === value);
        return;
      }
      const unchanged =
        Array.isArray(value) &&
        value.length === newValue.length &&
        value.every((val, i) => sameValue(val, newValue[i]));
      setValue(newValue, unchanged);
    },
    [setValue, value]
  );

  const handleChangeSingle = useCallback(
    (newValue: PolymorphicValue | null) => {
      if (!newValue) {
        setValue(null, newValue === value);
        return;
      }
      setValue(newValue, !Array.isArray(value) && sameValue(value, newValue));
    },
    [setValue, value]
  );

  // Same as Payload's internal mergeFieldStyles (not exported).
  const style: CSSProperties = {
    ...(field.admin?.style || {}),
    ...(field.admin?.width
      ? ({ '--field-width': field.admin.width } as CSSProperties)
      : { flex: '1 1 auto' }),
    ...(field.admin?.style?.flex ? { flex: field.admin.style.flex } : {}),
  };

  return (
    <Input
      AfterInput={AfterInput}
      allowCreate={allowCreate}
      allowEdit={allowEdit}
      appearance={appearance}
      BeforeInput={BeforeInput}
      className={className}
      Description={Description}
      description={description}
      Error={Error}
      filterOptions={filterOptions}
      formatDisplayedOptions={formatDisplayedOptions}
      hasMany={Boolean(hasMany)}
      initialValue={initialValue}
      isSortable={isSortable}
      Label={Label}
      label={label}
      localized={localized}
      maxResultsPerRequest={10}
      maxRows={'maxRows' in field ? field.maxRows : undefined}
      minRows={'minRows' in field ? field.minRows : undefined}
      onChange={hasMany ? handleChangeHasMany : handleChangeSingle}
      path={path}
      placeholder={placeholder}
      readOnly={readOnly || disabled}
      relationTo={relationTo}
      required={required}
      showError={showError}
      sortOptions={sortOptions}
      style={style}
      value={value}
    />
  );
};

export const NavPageRelationshipField = withCondition(
  NavPageRelationshipFieldComponent
);

export default NavPageRelationshipField;
