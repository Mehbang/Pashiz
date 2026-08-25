// @ts-nocheck
import intl from 'react-intl-universal';
import { MenuItem, Button } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import React, { useCallback } from 'react';

export function CurrenciesSelectList({ selectProps, onItemSelect, className }) {
  const currencies = [
    {
      id: 'USD',
      code: 'USD',
      name: intl.get('usd_us_dollars'),
    },
    {
      id: 'CAD',
      code: 'CAD',
      name: intl.get('cad_canadian_dollars'),
    },
  ];

  // Handle currency item select.
  const onCurrencySelect = useCallback(
    (currency) => {
      onItemSelect && onItemSelect(currency);
    },
    [onItemSelect],
  );

  // Filters currencies list.
  const filterCurrenciesPredicator = useCallback(
    (query, currency, _index, exactMatch) => {
      const normalizedTitle = currency.name.toLowerCase();
      const normalizedQuery = query.toLowerCase();
      return `${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
    },
    [],
  );

  // Currency item of select currencies field.
  const currencyItem = (item, { handleClick, modifiers, query }) => {
    return (
      <MenuItem
        text={item.name}
        label={item.code}
        key={item.id}
        onClick={handleClick}
      />
    );
  };

  return (
    <Select
      items={currencies}
      noResults={<MenuItem disabled={true} text="No results." />}
      itemRenderer={currencyItem}
      itemPredicate={filterCurrenciesPredicator}
      popoverProps={{ minimal: true }}
      onItemSelect={onCurrencySelect}
      {...selectProps}
    >
      <Button text={intl.get('usd_us_dollars')} />
    </Select>
  );
}
