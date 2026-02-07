'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/common/constants/queryKeys';
import { getTastingPlan } from '@/common/services/tasting-api';

export function useTastingPlan(id: string) {
  return useQuery({
    queryKey: queryKeys.tastingPlans.byId(id),
    queryFn: () => getTastingPlan(id),
    enabled: !!id,
  });
}
