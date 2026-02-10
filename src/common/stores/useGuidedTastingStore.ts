import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import type {
  Clarity,
  ColorDepth,
  FinishLength,
  GuidedTastingStep,
  WineTypeContext,
} from '@/common/types/explore';

export const GUIDED_STEP_ORDER: GuidedTastingStep[] = [
  'look',
  'smell',
  'taste',
  'think',
];

interface GuidedTastingStore {
  // Step navigation
  currentStep: GuidedTastingStep;
  setCurrentStep: (step: GuidedTastingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStepIndex: () => number;

  // Look
  wineType: WineTypeContext | null;
  setWineType: (wt: WineTypeContext) => void;
  colorDepth: ColorDepth | null;
  setColorDepth: (cd: ColorDepth) => void;
  clarity: Clarity | null;
  setClarity: (c: Clarity) => void;
  viscosityNoted: boolean;
  setViscosityNoted: (v: boolean) => void;

  // Smell
  selectedAromas: string[];
  toggleAroma: (id: string) => void;
  clearAromas: () => void;

  // Taste
  acidity: number;
  tannin: number;
  sweetness: number;
  alcohol: number;
  body: number;
  setDimension: (key: 'acidity' | 'tannin' | 'sweetness' | 'alcohol' | 'body', value: number) => void;

  // Think
  balance: number;
  complexity: number;
  finishLength: FinishLength | null;
  setFinishLength: (fl: FinishLength) => void;
  wouldDrinkAgain: boolean | null;
  setWouldDrinkAgain: (v: boolean) => void;
  notes: string;
  setNotes: (n: string) => void;
  setBalance: (v: number) => void;
  setComplexity: (v: number) => void;

  // Reset
  resetSession: () => void;
}

const initialState = {
  currentStep: 'look' as GuidedTastingStep,
  wineType: null as WineTypeContext | null,
  colorDepth: null as ColorDepth | null,
  clarity: null as Clarity | null,
  viscosityNoted: false,
  selectedAromas: [] as string[],
  acidity: 3,
  tannin: 3,
  sweetness: 1,
  alcohol: 3,
  body: 3,
  balance: 0,
  complexity: 0,
  finishLength: null as FinishLength | null,
  wouldDrinkAgain: null as boolean | null,
  notes: '',
};

const useGuidedTastingStore = createWithEqualityFn<GuidedTastingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => {
        const idx = GUIDED_STEP_ORDER.indexOf(get().currentStep);
        if (idx < GUIDED_STEP_ORDER.length - 1) {
          set({ currentStep: GUIDED_STEP_ORDER[idx + 1] });
        }
      },
      prevStep: () => {
        const idx = GUIDED_STEP_ORDER.indexOf(get().currentStep);
        if (idx > 0) {
          set({ currentStep: GUIDED_STEP_ORDER[idx - 1] });
        }
      },
      currentStepIndex: () => GUIDED_STEP_ORDER.indexOf(get().currentStep),

      setWineType: (wineType) => set({ wineType }),
      setColorDepth: (colorDepth) => set({ colorDepth }),
      setClarity: (clarity) => set({ clarity }),
      setViscosityNoted: (viscosityNoted) => set({ viscosityNoted }),

      toggleAroma: (id) => {
        const current = get().selectedAromas;
        if (current.includes(id)) {
          set({ selectedAromas: current.filter((a) => a !== id) });
        } else {
          set({ selectedAromas: [...current, id] });
        }
      },
      clearAromas: () => set({ selectedAromas: [] }),

      setDimension: (key, value) => set({ [key]: value }),

      setBalance: (balance) => set({ balance }),
      setComplexity: (complexity) => set({ complexity }),
      setFinishLength: (finishLength) => set({ finishLength }),
      setWouldDrinkAgain: (wouldDrinkAgain) => set({ wouldDrinkAgain }),
      setNotes: (notes) => set({ notes }),

      resetSession: () => set(initialState),
    }),
    {
      name: 'decantd-guided-tasting',
      partialize: (state) => ({
        currentStep: state.currentStep,
        wineType: state.wineType,
        colorDepth: state.colorDepth,
        clarity: state.clarity,
        viscosityNoted: state.viscosityNoted,
        selectedAromas: state.selectedAromas,
        acidity: state.acidity,
        tannin: state.tannin,
        sweetness: state.sweetness,
        alcohol: state.alcohol,
        body: state.body,
        balance: state.balance,
        complexity: state.complexity,
        finishLength: state.finishLength,
        wouldDrinkAgain: state.wouldDrinkAgain,
        notes: state.notes,
      }),
    },
  ),
  shallow,
);

export { useGuidedTastingStore };
