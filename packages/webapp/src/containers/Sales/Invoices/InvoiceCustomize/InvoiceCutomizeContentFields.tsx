// @ts-nocheck
import intl from 'react-intl-universal';
import { Classes } from '@blueprintjs/core';
import { fieldsGroups } from './constants';
import { Stack } from '@/components';
import {
  ElementCustomizeFieldsGroup,
  ElementCustomizeContentItemFieldGroup,
} from '@/containers/ElementCustomize/ElementCustomizeFieldsGroup';

export function InvoiceCustomizeContentFields() {
  return (
    <Stack
      spacing={10}
      style={{ padding: 20, paddingBottom: 40, flex: '1 1 auto' }}
    >
      <Stack spacing={10}>
        <h3 style={{ fontWeight: 600 }}>{intl.get('invoice_content')}</h3>
        <p className={Classes.TEXT_MUTED}>
          {intl.get(
            'customize_your_invoice_by_editing_the_items_label_or_hiding_',
          )}
        </p>
      </Stack>

      <Stack>
        {fieldsGroups.map((group) => (
          <ElementCustomizeFieldsGroup label={group.label}>
            {group.fields.map((item, index) => (
              <ElementCustomizeContentItemFieldGroup
                key={index}
                inputGroupProps={{
                  name: item.enableKey,
                  label: item.label,
                }}
                switchProps={{
                  name: item.labelKey,
                }}
              />
            ))}
          </ElementCustomizeFieldsGroup>
        ))}
      </Stack>
    </Stack>
  );
}
