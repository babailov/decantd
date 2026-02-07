import { Occasion } from '@/common/types/wine';

export const OCCASIONS: {
  value: Occasion;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: 'dinner_party',
    label: 'Dinner Party',
    description: 'Impress your guests with a curated selection',
    emoji: '🍽️',
  },
  {
    value: 'date_night',
    label: 'Date Night',
    description: 'Romantic wines for a special evening',
    emoji: '❤️',
  },
  {
    value: 'casual',
    label: 'Casual Hangout',
    description: 'Easy-drinking wines for a relaxed time',
    emoji: '😊',
  },
  {
    value: 'celebration',
    label: 'Celebration',
    description: 'Pop the bubbly and toast to something great',
    emoji: '🥂',
  },
  {
    value: 'educational',
    label: 'Wine Education',
    description: 'Learn about different varietals and regions',
    emoji: '📚',
  },
  {
    value: 'business',
    label: 'Business Dinner',
    description: 'Sophisticated selections for professional settings',
    emoji: '💼',
  },
];

export const POPULAR_REGIONS = [
  { value: 'france', label: 'France', flag: '🇫🇷' },
  { value: 'italy', label: 'Italy', flag: '🇮🇹' },
  { value: 'spain', label: 'Spain', flag: '🇪🇸' },
  { value: 'usa', label: 'USA', flag: '🇺🇸' },
  { value: 'argentina', label: 'Argentina', flag: '🇦🇷' },
  { value: 'chile', label: 'Chile', flag: '🇨🇱' },
  { value: 'australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'portugal', label: 'Portugal', flag: '🇵🇹' },
  { value: 'new_zealand', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'south_africa', label: 'South Africa', flag: '🇿🇦' },
  { value: 'austria', label: 'Austria', flag: '🇦🇹' },
];

export const BUDGET_PRESETS = [
  { label: '$10–20', min: 10, max: 20 },
  { label: '$20–40', min: 20, max: 40 },
  { label: '$40–80', min: 40, max: 80 },
  { label: '$80+', min: 80, max: 200 },
];

export const WINE_COUNT_MIN = 1;
export const WINE_COUNT_MAX = 8;
