import { contactAddressTextFormat } from '@/utils/address-text-format';
import { EstimatePdfBrandingAttributes } from './constants';

export const transformEstimateToPdfTemplate = (
  estimate,
  /**
   * The already-translated discount label from the branding attributes; the
   * percentage is appended to it when the discount is a percentage.
   */
  discountLabel = 'Discount',
): Partial<EstimatePdfBrandingAttributes> => {
  return {
    expirationDate: estimate.formattedExpirationDate,
    estimateNumebr: estimate.estimateNumber,
    estimateDate: estimate.formattedEstimateDate,
    lines: estimate.entries.map((entry) => ({
      item: entry.item.name,
      description: entry.description,
      rate: entry.rateFormatted,
      quantity: entry.quantityFormatted,
      total: entry.totalFormatted,
    })),
    // `total` was reading the subtotal, so a discounted estimate printed its
    // pre-discount figure as the total.
    total: estimate.totalFormatted,
    subtotal: estimate.formattedSubtotal,

    discount: estimate.discountAmountFormatted,
    discountLabel: estimate.discountPercentageFormatted
      ? `${discountLabel} [${estimate.discountPercentageFormatted}]`
      : discountLabel,
    adjustment: estimate.adjustmentFormatted,
    customerNote: estimate.note,
    termsConditions: estimate.termsConditions,
    customerAddress: contactAddressTextFormat(estimate.customer),
  };
};

export const transformEstimateToMailDataArgs = (estimate: any) => {
  return {
    'Customer Name': estimate.customer.displayName,
    'Estimate Number': estimate.estimateNumber,
    'Estimate Date': estimate.formattedEstimateDate,
    'Estimate Amount': estimate.formattedAmount,
    'Estimate Expiration Date': estimate.formattedExpirationDate,
  };
};
