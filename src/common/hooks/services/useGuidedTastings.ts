'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/common/constants/queryKeys';
import {
  fetchGuidedTasting,
  fetchGuidedTastings,
  saveGuidedTasting,
  updateGuidedTasting,
} from '@/common/services/guided-tasting-api';
import type { SavedGuidedTasting } from '@/common/types/explore';

export function useGuidedTasting(id: string | null) {
  return useQuery({
    queryKey: queryKeys.guidedTastings.byId(id ?? ''),
    queryFn: () => fetchGuidedTasting(id!),
    enabled: !!id,
  });
}

export function useGuidedTastingsList() {
  return useQuery({
    queryKey: queryKeys.guidedTastings.all,
    queryFn: fetchGuidedTastings,
  });
}

export function useSaveGuidedTasting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SavedGuidedTasting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      saveGuidedTasting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guidedTastings.all });
    },
  });
}

export function useUpdateGuidedTasting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<SavedGuidedTasting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> }) =>
      updateGuidedTasting(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guidedTastings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.guidedTastings.byId(variables.id) });
    },
  });
}
