import { useCallback, useState } from 'react';

import { AROMA_CATEGORIES } from '@/common/constants/aroma-wheel.const';
import type { Aroma, AromaCategory, AromaSubcategory } from '@/common/types/explore';

interface AromaWheelState {
  selectedCategory: AromaCategory | null;
  selectedSubcategory: AromaSubcategory | null;
  selectedAroma: (Aroma & { category: string; subcategory: string; color: string }) | null;
}

export function useAromaWheel() {
  const [state, setState] = useState<AromaWheelState>({
    selectedCategory: null,
    selectedSubcategory: null,
    selectedAroma: null,
  });

  const selectCategory = useCallback((categoryId: string) => {
    const cat = AROMA_CATEGORIES.find((c) => c.id === categoryId) ?? null;
    setState({
      selectedCategory: cat,
      selectedSubcategory: null,
      selectedAroma: null,
    });
  }, []);

  const selectSubcategory = useCallback((subcategoryId: string) => {
    setState((prev) => {
      if (!prev.selectedCategory) return prev;
      const sub = prev.selectedCategory.subcategories.find((s) => s.id === subcategoryId) ?? null;
      return { ...prev, selectedSubcategory: sub, selectedAroma: null };
    });
  }, []);

  const selectAroma = useCallback((aromaId: string) => {
    setState((prev) => {
      if (!prev.selectedCategory || !prev.selectedSubcategory) return prev;
      const aroma = prev.selectedSubcategory.aromas.find((a) => a.id === aromaId);
      if (!aroma) return prev;
      return {
        ...prev,
        selectedAroma: {
          ...aroma,
          category: prev.selectedCategory.label,
          subcategory: prev.selectedSubcategory.label,
          color: prev.selectedCategory.color,
        },
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState({
      selectedCategory: null,
      selectedSubcategory: null,
      selectedAroma: null,
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.selectedAroma) {
        return { ...prev, selectedAroma: null };
      }
      if (prev.selectedSubcategory) {
        return { ...prev, selectedSubcategory: null };
      }
      return { selectedCategory: null, selectedSubcategory: null, selectedAroma: null };
    });
  }, []);

  return {
    ...state,
    categories: AROMA_CATEGORIES,
    selectCategory,
    selectSubcategory,
    selectAroma,
    clearSelection,
    goBack,
  };
}
