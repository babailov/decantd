'use client';

import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Badge } from '@/common/components/Badge';
import { Card } from '@/common/components/Card';
import { OCCASIONS } from '@/common/constants/wine.const';
import { cn } from '@/common/functions/cn';
import { usePlanHistoryStore } from '@/common/stores/usePlanHistoryStore';

interface GuestPlansListProps {
  compact?: boolean;
}

export function GuestPlansList({ compact }: GuestPlansListProps) {
  const plans = usePlanHistoryStore((s) => s.plans);

  if (plans.length === 0) return null;

  return (
    <section className={compact ? 'pb-m' : 'px-m pb-l'}>
      <h2
        className={cn(
          'font-display text-primary mb-s',
          compact ? 'text-body-l font-medium' : 'text-heading-s',
        )}
      >
        Your Recent Plans
      </h2>
      <div className="space-y-xs">
        {plans.map((plan, i) => {
          const occasion = OCCASIONS.find((o) => o.value === plan.occasion);
          return (
            <motion.div
              key={plan.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link href={`/tasting/${plan.id}`}>
                <Card
                  className={cn(
                    'flex items-center gap-s hover:bg-surface transition-colors cursor-pointer',
                  )}
                  variant="outlined"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-body-l text-primary font-medium truncate">
                      {plan.title}
                    </p>
                    <div className="flex items-center gap-xs mt-1">
                      {occasion && (
                        <Badge variant="default">
                          {occasion.emoji} {occasion.label}
                        </Badge>
                      )}
                      <span className="text-body-xs text-text-muted">
                        {plan.wineCount} {plan.wineCount === 1 ? 'wine' : 'wines'}
                      </span>
                    </div>
                    <p className="text-body-xs text-text-muted mt-1">
                      {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
