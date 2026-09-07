import { Button, Classes, FormGroup, InputGroup } from '@blueprintjs/core';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import type { ItemCategoryFormValues } from './types';
import { Icon } from '@/components';

/**
 * The list of extra fields a category asks its items to fill in.
 *
 * Every field is free text, so a row is just a label — "نویسنده", "سایز". The
 * order of the rows is the order the inputs appear on the item form, which is
 * why removing one shifts the rest rather than leaving a gap.
 */
export function ItemCategoryFieldsEditor(): React.ReactElement {
  const { values } = useFormikContext<ItemCategoryFormValues>();
  const fields = values.fields ?? [];

  return (
    <FieldArray
      name={'fields'}
      render={(arrayHelpers) => (
        <FieldsRoot>
          <FieldsHeader>
            <FieldsTitle>{intl.get('item_category.fields.label')}</FieldsTitle>
            <FieldsHint className={Classes.TEXT_MUTED}>
              {intl.get('item_category.fields.hint')}
            </FieldsHint>
          </FieldsHeader>

          {fields.map((field, index) => (
            <FieldRow key={field.id ?? `new-${index}`}>
              <FormGroup style={{ flex: 1, margin: 0 }}>
                <InputGroup
                  value={field.name}
                  placeholder={intl.get('item_category.fields.placeholder')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    arrayHelpers.replace(index, {
                      ...field,
                      name: event.currentTarget.value,
                    })
                  }
                />
              </FormGroup>
              <Button
                minimal
                intent={'danger'}
                icon={<Icon icon={'trash-16'} iconSize={16} />}
                title={intl.get('item_category.fields.remove')}
                onClick={() => arrayHelpers.remove(index)}
              />
            </FieldRow>
          ))}

          <Button
            minimal
            small
            icon={'plus'}
            onClick={() => arrayHelpers.push({ name: '' })}
          >
            {intl.get('item_category.fields.add')}
          </Button>
        </FieldsRoot>
      )}
    />
  );
}

const FieldsRoot = styled.div`
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--color-dialog-divider, rgba(17, 20, 24, 0.12));
`;

const FieldsHeader = styled.div`
  margin-bottom: 12px;
`;

const FieldsTitle = styled.h4`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
`;

const FieldsHint = styled.p`
  margin: 0;
  font-size: 12px;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;
