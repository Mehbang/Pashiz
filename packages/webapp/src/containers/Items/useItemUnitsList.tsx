import { useQuery } from '@tanstack/react-query';
import useApiRequest from '@/hooks/useRequest';
import type { ItemUnit } from '@/containers/Preferences/Units/useItemUnits';

const ITEM_UNITS_QUERY_KEY = 'ITEM_UNITS';

/**
 * The organization's units of measure, for the pickers on the item form.
 *
 * Cached: the list changes rarely and every item form needs it.
 */
export function useItemUnitsList() {
  const { http } = useApiRequest();

  return useQuery<ItemUnit[]>({
    queryKey: [ITEM_UNITS_QUERY_KEY],
    queryFn: () => http.get('/api/item-units').then((res) => res.data ?? []),
    initialData: [],
  });
}
