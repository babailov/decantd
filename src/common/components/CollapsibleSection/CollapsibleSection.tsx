'use client';

import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useState } from 'react';

import { cn } from '@/common/functions/cn';

interface CollapsibleSectionProps {
  icon: LucideIcon;
  title: string;
  count: number;
  defaultOpen?: boolean;
  emptyMessage?: ReactNode;
  children: ReactNode;
}

export function CollapsibleSection({
  icon: Icon,
  title,
  count,
  defaultOpen = false,
  emptyMessage,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isEmpty = count === 0;

  return (
    <Collapsible.Root open={open && !isEmpty} onOpenChange={isEmpty ? undefined : setOpen}>
      <Collapsible.Trigger asChild>
        <button
          className={cn(
            'flex w-full items-center gap-xs p-s rounded-xl transition-colors',
            isEmpty
              ? 'cursor-default opacity-60'
              : 'hover:bg-surface active:bg-surface cursor-pointer',
          )}
          disabled={isEmpty}
          type="button"
        >
          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="font-display text-heading-s text-text-primary flex-1 text-left">
            {title}
          </span>
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full px-xs py-0.5 text-body-xs font-medium min-w-[1.5rem]',
              isEmpty
                ? 'bg-surface text-text-muted'
                : 'bg-primary/10 text-primary',
            )}
          >
            {count}
          </span>
          {!isEmpty && (
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-5 w-5 text-text-muted" />
            </motion.span>
          )}
        </button>
      </Collapsible.Trigger>

      {isEmpty && emptyMessage && (
        <p className="text-body-s text-text-muted px-s pb-xs">
          {emptyMessage}
        </p>
      )}

      <AnimatePresence initial={false}>
        {open && !isEmpty && (
          <Collapsible.Content asChild forceMount>
            <motion.div
              animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="px-s pb-s pt-xs">
                {children}
              </div>
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible.Root>
  );
}
