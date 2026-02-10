'use client';

import { motion } from 'motion/react';

import type { ServingTemperature } from '@/common/types/explore';

interface TemperatureCardProps {
  temp: ServingTemperature;
  index: number;
}

export function TemperatureCard({ temp, index }: TemperatureCardProps) {
  // Compute thermometer fill percentage (range 40-65°F mapped to 0-100%)
  const fillPercent = ((temp.tempMaxF - 38) / (68 - 38)) * 100;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="p-m rounded-xl border border-border bg-surface-elevated"
      initial={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
    >
      <div className="flex gap-s">
        {/* Mini thermometer */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-4 h-20 rounded-full bg-border relative overflow-hidden">
            <motion.div
              animate={{ height: `${fillPercent}%` }}
              className="absolute bottom-0 left-0 right-0 rounded-full"
              initial={{ height: 0 }}
              style={{ backgroundColor: temp.color }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            />
          </div>
          <div
            className="w-6 h-6 rounded-full -mt-1"
            style={{ backgroundColor: temp.color }}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-body-s font-medium text-text-primary">
            {temp.wineType}
          </h3>
          <p className="text-body-xs text-text-muted mb-xs">
            {temp.label}
          </p>
          <div className="flex items-center gap-xs mb-xs">
            <span
              className="inline-flex items-center rounded-full px-xs py-0.5 text-body-xs font-medium border"
              style={{
                backgroundColor: temp.color + '15',
                color: temp.color,
                borderColor: temp.color + '30',
              }}
            >
              {temp.tempMinF}–{temp.tempMaxF}°F
            </span>
            <span className="text-body-xs text-text-muted">
              ({temp.tempMinC}–{temp.tempMaxC}°C)
            </span>
          </div>
          <p className="text-body-xs text-text-secondary">
            {temp.tip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
