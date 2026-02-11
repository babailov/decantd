'use client';

import { ChevronLeft, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';

import { AROMA_CATEGORIES } from '@/common/constants/aroma-wheel.const';

import { arcPath, midAngle, polarToCartesian } from './aromaWheelMath';

const CX = 180;
const CY = 180;
const INNER_R = 82;
const OUTER_R = 154;

interface AromaWheelMobileProps {
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedAromaId: string | null;
  onSelectCategory: (id: string) => void;
  onSelectSubcategory: (id: string) => void;
  onSelectAroma: (id: string) => void;
  onBack: () => void;
  onReset: () => void;
}

interface WheelItem {
  id: string;
  label: string;
  color: string;
}

function levelFromSelection(selectedCategoryId: string | null, selectedSubcategoryId: string | null) {
  if (!selectedCategoryId) return 'category' as const;
  if (!selectedSubcategoryId) return 'subcategory' as const;
  return 'aroma' as const;
}

export function AromaWheelMobile({
  selectedCategoryId,
  selectedSubcategoryId,
  selectedAromaId,
  onSelectCategory,
  onSelectSubcategory,
  onSelectAroma,
  onBack,
  onReset,
}: AromaWheelMobileProps) {
  const level = levelFromSelection(selectedCategoryId, selectedSubcategoryId);

  const selectedCategory = selectedCategoryId
    ? AROMA_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null
    : null;

  const selectedSubcategory = selectedCategory && selectedSubcategoryId
    ? selectedCategory.subcategories.find((s) => s.id === selectedSubcategoryId) ?? null
    : null;

  const items: WheelItem[] = useMemo(() => {
    if (level === 'category') {
      return AROMA_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        color: cat.color,
      }));
    }

    if (level === 'subcategory' && selectedCategory) {
      return selectedCategory.subcategories.map((sub) => ({
        id: sub.id,
        label: sub.label,
        color: `${selectedCategory.color}CC`,
      }));
    }

    if (level === 'aroma' && selectedSubcategory && selectedCategory) {
      return selectedSubcategory.aromas.map((aroma) => ({
        id: aroma.id,
        label: aroma.label,
        color: `${selectedCategory.color}99`,
      }));
    }

    return [];
  }, [level, selectedCategory, selectedSubcategory]);

  const title = level === 'category'
    ? 'Pick a Family'
    : level === 'subcategory'
      ? 'Pick a Style'
      : 'Pick an Aroma';

  const subtitle = level === 'category'
    ? `${AROMA_CATEGORIES.length} categories`
    : level === 'subcategory'
      ? `${selectedCategory?.label ?? ''} • ${items.length} subcategories`
      : `${selectedSubcategory?.label ?? ''} • ${items.length} aromas`;

  const depth = level === 'category' ? 1 : level === 'subcategory' ? 2 : 3;

  const arcs = useMemo(() => {
    if (items.length === 0) return [];

    const gap = items.length <= 4 ? 3 : 2;
    const segment = (360 - gap * items.length) / items.length;
    let angle = 0;

    return items.map((item) => {
      const start = angle;
      const end = start + segment;
      const labelAngle = midAngle(start, end);
      const labelPos = polarToCartesian(CX, CY, (INNER_R + OUTER_R) / 2, labelAngle);

      angle = end + gap;

      return {
        ...item,
        path: arcPath(CX, CY, INNER_R, OUTER_R, start, end),
        lx: labelPos.x,
        ly: labelPos.y,
      };
    });
  }, [items]);

  return (
    <div className="md:hidden">
      <div className="sticky top-[56px] z-10 bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80 rounded-m px-s py-xs mb-s border border-border">
        <div className="flex items-center justify-between gap-s">
          <button
            className="inline-flex items-center gap-1 text-body-xs text-text-secondary disabled:opacity-40"
            disabled={level === 'category'}
            type="button"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-body-xs text-text-muted">
            {depth}/3
          </div>
          <button
            className="inline-flex items-center gap-1 text-body-xs text-text-secondary disabled:opacity-40"
            disabled={level === 'category'}
            type="button"
            onClick={onReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="mb-s text-center">
        <h2 className="font-display text-heading-s text-primary">{title}</h2>
        <p className="text-body-xs text-text-muted">{subtitle}</p>
      </div>

      <div className="w-full aspect-square max-w-[360px] mx-auto">
        <svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
          <AnimatePresence mode="wait">
            <motion.g
              key={`${level}:${selectedCategoryId ?? 'all'}:${selectedSubcategoryId ?? 'all'}`}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              initial={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {arcs.map((arc, index) => {
                const isSelected = arc.id === selectedAromaId;

                return (
                  <motion.g
                    key={arc.id}
                    animate={{ opacity: 1, scale: 1 }}
                    className="cursor-pointer"
                    initial={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: index * 0.02, duration: 0.18 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (level === 'category') onSelectCategory(arc.id);
                      if (level === 'subcategory') onSelectSubcategory(arc.id);
                      if (level === 'aroma') onSelectAroma(arc.id);
                    }}
                  >
                    <path
                      d={arc.path}
                      fill={isSelected ? '#FFFFFF' : arc.color}
                      stroke="white"
                      strokeWidth={1.6}
                    />
                    <text
                      dominantBaseline="middle"
                      fill={isSelected ? '#3b2f2f' : 'white'}
                      fontSize={items.length > 5 ? 11 : 12}
                      fontWeight={isSelected ? 700 : 600}
                      textAnchor="middle"
                      x={arc.lx}
                      y={arc.ly}
                    >
                      {arc.label}
                    </text>
                  </motion.g>
                );
              })}
            </motion.g>
          </AnimatePresence>

          <circle cx={CX} cy={CY} fill="white" r={INNER_R - 4} stroke="#e0d5c5" strokeWidth={1.2} />
          <text
            dominantBaseline="middle"
            fill="#722F37"
            fontSize={18}
            fontWeight={700}
            textAnchor="middle"
            x={CX}
            y={CY - 8}
          >
            {depth}/3
          </text>
          <text
            dominantBaseline="middle"
            fill="#9b8b83"
            fontSize={10}
            fontWeight={500}
            textAnchor="middle"
            x={CX}
            y={CY + 12}
          >
            {level}
          </text>
        </svg>
      </div>
    </div>
  );
}
