import intl from 'react-intl-universal';
import {
  Classes,
  Intent,
  Menu,
  MenuItem,
  ProgressBar,
  Text,
} from '@blueprintjs/core';
import classNames from 'classnames';
import { FinancialLoadingBar } from '../FinancialLoadingBar';
import { useSalesTaxLiabilitySummaryContext } from './SalesTaxLiabilitySummaryBoot';
import type {
  SalesTaxLiabilityXlsxQuery,
  SalesTaxLiabilityCsvQuery,
} from '@bigcapital/sdk-ts';
import { AppToaster, Stack } from '@/components';
import {
  useSalesTaxLiabilitySummaryCsvExport,
  useSalesTaxLiabilitySummaryXlsxExport,
} from '@/hooks/query';

/**
 * Sales tax liability summary loading bar.
 */
export function SalesTaxLiabilitySummaryLoadingBar() {
  const { isFetching } = useSalesTaxLiabilitySummaryContext();

  if (!isFetching) {
    return null;
  }
  return <FinancialLoadingBar />;
}

/**
 * Sales tax liability export menu.
 */
export function SalesTaxLiabilityExportMenu() {
  const commonToastConfig = {
    isCloseButtonShown: true,
    timeout: 2000,
  };
  const { query } = useSalesTaxLiabilitySummaryContext();

  const renderToast = (done: boolean) => {
    return (
      <Stack spacing={8}>
        <Text>
          {done
            ? intl.get('the_report_has_been_exported_successfully')
            : intl.get('exporting_the_report')}
        </Text>
        <ProgressBar
          className={classNames('toast-progress', {
            [Classes.PROGRESS_NO_STRIPES]: done,
          })}
          intent={done ? Intent.SUCCESS : Intent.PRIMARY}
          value={done ? 1 : undefined}
        />
      </Stack>
    );
  };

  const { mutateAsync: xlsxExport } = useSalesTaxLiabilitySummaryXlsxExport(
    query as SalesTaxLiabilityXlsxQuery,
  );
  const { mutateAsync: csvExport } = useSalesTaxLiabilitySummaryCsvExport(
    query as SalesTaxLiabilityCsvQuery,
  );

  const runExport = async (mutate: () => Promise<unknown>) => {
    const key = AppToaster.show({
      message: renderToast(false),
      ...commonToastConfig,
      timeout: 0,
    });
    try {
      await mutate();
      AppToaster.show(
        { message: renderToast(true), ...commonToastConfig },
        key,
      );
    } catch {
      AppToaster.dismiss(key);
    }
  };

  const handleCsvExportBtnClick = () => runExport(csvExport);
  const handleXlsxExportBtnClick = () => runExport(xlsxExport);

  return (
    <Menu>
      <MenuItem
        text={intl.get('xlsx_microsoft_excel')}
        onClick={handleXlsxExportBtnClick}
      />
      <MenuItem text={'CSV'} onClick={handleCsvExportBtnClick} />
    </Menu>
  );
}
