import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import type {
  Clarity,
  ColorDepth,
  FinishLength,
  GuidedTastingStep,
  SavedGuidedTasting,
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

  // Wine identity
  wineName: string;
  setWineName: (name: string) => void;
  varietal: string;
  setVarietal: (v: string) => void;
  year: string;
  setYear: (y: string) => void;

  // Saved tasting ID (from DB)
  savedTastingId: string | null;
  setSavedTastingId: (id: string | null) => void;

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

  // Review mode (summary view for saved tastings)
  isReviewMode: boolean;
  setIsReviewMode: (v: boolean) => void;

  // Hydrate from saved tasting
  hydrateFromSaved: (data: SavedGuidedTasting) => void;

  // Reset
  resetSession: () => void;
}

const initialState = {
  currentStep: 'look' as GuidedTastingStep,
  wineName: '',
  varietal: '',
  year: '',
  savedTastingId: null as string | null,
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
  isReviewMode: false,
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

      setWineName: (wineName) => set({ wineName }),
      setVarietal: (varietal) => set({ varietal }),
      setYear: (year) => set({ year }),
      setSavedTastingId: (savedTastingId) => set({ savedTastingId }),

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

      setIsReviewMode: (isReviewMode) => set({ isReviewMode }),

      hydrateFromSaved: (data) =>
        set({
          savedTastingId: data.id,
          wineName: data.wineName ?? '',
          varietal: data.varietal ?? '',
          year: data.year ? String(data.year) : '',
          wineType: data.wineType,
          colorDepth: data.colorDepth,
          clarity: data.clarity,
          viscosityNoted: data.viscosityNoted,
          selectedAromas: data.selectedAromas,
          acidity: data.acidity,
          tannin: data.tannin,
          sweetness: data.sweetness,
          alcohol: data.alcohol,
          body: data.body,
          balance: data.balance,
          complexity: data.complexity,
          finishLength: data.finishLength,
          wouldDrinkAgain: data.wouldDrinkAgain,
          notes: data.notes,
          currentStep: 'summary',
          isReviewMode: true,
        }),

      resetSession: () => set(initialState),
    }),
    {
      name: 'decantd-guided-tasting',
      partialize: (state) => ({
        currentStep: state.currentStep,
        wineName: state.wineName,
        varietal: state.varietal,
        year: state.year,
        savedTastingId: state.savedTastingId,
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
        isReviewMode: state.isReviewMode,
      }),
    },
  ),
  shallow,
);

export { useGuidedTastingStore };
