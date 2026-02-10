import type { WineTypeContext } from '@/common/types/explore';

export const WINE_TYPE_OPTIONS: {
  value: WineTypeContext;
  label: string;
  emoji: string;
}[] = [
  { value: 'red', label: 'Red', emoji: '🍷' },
  { value: 'white', label: 'White', emoji: '🥂' },
  { value: 'rose', label: 'Rosé', emoji: '🌸' },
  { value: 'sparkling', label: 'Sparkling', emoji: '✨' },
];

export const COLOR_DEPTH_OPTIONS = {
  red: [
    { value: 'pale' as const, label: 'Pale', description: 'Light ruby, almost translucent. Think Pinot Noir.', gradient: 'from-red-200 to-red-300' },
    { value: 'medium' as const, label: 'Medium', description: 'Bright ruby to garnet. Think Merlot or Sangiovese.', gradient: 'from-red-400 to-red-600' },
    { value: 'deep' as const, label: 'Deep', description: 'Dark purple, nearly opaque. Think Cabernet or Malbec.', gradient: 'from-red-700 to-red-900' },
  ],
  white: [
    { value: 'pale' as const, label: 'Pale', description: 'Almost clear with a hint of green. Think Pinot Grigio.', gradient: 'from-yellow-50 to-yellow-100' },
    { value: 'medium' as const, label: 'Medium', description: 'Straw to light gold. Think Sauvignon Blanc.', gradient: 'from-yellow-100 to-yellow-300' },
    { value: 'deep' as const, label: 'Deep', description: 'Golden to amber. Think oaked Chardonnay.', gradient: 'from-yellow-300 to-amber-400' },
  ],
  rose: [
    { value: 'pale' as const, label: 'Pale', description: 'Barely pink, almost salmon. Think Provence rosé.', gradient: 'from-pink-50 to-pink-100' },
    { value: 'medium' as const, label: 'Medium', description: 'Bright pink. Think Grenache rosé.', gradient: 'from-pink-200 to-pink-300' },
    { value: 'deep' as const, label: 'Deep', description: 'Vivid magenta to cherry. Think Tavel rosé.', gradient: 'from-pink-400 to-pink-600' },
  ],
  sparkling: [
    { value: 'pale' as const, label: 'Pale', description: 'Light straw with green hints. Think Prosecco.', gradient: 'from-yellow-50 to-lime-50' },
    { value: 'medium' as const, label: 'Medium', description: 'Golden straw. Think Champagne.', gradient: 'from-yellow-100 to-yellow-200' },
    { value: 'deep' as const, label: 'Deep', description: 'Rich gold. Think vintage Champagne.', gradient: 'from-yellow-300 to-amber-300' },
  ],
};

export const CLARITY_OPTIONS = [
  { value: 'clear' as const, label: 'Clear', description: 'Brilliant and transparent — you can see through it easily. Most wines are clear.' },
  { value: 'hazy' as const, label: 'Hazy', description: 'Slightly cloudy — common in natural or unfiltered wines. Not a flaw.' },
  { value: 'cloudy' as const, label: 'Cloudy', description: 'Opaque cloudiness — may indicate a fault, or could be intentional (pet-nat, etc.).' },
];

export const VISCOSITY_EDUCATION = {
  title: 'Wine Legs (Viscosity)',
  description: 'Swirl the glass and watch the "legs" or "tears" drip down. Thicker, slower legs usually mean higher alcohol or residual sugar. This is caused by the Gibbs-Marangoni effect — not a quality indicator, just physics!',
};

export const DIMENSION_EDUCATION: Record<string, { label: string; low: string; high: string; description: string }> = {
  acidity: {
    label: 'Acidity',
    low: 'Flat, soft',
    high: 'Tart, crisp',
    description: 'Makes your mouth water. High acidity feels fresh and zesty (like lemon). Low acidity feels smooth and round.',
  },
  tannin: {
    label: 'Tannin',
    low: 'Smooth',
    high: 'Grippy, drying',
    description: 'That drying sensation on your gums. Comes from grape skins, seeds, and oak. Mostly in red wines.',
  },
  sweetness: {
    label: 'Sweetness',
    low: 'Bone dry',
    high: 'Sweet',
    description: 'Residual sugar left after fermentation. Most wines are dry (0-4g/L). Off-dry starts to taste slightly sweet.',
  },
  alcohol: {
    label: 'Alcohol',
    low: 'Light (< 11%)',
    high: 'Hot (> 14%)',
    description: 'Felt as warmth in your throat and chest. Higher alcohol gives more body and viscosity.',
  },
  body: {
    label: 'Body',
    low: 'Light (like water)',
    high: 'Full (like cream)',
    description: 'The overall weight and texture on your palate. Think skim milk vs. whole milk vs. cream.',
  },
};

export const FINISH_LENGTH_OPTIONS = [
  { value: 'short' as const, label: 'Short', description: 'Flavor fades quickly (< 5 seconds)' },
  { value: 'medium' as const, label: 'Medium', description: 'Lingers pleasantly (5-10 seconds)' },
  { value: 'long' as const, label: 'Long', description: 'Flavor persists and evolves (10+ seconds)' },
];
