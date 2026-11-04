'use client';

import { ArrayField } from '@payloadcms/ui';

const AnyArrayField = ArrayField as any;

export const NavItemsField = () => {
  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          Add Categories and Add Groups
        </h3>
      </div>

      {/* Two Buttons on Same Line */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          type='button'
          className='btn btn--style-primary btn--icon-style-without-border btn--size-small'
          onClick={() => {
            // Trigger add with type: 'category'
            const addButton = document.querySelector(
              '[data-payload-array-add]'
            );
            if (addButton) {
              (addButton as HTMLButtonElement).click();
              setTimeout(() => {
                const typeRadio = document.querySelector(
                  'input[value="category"]'
                );
                if (typeRadio) {
                  (typeRadio as HTMLInputElement).click();
                }
              }, 100);
            }
          }}
        >
          + Add Category
        </button>
        <button
          type='button'
          className='btn btn--style-secondary btn--icon-style-without-border btn--size-small'
          onClick={() => {
            // Trigger add with type: 'group'
            const addButton = document.querySelector(
              '[data-payload-array-add]'
            );
            if (addButton) {
              (addButton as HTMLButtonElement).click();
              setTimeout(() => {
                const typeRadio = document.querySelector(
                  'input[value="group"]'
                );
                if (typeRadio) {
                  (typeRadio as HTMLInputElement).click();
                }
              }, 100);
            }
          }}
        >
          + Add Group
        </button>
      </div>

      {/* The actual array field - this renders the list */}
      <AnyArrayField
        name='navItems'
        label={false}
        labels={{
          singular: 'Item',
          plural: 'Items',
        }}
      />
    </div>
  );
};
