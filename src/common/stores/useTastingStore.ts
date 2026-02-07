import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { TastingPlan } from '@/common/types/tasting';
import { Occasion } from '@/common/types/wine';

export type WizardStep =
  | 'occasion'
  | 'food'
  | 'preferences'
  | 'budget'
  | 'count'
  | 'review';

const STEP_ORDER: WizardStep[] = [
  'occasion',
  'food',
  'preferences',
  'budget',
  'count',
  'review',
];

interface TastingStore {
  // Wizard navigation
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStepIndex: () => number;
  totalSteps: () => number;

  // Wizard inputs
  occasion: Occasion | null;
  setOccasion: (occasion: Occasion) => void;

  foodPairing: string;
  setFoodPairing: (food: string) => void;

  regionPreferences: string[];
  setRegionPreferences: (regions: string[]) => void;
  toggleRegion: (region: string) => void;
  surpriseMe: boolean;
  setSurpriseMe: (value: boolean) => void;

  budgetMin: number;
  budgetMax: number;
  setBudgetRange: (min: number, max: number) => void;

  wineCount: number;
  setWineCount: (count: number) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  generatedPlan: TastingPlan | null;
  setGeneratedPlan: (plan: TastingPlan | null) => void;
  generationError: string | null;
  setGenerationError: (error: string | null) => void;

  // Reset
  resetWizard: () => void;
}

const initialState = {
  currentStep: 'occasion' as WizardStep,
  occasion: null as Occasion | null,
  foodPairing: '',
  regionPreferences: [] as string[],
  surpriseMe: false,
  budgetMin: 20,
  budgetMax: 40,
  wineCount: 3,
  isGenerating: false,
  generatedPlan: null as TastingPlan | null,
  generationError: null as string | null,
};

const useTastingStore = createWithEqualityFn<TastingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => {
        const idx = STEP_ORDER.indexOf(get().currentStep);
        if (idx < STEP_ORDER.length - 1) {
          set({ currentStep: STEP_ORDER[idx + 1] });
        }
      },
      prevStep: () => {
        const idx = STEP_ORDER.indexOf(get().currentStep);
        if (idx > 0) {
          set({ currentStep: STEP_ORDER[idx - 1] });
        }
      },
      currentStepIndex: () => STEP_ORDER.indexOf(get().currentStep),
      totalSteps: () => STEP_ORDER.length,

      setOccasion: (occasion) => set({ occasion }),

      setFoodPairing: (foodPairing) => set({ foodPairing }),

      setRegionPreferences: (regionPreferences) => set({ regionPreferences }),
      toggleRegion: (region) => {
        const current = get().regionPreferences;
        if (current.includes(region)) {
          set({ regionPreferences: current.filter((r) => r !== region) });
        } else {
          set({ regionPreferences: [...current, region] });
        }
      },
      setSurpriseMe: (surpriseMe) =>
        set({ surpriseMe, regionPreferences: surpriseMe ? [] : get().regionPreferences }),

      setBudgetRange: (budgetMin, budgetMax) => set({ budgetMin, budgetMax }),

      setWineCount: (wineCount) => set({ wineCount }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGeneratedPlan: (generatedPlan) => set({ generatedPlan }),
      setGenerationError: (generationError) => set({ generationError }),

      resetWizard: () => set(initialState),
    }),
    {
      name: 'decantd-tasting-wizard',
      partialize: (state) => ({
        occasion: state.occasion,
        foodPairing: state.foodPairing,
        regionPreferences: state.regionPreferences,
        surpriseMe: state.surpriseMe,
        budgetMin: state.budgetMin,
        budgetMax: state.budgetMax,
        wineCount: state.wineCount,
        currentStep: state.currentStep,
      }),
    },
  ),
  shallow,
);

export { useTastingStore, STEP_ORDER };
