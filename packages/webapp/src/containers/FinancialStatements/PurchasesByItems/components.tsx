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
import { usePurchaseByItemsContext } from './PurchasesByItemsProvider';
import type {
  PurchasesByItemsXlsxQuery,
  PurchasesByItemsCsvQuery,
} from '@bigcapital/sdk-ts';
import { AppToaster, If, Stack } from '@/components';
import {
  usePurchasesByItemsCsvExport,
  usePurchasesByItemsXlsxExport,
} from '@/hooks/query';

/**
 * Purchases by items progress loading bar.
 */
export function PurchasesByItemsLoadingBar() {
  const { isFetching } = usePurchaseByItemsContext();

  return (
    <If condition={isFetching}>
      <FinancialLoadingBar />
    </If>
  );
}

/**
 * Retrieves the purchases by items export menu.
 */
export const PurchasesByItemsExportMenu = () => {
  const commonToastConfig = { isCloseButtonShown: true, timeout: 2000 };
  const { httpQuery } = usePurchaseByItemsContext();

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

  const { mutateAsync: xlsxExport } = usePurchasesByItemsXlsxExport(
    httpQuery as PurchasesByItemsXlsxQuery,
  );
  const { mutateAsync: csvExport } = usePurchasesByItemsCsvExport(
    httpQuery as PurchasesByItemsCsvQuery,
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
};
