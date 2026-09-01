import React from 'react';
import intl from 'react-intl-universal';
import { useReceiptDetailDrawerContext } from './ReceiptDetailDrawerProvider';
import { FormatNumberCell, TextOverviewTooltipCell } from '@/components';
import { getColumnWidth } from '@/utils';

export const useReceiptReadonlyEntriesTableColumns = () => {
  // Receipt details drawer context.
  const { receipt } = useReceiptDetailDrawerContext();
  const entries = receipt?.entries ?? [];

  return React.useMemo(
    () => [
      {
        Header: intl.get('product_and_service'),
        accessor: 'item.name',
        Cell: TextOverviewTooltipCell,
        width: 150,
        className: 'name',
        disableSortBy: true,
        textOverview: true,
      },
      {
        Header: intl.get('description'),
        accessor: 'description',
        Cell: TextOverviewTooltipCell,
        className: 'description',
        disableSortBy: true,
        textOverview: true,
      },
      {
        Header: intl.get('quantity'),
        accessor: 'quantityFormatted',
        width: getColumnWidth(entries, 'quantityFormatted', {
          minWidth: 60,
          magicSpacing: 5,
        }),
        align: 'right',
        disableSortBy: true,
      },
      {
        // The same amount in the item's second unit, where the item
        // has one. Blank otherwise, and it carries its own unit.
        Header: intl.get('entries.secondary_unit_quantity'),
        accessor: 'secondaryQuantityWithUnit',
        align: 'right',
        disableSortBy: true,
        width: 110,
      },
      {
        Header: intl.get('rate'),
        accessor: 'rateFormatted',
        width: getColumnWidth(entries, 'rateFormatted', {
          minWidth: 60,
          magicSpacing: 5,
        }),
        align: 'right',
        disableSortBy: true,
        textOverview: true,
      },
      {
        id: 'discount',
        Header: intl.get('discount_2'),
        accessor: 'discountFormatted',
        align: 'right',
        disableSortBy: true,
        textOverview: true,
        width: getColumnWidth(entries, 'discountFormatted', {
          minWidth: 60,
          magicSpacing: 5,
        }),
      },
      {
        Header: intl.get('amount'),
        accessor: 'totalFormatted',
        width: getColumnWidth(entries, 'totalFormatted', {
          minWidth: 60,
          magicSpacing: 5,
        }),
        align: 'right',
        disableSortBy: true,
        textOverview: true,
      },
    ],
    [entries],
  );
};
