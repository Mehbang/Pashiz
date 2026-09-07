import { useFormikContext } from 'formik';
import React from 'react';
import intl from 'react-intl-universal';
import { ItemFormSectionTitle } from './ItemFormSectionTitle';
import { useItemFormContext } from './ItemFormProvider';
import type { ItemFormValues } from './types';
import { FFormGroup, FInputGroup } from '@/components';

interface CategoryField {
  id: number;
  name: string;
}

/**
 * The fields the chosen category asks this item to fill in.
 *
 * Nothing is shown until a category is picked, and nothing is shown for a
 * category that defines no fields — an empty heading over empty space would
 * only be noise on the majority of items.
 *
 * Values are held under `fieldValues` keyed by the field's id rather than its
 * name, so renaming a field on the category keeps whatever items had typed.
 */
export function ItemFormCategoryFieldsSection(): React.ReactElement | null {
  const { values } = useFormikContext<ItemFormValues>();
  const { itemsCategories } = useItemFormContext() as {
    itemsCategories?: Array<{ id: number; fields?: CategoryField[] }>;
  };

  const categoryId = Number(values.categoryId);

  const fields = React.useMemo<CategoryField[]>(() => {
    if (!categoryId) return [];

    const category = (itemsCategories ?? []).find(
      (candidate) => candidate.id === categoryId,
    );
    return category?.fields ?? [];
  }, [categoryId, itemsCategories]);

  if (fields.length === 0) return null;

  return (
    <div>
      <ItemFormSectionTitle>
        {intl.get('item.category_fields.label')}
      </ItemFormSectionTitle>

      {fields.map((field) => (
        <FFormGroup
          key={field.id}
          name={`fieldValues.${field.id}`}
          label={field.name}
        >
          <FInputGroup name={`fieldValues.${field.id}`} />
        </FFormGroup>
      ))}
    </div>
  );
}
