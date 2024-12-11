import { useCallback, useState } from "react";

import { RESULTS_PER_PAGE_LIMIT } from "@/common/constants";

import { PaginatedResponse, QueryRoute } from "@/Utils/request/types";
import useQuery, { QueryOptions } from "@/Utils/request/useQuery";

export interface InfiniteQueryOptions<TItem>
  extends QueryOptions<PaginatedResponse<TItem>> {
  deduplicateBy: (item: TItem) => string | number;
}

export function useInfiniteQuery<TItem>(
  route: QueryRoute<PaginatedResponse<TItem>>,
  options?: InfiniteQueryOptions<TItem>,
) {
  const [items, setItems] = useState<TItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(Infinity);
  const [offset, setOffset] = useState(0);

  const { refetch, loading, ...queryResponse } = useQuery(route, {
    ...options,
    query: {
      ...(options?.query ?? {}),
      offset,
    },
    onResponse: ({ data }) => {
      if (!data) return;
      const allItems = items.concat(data.results);

      const deduplicatedItems = options?.deduplicateBy
        ? Array.from(
            allItems
              .reduce((map, item) => {
                const key = options.deduplicateBy(item);
                return map.set(key, item);
              }, new Map<string | number, TItem>())
              .values(),
          )
        : allItems;

      setItems(deduplicatedItems);
      setTotalCount(data.count);
    },
  });

  const fetchNextPage = useCallback(() => {
    if (loading) return;
    setOffset((prevOffset) => prevOffset + RESULTS_PER_PAGE_LIMIT);
  }, [loading]);

  return {
    items,
    loading,
    fetchNextPage,
    refetch,
    totalCount,
    hasMore: totalCount ? items.length < totalCount : true,
    ...queryResponse,
  };
}
