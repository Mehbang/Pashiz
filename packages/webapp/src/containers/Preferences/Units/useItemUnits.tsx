import React from 'react';
import useApiRequest from '@/hooks/useRequest';

export interface ItemUnit {
  id: number;
  name: string;
  symbol: string | null;
  label: string;
  active: boolean;
}

export interface ItemUnitInput {
  name: string;
  symbol?: string | null;
}

/**
 * The organization's units of measure.
 *
 * Plain requests rather than react-query hooks: the list is short, it is only
 * read on one screen, and every change here has to be reflected immediately
 * beside itself — a cache to invalidate would be more machinery than the
 * screen is worth.
 */
export function useItemUnits() {
  const { http } = useApiRequest();

  const listUnits = React.useCallback(async (): Promise<ItemUnit[]> => {
    const response = await http.get('/api/item-units');
    return response.data ?? [];
  }, [http]);

  const createUnit = React.useCallback(
    async (unit: ItemUnitInput) => {
      await http.post('/api/item-units', unit);
    },
    [http],
  );

  const editUnit = React.useCallback(
    async (id: number, unit: ItemUnitInput) => {
      await http.put(`/api/item-units/${id}`, unit);
    },
    [http],
  );

  const deleteUnit = React.useCallback(
    async (id: number) => {
      await http.delete(`/api/item-units/${id}`);
    },
    [http],
  );

  return { listUnits, createUnit, editUnit, deleteUnit };
}
