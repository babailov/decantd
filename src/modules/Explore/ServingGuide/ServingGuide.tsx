'use client';

import { ArrowLeft, GlassWater, Thermometer, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/common/components/Button';
import {
  DECANTING_ADVICE,
  GLASSWARE_RECOMMENDATIONS,
  SERVING_TEMPERATURES,
} from '@/common/constants/serving-guide.const';

import { GlasswareCard } from './GlasswareCard';
import { TemperatureCard } from './TemperatureCard';

export function ServingGuide() {
  return (
    <div className="max-w-md mx-auto px-s py-m">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-heading-l text-primary mb-2xs">
          Serving Guide
        </h1>
        <p className="text-body-m text-text-secondary mb-l">
          Temperature, glassware, and decanting — the details that make every wine shine.
        </p>
      </motion.div>

      {/* Temperature section */}
      <section className="mb-xl">
        <div className="flex items-center gap-xs mb-m">
          <Thermometer className="w-5 h-5 text-primary" />
          <h2 className="font-display text-heading-s text-text-primary">
            Serving Temperature
          </h2>
        </div>
        <div className="flex flex-col gap-s">
          {SERVING_TEMPERATURES.map((temp, i) => (
            <TemperatureCard key={temp.wineType} index={i} temp={temp} />
          ))}
        </div>
      </section>

      {/* Glassware section */}
      <section className="mb-xl">
        <div className="flex items-center gap-xs mb-m">
          <GlassWater className="w-5 h-5 text-primary" />
          <h2 className="font-display text-heading-s text-text-primary">
            Glassware
          </h2>
        </div>
        <div className="flex flex-col gap-s">
          {GLASSWARE_RECOMMENDATIONS.map((glass, i) => (
            <GlasswareCard key={glass.id} glass={glass} index={i} />
          ))}
        </div>
      </section>

      {/* Decanting section */}
      <section className="mb-l">
        <div className="flex items-center gap-xs mb-m">
          <Timer className="w-5 h-5 text-primary" />
          <h2 className="font-display text-heading-s text-text-primary">
            Decanting
          </h2>
        </div>
        <div className="flex flex-col gap-s">
          {DECANTING_ADVICE.map((advice, i) => (
            <motion.div
              key={advice.title}
              animate={{ opacity: 1, y: 0 }}
              className="p-m rounded-xl border border-border bg-surface-elevated"
              initial={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <h3 className="text-body-s font-medium text-text-primary mb-0.5">
                {advice.title}
              </h3>
              <p className="text-body-xs text-text-muted mb-xs">
                {advice.wines}
              </p>
              <p className="text-body-xs text-text-secondary">
                {advice.advice}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Link href="/explore">
        <Button className="w-full" variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Explore
        </Button>
      </Link>
    </div>
  );
}
