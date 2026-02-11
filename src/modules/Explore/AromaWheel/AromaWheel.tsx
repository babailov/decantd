'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';

import { AROMA_CATEGORIES } from '@/common/constants/aroma-wheel.const';

// SVG arc math helpers
const CX = 200;
const CY = 200;
const INNER_R = 45;
const MID_R = 95;
const OUTER_R = 145;
const EDGE_R = 195;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;

  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function midAngle(start: number, end: number) {
  return (start + end) / 2;
}

function labelPosition(cx: number, cy: number, r: number, angleDeg: number) {
  const pos = polarToCartesian(cx, cy, r, angleDeg);
  return { x: pos.x, y: pos.y };
}

interface AromaWheelProps {
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedAromaId: string | null;
  onSelectCategory: (id: string) => void;
  onSelectSubcategory: (id: string) => void;
  onSelectAroma: (id: string) => void;
}

export function AromaWheel({
  selectedCategoryId,
  selectedSubcategoryId,
  selectedAromaId,
  onSelectCategory,
  onSelectSubcategory,
  onSelectAroma,
}: AromaWheelProps) {
  // Compute all arcs
  const { categoryArcs, subcategoryArcs, aromaArcs } = useMemo(() => {
    const totalAromas = AROMA_CATEGORIES.reduce(
      (sum, cat) => sum + cat.subcategories.reduce((s, sub) => s + sub.aromas.length, 0),
      0,
    );
    const degPerAroma = 360 / totalAromas;

    const catArcs: { id: string; path: string; color: string; label: string; lx: number; ly: number }[] = [];
    const subArcs: { id: string; catId: string; path: string; color: string; label: string; lx: number; ly: number }[] = [];
    const arArcs: { id: string; catId: string; subId: string; path: string; color: string; label: string; lx: number; ly: number; rotation: number }[] = [];

    let angle = 0;

    for (const cat of AROMA_CATEGORIES) {
      const catStart = angle;
      const aromaCount = cat.subcategories.reduce((s, sub) => s + sub.aromas.length, 0);
      const catEnd = catStart + aromaCount * degPerAroma;

      const mid = midAngle(catStart, catEnd);
      const lp = labelPosition(CX, CY, (INNER_R + MID_R) / 2, mid);
      catArcs.push({
        id: cat.id,
        path: arcPath(CX, CY, INNER_R, MID_R, catStart, catEnd),
        color: cat.color,
        label: cat.label,
        lx: lp.x,
        ly: lp.y,
      });

      for (const sub of cat.subcategories) {
        const subStart = angle;
        const subEnd = subStart + sub.aromas.length * degPerAroma;

        const subMid = midAngle(subStart, subEnd);
        const slp = labelPosition(CX, CY, (MID_R + OUTER_R) / 2, subMid);

        // Lighten the color for subcategory ring
        const subColor = cat.color + 'CC';

        subArcs.push({
          id: sub.id,
          catId: cat.id,
          path: arcPath(CX, CY, MID_R, OUTER_R, subStart, subEnd),
          color: subColor,
          label: sub.label,
          lx: slp.x,
          ly: slp.y,
        });

        for (const aroma of sub.aromas) {
          const aStart = angle;
          const aEnd = aStart + degPerAroma;

          const aMid = midAngle(aStart, aEnd);
          const alp = labelPosition(CX, CY, (OUTER_R + EDGE_R) / 2, aMid);

          // Lighten more for outer ring
          const aromaColor = cat.color + '99';

          // Calculate rotation for the label to be readable
          let rotation = aMid;
          if (aMid > 90 && aMid < 270) {
            rotation = aMid + 180;
          }

          arArcs.push({
            id: aroma.id,
            catId: cat.id,
            subId: sub.id,
            path: arcPath(CX, CY, OUTER_R, EDGE_R, aStart, aEnd),
            color: aromaColor,
            label: aroma.label,
            lx: alp.x,
            ly: alp.y,
            rotation: rotation - 90,
          });

          angle = aEnd;
        }
      }
    }

    return { categoryArcs: catArcs, subcategoryArcs: subArcs, aromaArcs: arArcs };
  }, []);

  return (
    <div className="w-full aspect-square max-w-[400px] mx-auto">
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring: individual aromas */}
        {aromaArcs.map((arc) => {
          const isDimmed = selectedCategoryId !== null && arc.catId !== selectedCategoryId;
          const isHighlighted = arc.id === selectedAromaId;

          return (
            <motion.g
              key={arc.id}
              animate={{ opacity: isDimmed ? 0.2 : 1 }}
              className="cursor-pointer"
              transition={{ duration: 0.2 }}
              whileHover={{ opacity: 1 }}
              onClick={() => onSelectAroma(arc.id)}
            >
              <path
                d={arc.path}
                fill={isHighlighted ? '#FFFFFF' : arc.color}
                stroke="white"
                strokeWidth={0.8}
              />
              <text
                dominantBaseline="central"
                fill={isHighlighted ? arc.catId : 'white'}
                fontSize={5.5}
                fontWeight={isHighlighted ? 700 : 400}
                textAnchor="middle"
                transform={`translate(${arc.lx}, ${arc.ly}) rotate(${arc.rotation})`}
              >
                {arc.label}
              </text>
            </motion.g>
          );
        })}

        {/* Middle ring: subcategories */}
        {subcategoryArcs.map((arc) => {
          const isDimmed = selectedCategoryId !== null && arc.catId !== selectedCategoryId;
          const isHighlighted = arc.id === selectedSubcategoryId;

          return (
            <motion.g
              key={arc.id}
              animate={{ opacity: isDimmed ? 0.2 : 1 }}
              className="cursor-pointer"
              transition={{ duration: 0.2 }}
              whileHover={{ opacity: 1 }}
              onClick={() => onSelectSubcategory(arc.id)}
            >
              <path
                d={arc.path}
                fill={isHighlighted ? '#FFFFFF' : arc.color}
                stroke="white"
                strokeWidth={1}
              />
              <text
                dominantBaseline="central"
                fill={isHighlighted ? '#333' : 'white'}
                fontSize={6.5}
                fontWeight={isHighlighted ? 700 : 500}
                textAnchor="middle"
                x={arc.lx}
                y={arc.ly}
              >
                {arc.label}
              </text>
            </motion.g>
          );
        })}

        {/* Inner ring: categories */}
        {categoryArcs.map((arc) => {
          const isSelected = arc.id === selectedCategoryId;

          return (
            <motion.g
              key={arc.id}
              animate={{ scale: isSelected ? 1.02 : 1 }}
              className="cursor-pointer"
              style={{ transformOrigin: `${CX}px ${CY}px` }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => onSelectCategory(arc.id)}
            >
              <path
                d={arc.path}
                fill={arc.color}
                stroke="white"
                strokeWidth={1.5}
              />
              <text
                dominantBaseline="central"
                fill="white"
                fontSize={9}
                fontWeight={700}
                textAnchor="middle"
                x={arc.lx}
                y={arc.ly}
              >
                {arc.label}
              </text>
            </motion.g>
          );
        })}

        {/* Center circle */}
        <circle cx={CX} cy={CY} fill="white" r={INNER_R - 2} stroke="#E8E2D9" strokeWidth={1} />
        <text
          dominantBaseline="central"
          fill="#7B2D3A"
          fontSize={selectedCategoryId ? 10 : 12}
          fontWeight={700}
          textAnchor="middle"
          x={CX}
          y={CY}
        >
          {selectedAromaId
            ? '🔍'
            : selectedCategoryId
              ? AROMA_CATEGORIES.find((c) => c.id === selectedCategoryId)?.label ?? 'Aromas'
              : 'Aromas'}
        </text>
      </svg>
    </div>
  );
}
