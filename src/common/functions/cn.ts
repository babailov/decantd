import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

export const twMergeConfig = {
  extend: {
    classGroups: {
      fontSize: [
        'text-body-xl',
        'text-body-l',
        'text-body-m',
        'text-body-s',
        'text-body-xs',
        'text-heading-xl',
        'text-heading-l',
        'text-heading-m',
        'text-heading-s',
        'text-heading-xs',
      ],
      color: [
        'text-wine-dark',
        'text-wine-burgundy',
        'text-wine-sienna',
        'text-wine-wheat',
        'text-wine-goldenrod',
        'text-wine-gold',
        'text-wine-cream',
        'text-wine-parchment',
        'text-wine-charcoal',
        'text-text-primary',
        'text-text-secondary',
        'text-text-muted',
        'text-text-on-primary',
        'text-text-on-accent',
        'text-primary',
        'text-accent',
        'text-background',
        'text-surface',
        'text-success',
        'text-alert',
        'text-wine-rose',
        'text-wine-sparkling',
        'text-link',
      ],
    },
  },
} as Parameters<typeof extendTailwindMerge>[0];

const customTwMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
