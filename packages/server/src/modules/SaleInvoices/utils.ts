// @ts-nocheck
import { pickBy } from 'lodash';
import { InvoicePdfTemplateAttributes, ISaleInvoice } from '@/interfaces';
import { contactAddressTextFormat } from '@/utils/address-text-format';

export const mergePdfTemplateWithDefaultAttributes = (
  brandingTemplate?: Record<string, any>,
  defaultAttributes: Record<string, any> = {},
) => {
  const brandingAttributes = pickBy(
    brandingTemplate,
    (val, key) => val !== null && Object.keys(defaultAttributes).includes(key),
  );
  return {
    ...defaultAttributes,
    ...brandingAttributes,
  };
};

export const transformInvoiceToPdfTemplate = (
  invoice: ISaleInvoice,
  /**
   * The already-translated discount label from the branding attributes; the
   * percentage is appended to it when the discount is a percentage.
   */
  discountLabel = 'Discount',
): Partial<InvoicePdfTemplateAttributes> => {
  return {
    dueDate: invoice.dueDateFormatted,
    dateIssue: invoice.invoiceDateFormatted,
    invoiceNumber: invoice.invoiceNo,

    total: invoice.totalFormatted,
    subtotal: invoice.subtotalFormatted,
    paymentMade: invoice.paymentAmountFormatted,
    dueAmount: invoice.dueAmountFormatted,

    termsConditions: invoice.termsConditions,
    statement: invoice.invoiceMessage,

    lines: invoice.entries.map((entry) => ({
      item: entry.item.name,
      description: entry.description,
      rate: entry.rateFormatted,
      quantity: entry.quantityWithUnit || entry.quantityFormatted,
      secondaryQuantity: entry.secondaryQuantityWithUnit,
      total: entry.totalFormatted,
    })),
    taxes: invoice.taxes.map((tax) => ({
      label: tax.name,
      amount: tax.taxRateAmountFormatted,
    })),
    discount: invoice.discountAmountFormatted,
    discountLabel: invoice.discountPercentageFormatted
      ? `${discountLabel} [${invoice.discountPercentageFormatted}]`
      : discountLabel,
    customerAddress: contactAddressTextFormat(invoice.customer),
  };
};
