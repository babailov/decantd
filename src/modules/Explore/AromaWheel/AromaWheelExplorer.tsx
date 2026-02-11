'use client';

import { ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/common/components/Button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/common/components/Drawer';
import { AROMA_CATEGORIES } from '@/common/constants/aroma-wheel.const';
import { cn } from '@/common/functions/cn';

import { AromaWheel } from './AromaWheel';
import { useAromaWheel } from './useAromaWheel';

export function AromaWheelExplorer() {
  const {
    selectedCategory,
    selectedSubcategory,
    selectedAroma,
    selectCategory,
    selectSubcategory,
    selectAroma,
    clearSelection,
    goBack,
  } = useAromaWheel();

  const handleAromaClick = (aromaId: string) => {
    // Navigate through the full hierarchy to reach the aroma
    for (const cat of AROMA_CATEGORIES) {
      for (const sub of cat.subcategories) {
        const aroma = sub.aromas.find((a) => a.id === aromaId);
        if (aroma) {
          // Set category and subcategory first, then the aroma
          if (selectedCategory?.id !== cat.id) selectCategory(cat.id);
          if (selectedSubcategory?.id !== sub.id) selectSubcategory(sub.id);
          selectAroma(aromaId);
          return;
        }
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-s py-m">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-m">
          <div>
            <h1 className="font-display text-heading-l text-primary">
              Aroma Wheel
            </h1>
            <p className="text-body-s text-text-secondary">
              Tap to explore wine aromas
            </p>
          </div>
          {selectedCategory && (
            <button
              className="flex items-center gap-1 text-body-xs text-text-muted hover:text-primary transition-colors"
              onClick={clearSelection}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </motion.div>

      {/* Breadcrumb */}
      {selectedCategory && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-body-xs text-text-muted mb-s"
          initial={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <button className="hover:text-primary" onClick={clearSelection}>
            All
          </button>
          <span>/</span>
          <button
            className={cn(
              !selectedSubcategory ? 'text-primary font-medium' : 'hover:text-primary',
            )}
            onClick={() => {
              selectCategory(selectedCategory.id);
            }}
          >
            {selectedCategory.label}
          </button>
          {selectedSubcategory && (
            <>
              <span>/</span>
              <span className="text-primary font-medium">
                {selectedSubcategory.label}
              </span>
            </>
          )}
        </motion.div>
      )}

      <AromaWheel
        selectedAromaId={selectedAroma?.id ?? null}
        selectedCategoryId={selectedCategory?.id ?? null}
        selectedSubcategoryId={selectedSubcategory?.id ?? null}
        onSelectAroma={handleAromaClick}
        onSelectCategory={selectCategory}
        onSelectSubcategory={selectSubcategory}
      />

      {/* Detail drawer for selected aroma */}
      <Drawer
        open={selectedAroma !== null}
        onOpenChange={(open) => {
          if (!open) goBack();
        }}
      >
        <DrawerContent>
          {selectedAroma && (
            <div className="pb-l">
              <DrawerTitle>{selectedAroma.label}</DrawerTitle>
              <DrawerDescription>{selectedAroma.description}</DrawerDescription>

              <div className="px-l mt-m">
                <div className="flex items-center gap-xs mb-xs">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedAroma.color }}
                  />
                  <span className="text-body-xs text-text-muted">
                    {selectedAroma.category} → {selectedAroma.subcategory}
                  </span>
                </div>

                {selectedAroma.commonIn.length > 0 && (
                  <div className="mt-s">
                    <h4 className="text-body-xs font-medium text-text-primary mb-xs">
                      Common in:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAroma.commonIn.map((wine) => (
                        <span
                          key={wine}
                          className="text-body-xs px-xs py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {wine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <div className="mt-m">
        <Link href="/explore">
          <Button className="w-full" variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Explore
          </Button>
        </Link>
      </div>
    </div>
  );
}
