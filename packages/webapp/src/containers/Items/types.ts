/**
 * Shared form values shape for the Item form.
 * Field names mirror the SDK `CreateItemBody` / `EditItemBody` (camelCase).
 */
export interface ItemFormValues {
  active: boolean;
  name: string;
  type: ItemFormType;
  code: string;
  costPrice: string | number;
  sellPrice: string | number;
  costAccountId: number | string;
  sellAccountId: number | string;
  sellTaxRateId: number | string;
  inventoryAccountId: number | string;
  categoryId: number | string;
  /** The unit every quantity of this item is counted in. */
  unitId: number | string | null;
  /** A second unit the same quantity may be read in, and the factor between. */
  secondaryUnitId: number | string | null;
  secondaryUnitFactor: number | string | null;
  sellable: boolean;
  purchasable: boolean;
  sellDescription: string;
  purchaseDescription: string;
  purchaseTaxRateId: number | string;
}

export type ItemFormType = 'service' | 'non-inventory' | 'inventory';

export type ItemFormSubmitPayload = {
  redirect?: boolean;
};
