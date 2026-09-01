import { defaultTo } from 'lodash';
import intl from 'react-intl-universal';
import * as Yup from 'yup';
import type { ItemFormValues } from './types';
import type { Item } from '@bigcapital/sdk-ts';
import { DATATYPES_LENGTH } from '@/constants/dataTypes';

const Schema = Yup.object().shape({
  active: Yup.boolean(),
  name: Yup.string()
    .required()
    .min(0)
    .max(DATATYPES_LENGTH.STRING)
    .label(intl.get('item_name_')),
  type: Yup.string()
    .trim()
    .required()
    .min(0)
    .max(DATATYPES_LENGTH.STRING)
    .label(intl.get('item_type_')),
  code: Yup.string().trim().min(0).max(DATATYPES_LENGTH.STRING),
  costPrice: Yup.number()
    .min(0)
    .max(DATATYPES_LENGTH.DECIMAL_13_3)
    .when(['purchasable'], {
      is: true,
      then: Yup.number().required().label(intl.get('cost_price_')),
      otherwise: Yup.number().nullable(true),
    }),
  sellPrice: Yup.number()
    .min(0)
    .max(DATATYPES_LENGTH.DECIMAL_13_3)
    .when(['sellable'], {
      is: true,
      then: Yup.number().required().label(intl.get('sell_price_')),
      otherwise: Yup.number().nullable(true),
    }),
  costAccountId: Yup.number()
    .when(['purchasable'], {
      is: true,
      then: Yup.number().required(),
      otherwise: Yup.number().nullable(true),
    })
    .label(intl.get('cost_account_id')),
  sellAccountId: Yup.number()
    .when(['sellable'], {
      is: true,
      then: Yup.number().required(),
      otherwise: Yup.number().nullable(),
    })
    .label(intl.get('sell_account_id')),
  inventoryAccountId: Yup.number()
    .when(['type'], {
      is: (value: unknown) => value === 'inventory',
      then: Yup.number().required(),
      otherwise: Yup.number().nullable(),
    })
    .label(intl.get('inventory_account')),
  categoryId: Yup.number().positive().nullable(),

  unitId: Yup.number().positive().nullable(),
  secondaryUnitId: Yup.number().positive().nullable(),

  // A second unit without a factor says nothing — the quantity cannot be read
  // in it — and the form used to accept exactly that, leaving items whose
  // second unit never appeared anywhere and no explanation why. Asked for
  // together or not at all.
  secondaryUnitFactor: Yup.number()
    .transform((value, original) =>
      original === '' || original === null ? undefined : value,
    )
    .positive()
    .nullable()
    .when('secondaryUnitId', {
      is: (secondaryUnitId: number | null) => Boolean(secondaryUnitId),
      then: Yup.number().positive().required(),
      otherwise: Yup.number().nullable(),
    })
    .label(intl.get('item.field.secondary_unit_factor')),
  stock: Yup.string() || Yup.boolean(),
  sellable: Yup.boolean().required(),
  purchasable: Yup.boolean().required(),
});

export const transformItemFormData = (
  item: Partial<Item> | undefined,
  defaultValue: ItemFormValues,
): ItemFormValues => {
  return {
    ...defaultValue,
    ...item,
    sellable: !!defaultTo(item?.sellable, defaultValue.sellable),
    purchasable: !!defaultTo(item?.purchasable, defaultValue.purchasable),
    active: !!defaultTo(item?.active, defaultValue.active),
  };
};

export const CreateItemFormSchema = Schema;
export const EditItemFormSchema = Schema;
