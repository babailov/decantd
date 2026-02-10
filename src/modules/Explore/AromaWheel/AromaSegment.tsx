'use client';

import { motion } from 'motion/react';

import { cn } from '@/common/functions/cn';

interface AromaSegmentProps {
  path: string;
  color: string;
  label: string;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: () => void;
  labelX: number;
  labelY: number;
  labelRotation?: number;
  fontSize?: number;
}

export function AromaSegment({
  path,
  color,
  label,
  isHighlighted,
  isDimmed,
  onClick,
  labelX,
  labelY,
  labelRotation = 0,
  fontSize = 8,
}: AromaSegmentProps) {
  return (
    <motion.g
      animate={{
        opacity: isDimmed ? 0.25 : 1,
        scale: isHighlighted ? 1.02 : 1,
      }}
      className="cursor-pointer"
      style={{ transformOrigin: 'center' }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <path
        d={path}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
      <text
        dominantBaseline="central"
        fill="white"
        fontSize={fontSize}
        fontWeight={isHighlighted ? 600 : 400}
        textAnchor="middle"
        transform={`translate(${labelX}, ${labelY}) rotate(${labelRotation})`}
      >
        {label}
      </text>
    </motion.g>
  );
}
