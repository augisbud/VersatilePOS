import { useState, useEffect } from 'react';
import { getTagByIdItems } from '@/api';
import type { ModelsTagDto } from '@/api/types.gen';

interface UseCategoryItemCountsResult {
  tagItemCounts: Record<number, number>;
  countsLoading: boolean;
  incrementCount: (tagId: number) => void;
  decrementCount: (tagId: number) => void;
}

export const useCategoryItemCounts = (
  tags: ModelsTagDto[]
): UseCategoryItemCountsResult => {
  const [tagItemCounts, setTagItemCounts] = useState<Record<number, number>>(
    {}
  );
  const [countsLoading, setCountsLoading] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      const tagIds = tags
        .map((t) => t.id)
        .filter((id): id is number => typeof id === 'number');
      if (!tagIds.length) return;

      setCountsLoading(true);
      try {
        const entries = await Promise.all(
          tagIds.map(async (id) => {
            const res = await getTagByIdItems({ path: { id } });
            if (res.error) {
              return [id, 0] as const;
            }
            const arr = Array.isArray(res.data) ? res.data : [];
            return [id, arr.length] as const;
          })
        );

        setTagItemCounts((prev) => {
          const next = { ...prev };
          for (const [id, count] of entries) next[id] = count;
          return next;
        });
      } finally {
        setCountsLoading(false);
      }
    };

    void loadCounts();
  }, [tags]);

  const incrementCount = (tagId: number) => {
    setTagItemCounts((prev) => ({
      ...prev,
      [tagId]: (prev[tagId] ?? 0) + 1,
    }));
  };

  const decrementCount = (tagId: number) => {
    setTagItemCounts((prev) => ({
      ...prev,
      [tagId]: Math.max(0, (prev[tagId] ?? 0) - 1),
    }));
  };

  return {
    tagItemCounts,
    countsLoading,
    incrementCount,
    decrementCount,
  };
};
