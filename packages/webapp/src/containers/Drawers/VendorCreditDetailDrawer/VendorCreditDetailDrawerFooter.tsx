import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useVendorCreditDetailDrawerContext } from './VendorCreditDetailDrawerProvider';
import {
  T,
  TotalLines,
  TotalLine,
  TotalLineBorderStyle,
  TotalLineTextStyle,
} from '@/components';

/**
 * Vendor Credit detail panel footer.
 */
export function VendorCreditDetailDrawerFooter() {
  const { vendorCredit } = useVendorCreditDetailDrawerContext();

  if (!vendorCredit) {
    return null;
  }
  return (
    <VendorCreditFooterRoot>
      <VendorCreditTotalLines labelColWidth={'180px'} amountColWidth={'180px'}>
        <TotalLine
          title={<T id={'vendor_credit.drawer.label_subtotal'} />}
          value={vendorCredit.formattedSubtotal}
          borderStyle={TotalLineBorderStyle.SingleDark}
        />
        {vendorCredit?.discountAmountFormatted && (
          <TotalLine
            title={
              vendorCredit.discountPercentageFormatted
                ? `Discount [${vendorCredit.discountPercentageFormatted}]`
                : intl.get('discount_2')
            }
            value={vendorCredit.discountAmountFormatted}
            textStyle={TotalLineTextStyle.Regular}
          />
        )}
        {vendorCredit?.adjustmentFormatted && (
          <TotalLine
            title={intl.get('adjustment')}
            value={vendorCredit.adjustmentFormatted}
            textStyle={TotalLineTextStyle.Regular}
          />
        )}
        <TotalLine
          title={<T id={'vendor_credit.drawer.label_total'} />}
          value={vendorCredit.totalFormatted}
          borderStyle={TotalLineBorderStyle.DoubleDark}
          textStyle={TotalLineTextStyle.Bold}
        />
      </VendorCreditTotalLines>
    </VendorCreditFooterRoot>
  );
}

export const VendorCreditFooterRoot = styled.div``;

export const VendorCreditTotalLines = styled(TotalLines)`
  margin-left: auto;
`;
