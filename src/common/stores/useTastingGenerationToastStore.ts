import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

export type TastingGenerationStatus = 'idle' | 'loading' | 'success' | 'error';

interface TastingGenerationToastState {
  status: TastingGenerationStatus;
  sourcePath: string | null;
  planId: string | null;
  errorMessage: string | null;
  generationStartedAt: number | null;
  startGeneration: (sourcePath: string) => void;
  finishGeneration: (planId: string) => void;
  failGeneration: (message: string) => void;
  clearGeneration: () => void;
}

const initialState = {
  status: 'idle' as TastingGenerationStatus,
  sourcePath: null as string | null,
  planId: null as string | null,
  errorMessage: null as string | null,
  generationStartedAt: null as number | null,
};

export const useTastingGenerationToastStore = createWithEqualityFn<TastingGenerationToastState>()(
  (set) => ({
    ...initialState,

    startGeneration: (sourcePath) =>
      set({
        status: 'loading',
        sourcePath,
        planId: null,
        errorMessage: null,
        generationStartedAt: Date.now(),
      }),

    finishGeneration: (planId) =>
      set({
        status: 'success',
        planId,
        errorMessage: null,
      }),

    failGeneration: (message) =>
      set({
        status: 'error',
        errorMessage: message,
        planId: null,
      }),

    clearGeneration: () => set(initialState),
  }),
  shallow,
);
