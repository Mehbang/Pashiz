// @ts-nocheck
import intl from 'react-intl-universal';
import React from 'react';
import { TaskAccessor, TaskTimeAccessor } from './components';

/**
 * Retrieve project tasks list columns.
 */
export function useProjectTaskColumns() {
  return React.useMemo(
    () => [
      {
        id: 'name',
        Header: intl.get('header'),
        accessor: TaskAccessor,
        width: 100,
        className: 'name',
        clickable: true,
        textOverview: true,
      },
      {
        id: 'actions',
        Header: intl.get('header'),
        accessor: TaskTimeAccessor,
        width: 100,
        className: 'name',
        clickable: true,
        textOverview: true,
      },
    ],
    [],
  );
}
