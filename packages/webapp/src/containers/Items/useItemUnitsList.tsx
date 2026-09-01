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
    // `placeholderData`, not `initialData`. The application sets a global
    // `staleTime` of 30s, and `initialData` is written into the cache as
    // though it had just been fetched — so an empty array counted as a fresh
    // answer and the request was never made. The picker stayed empty for the
    // first half minute of every visit, which is every visit.
    placeholderData: [],
  });
}
