// @ts-nocheck
import intl from 'react-intl-universal';
import { Classes } from '@blueprintjs/core';
import { fieldsGroups } from './constants';
import { FInputGroup, FSwitch, Group, Stack } from '@/components';
import { CLASSES } from '@/constants';

export function EstimateCustomizeContentFields() {
  return (
    <Stack
      spacing={10}
      style={{ padding: 20, paddingBottom: 40, flex: '1 1 auto' }}
    >
      <Stack spacing={10}>
        <h3 style={{ fontWeight: 600 }}>{intl.get('estimate_content')}</h3>
        <p className={Classes.TEXT_MUTED}>
          {intl.get(
            'customize_your_estimate_by_editing_the_items_label_or_hiding',
          )}
        </p>
      </Stack>

      <Stack>
        {fieldsGroups.map((group) => (
          <>
            <h4 className={CLASSES.TEXT_MUTED} style={{ fontWeight: 600 }}>
              {group.label}
            </h4>
            <Stack spacing={14}>
              {group.fields.map((item, index) => (
                <Group spacing={14} position={'apart'} key={index}>
                  <FSwitch name={item.enableKey} label={item.label} fastField />
                  {item.labelKey && (
                    <FInputGroup
                      name={item.labelKey}
                      style={{ maxWidth: 150 }}
                      fastField
                    />
                  )}
                </Group>
              ))}
            </Stack>
          </>
        ))}
      </Stack>
    </Stack>
  );
}
