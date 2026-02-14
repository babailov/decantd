import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { TastingPlan } from '@/common/types/tasting';
import { Occasion } from '@/common/types/wine';

export type WizardMode = 'food_to_wine' | 'wine_to_food';

export type WizardStep =
  | 'occasion'
  | 'food'
  | 'preferences'
  | 'budget'
  | 'count'
  | 'wine'
  | 'refinements'
  | 'cuisines'
  | 'context'
  | 'review';

const FOOD_TO_WINE_STEP_ORDER: WizardStep[] = [
  'occasion',
  'food',
  'preferences',
  'budget',
  'count',
  'review',
];

const WINE_TO_FOOD_STEP_ORDER: WizardStep[] = [
  'wine',
  'occasion',
  'refinements',
  'cuisines',
  'context',
  'review',
];

function getStepOrder(mode: WizardMode): WizardStep[] {
  return mode === 'wine_to_food' ? WINE_TO_FOOD_STEP_ORDER : FOOD_TO_WINE_STEP_ORDER;
}

interface TastingStore {
  // Wizard mode
  mode: WizardMode;
  setMode: (mode: WizardMode) => void;

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

  specialRequest: string;
  setSpecialRequest: (value: string) => void;

  // Wine to food inputs
  wineInputType: 'style' | 'specific';
  setWineInputType: (value: 'style' | 'specific') => void;
  wineInputValue: string;
  setWineInputValue: (value: string) => void;
  diet: 'none' | 'vegetarian' | 'vegan' | 'pescatarian';
  setDiet: (value: 'none' | 'vegetarian' | 'vegan' | 'pescatarian') => void;
  prepTime: '<30' | '30_60' | '60_plus';
  setPrepTime: (value: '<30' | '30_60' | '60_plus') => void;
  spiceLevel: 'mild' | 'medium' | 'high';
  setSpiceLevel: (value: 'mild' | 'medium' | 'high') => void;
  dishBudgetMin: number;
  dishBudgetMax: number;
  setDishBudgetRange: (min: number, max: number) => void;
  cuisinePreferences: string[];
  toggleCuisinePreference: (value: string) => void;
  guestCountBand: 'small' | 'medium' | 'large';
  setGuestCountBand: (value: 'small' | 'medium' | 'large') => void;

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
  mode: 'food_to_wine' as WizardMode,
  currentStep: 'occasion' as WizardStep,
  occasion: null as Occasion | null,
  foodPairing: '',
  regionPreferences: [] as string[],
  surpriseMe: false,
  budgetMin: 20,
  budgetMax: 40,
  wineCount: 3,
  specialRequest: '',
  wineInputType: 'style' as 'style' | 'specific',
  wineInputValue: '',
  diet: 'none' as 'none' | 'vegetarian' | 'vegan' | 'pescatarian',
  prepTime: '30_60' as '<30' | '30_60' | '60_plus',
  spiceLevel: 'medium' as 'mild' | 'medium' | 'high',
  dishBudgetMin: 15,
  dishBudgetMax: 40,
  cuisinePreferences: [] as string[],
  guestCountBand: 'medium' as 'small' | 'medium' | 'large',
  isGenerating: false,
  generatedPlan: null as TastingPlan | null,
  generationError: null as string | null,
};

const useTastingStore = createWithEqualityFn<TastingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMode: (mode) =>
        set({
          mode,
          currentStep: getStepOrder(mode)[0],
        }),
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => {
        const stepOrder = getStepOrder(get().mode);
        const idx = stepOrder.indexOf(get().currentStep);
        if (idx < stepOrder.length - 1) {
          set({ currentStep: stepOrder[idx + 1] });
        }
      },
      prevStep: () => {
        const stepOrder = getStepOrder(get().mode);
        const idx = stepOrder.indexOf(get().currentStep);
        if (idx > 0) {
          set({ currentStep: stepOrder[idx - 1] });
        }
      },
      currentStepIndex: () => getStepOrder(get().mode).indexOf(get().currentStep),
      totalSteps: () => getStepOrder(get().mode).length,

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
      setSpecialRequest: (specialRequest) => set({ specialRequest }),
      setWineInputType: (wineInputType) => set({ wineInputType }),
      setWineInputValue: (wineInputValue) => set({ wineInputValue }),
      setDiet: (diet) => set({ diet }),
      setPrepTime: (prepTime) => set({ prepTime }),
      setSpiceLevel: (spiceLevel) => set({ spiceLevel }),
      setDishBudgetRange: (dishBudgetMin, dishBudgetMax) =>
        set({ dishBudgetMin, dishBudgetMax }),
      toggleCuisinePreference: (value) => {
        const current = get().cuisinePreferences;
        if (current.includes(value)) {
          set({ cuisinePreferences: current.filter((item) => item !== value) });
        } else {
          set({ cuisinePreferences: [...current, value] });
        }
      },
      setGuestCountBand: (guestCountBand) => set({ guestCountBand }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGeneratedPlan: (generatedPlan) => set({ generatedPlan }),
      setGenerationError: (generationError) => set({ generationError }),

      resetWizard: () => set(initialState),
    }),
    {
      name: 'decantd-tasting-wizard',
      partialize: (state) => ({
        mode: state.mode,
        occasion: state.occasion,
        foodPairing: state.foodPairing,
        regionPreferences: state.regionPreferences,
        surpriseMe: state.surpriseMe,
        budgetMin: state.budgetMin,
        budgetMax: state.budgetMax,
        wineCount: state.wineCount,
        specialRequest: state.specialRequest,
        wineInputType: state.wineInputType,
        wineInputValue: state.wineInputValue,
        diet: state.diet,
        prepTime: state.prepTime,
        spiceLevel: state.spiceLevel,
        dishBudgetMin: state.dishBudgetMin,
        dishBudgetMax: state.dishBudgetMax,
        cuisinePreferences: state.cuisinePreferences,
        guestCountBand: state.guestCountBand,
        currentStep: state.currentStep,
      }),
    },
  ),
  shallow,
);

export {
  FOOD_TO_WINE_STEP_ORDER,
  WINE_TO_FOOD_STEP_ORDER,
  getStepOrder,
  useTastingStore,
};
