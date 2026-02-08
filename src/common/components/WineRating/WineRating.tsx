'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { queryKeys } from '@/common/constants/queryKeys';
import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

interface WineRatingProps {
  planWineId: string;
  planId: string;
  existingRating?: {
    rating: number;
    tastingNotes: string | null;
  } | null;
}

export function WineRating({ planWineId, planId, existingRating }: WineRatingProps) {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [notes, setNotes] = useState(existingRating?.tastingNotes || '');
  const [isExpanded, setIsExpanded] = useState(!!existingRating);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { rating: number; tastingNotes?: string }) => {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planWineId,
          planId,
          ...data,
          tried: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to save rating');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Rating saved!');
      queryClient.invalidateQueries({ queryKey: queryKeys.user.ratingsForPlan(planId) });
    },
    onError: () => {
      toast.error('Failed to save rating');
    },
  });

  if (!isAuthenticated()) return null;

  const handleStarClick = (star: number) => {
    setRating(star);
    setIsExpanded(true);
    mutation.mutate({ rating: star, tastingNotes: notes || undefined });
  };

  const handleNotesBlur = () => {
    if (rating > 0) {
      mutation.mutate({ rating, tastingNotes: notes || undefined });
    }
  };

  return (
    <div className="mt-s pt-s border-t border-border">
      <div className="flex items-center gap-xs">
        <span className="text-body-s text-text-secondary font-medium">
          Your rating
        </span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="p-0.5 transition-transform hover:scale-110"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-colors',
                  (hoveredStar || rating) >= star
                    ? 'fill-accent text-accent'
                    : 'text-border',
                )}
              />
            </button>
          ))}
        </div>
        {mutation.isPending && (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-xs">
          <textarea
            className={cn(
              'w-full rounded-xl border border-border bg-surface-elevated px-s py-xs text-body-s text-text-primary',
              'placeholder:text-text-muted resize-none',
              'focus:border-primary focus:outline-none',
            )}
            placeholder="Add tasting notes..."
            rows={2}
            value={notes}
            onBlur={handleNotesBlur}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
