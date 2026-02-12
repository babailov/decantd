'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useState } from 'react';

import { Button } from '@/common/components/Button';

interface ShowMoreListProps<T> {
  items: T[];
  previewCount?: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
}

export function ShowMoreList<T>({
  items,
  previewCount = 3,
  renderItem,
  keyExtractor,
}: ShowMoreListProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > previewCount;
  const visibleItems = expanded ? items : items.slice(0, previewCount);

  return (
    <div className="flex flex-col gap-s">
      {visibleItems.slice(0, previewCount).map((item, i) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, i)}
        </div>
      ))}

      <AnimatePresence initial={false}>
        {expanded && items.slice(previewCount).map((item, i) => (
          <motion.div
            key={keyExtractor(item)}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
          >
            {renderItem(item, previewCount + i)}
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <Button
          className="self-center gap-1"
          size="sm"
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show all {items.length} <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
}
