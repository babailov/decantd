import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

const MAX_PLANS = 3;

export interface PlanHistoryEntry {
  id: string;
  title: string;
  occasion: string;
  wineCount: number;
  createdAt: string;
}

interface PlanHistoryStore {
  plans: PlanHistoryEntry[];
  addPlan: (plan: PlanHistoryEntry) => void;
  clearHistory: () => void;
}

export const usePlanHistoryStore = createWithEqualityFn<PlanHistoryStore>()(
  persist(
    (set, get) => ({
      plans: [],

      addPlan: (plan) => {
        const existing = get().plans.filter((p) => p.id !== plan.id);
        set({ plans: [plan, ...existing].slice(0, MAX_PLANS) });
      },

      clearHistory: () => set({ plans: [] }),
    }),
    {
      name: 'decantd-plan-history',
      partialize: (state) => ({ plans: state.plans }),
    },
  ),
  shallow,
);
