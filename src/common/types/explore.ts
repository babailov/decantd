// Guided Tasting
export type GuidedTastingStep = 'look' | 'smell' | 'taste' | 'think';

export type WineTypeContext = 'red' | 'white' | 'rose' | 'sparkling';

export type ColorDepth = 'pale' | 'medium' | 'deep';
export type Clarity = 'clear' | 'hazy' | 'cloudy';
export type FinishLength = 'short' | 'medium' | 'long';

export interface LookObservation {
  wineType: WineTypeContext | null;
  colorDepth: ColorDepth | null;
  clarity: Clarity | null;
  viscosityNoted: boolean;
}

export interface SmellObservation {
  selectedAromas: string[];
}

export interface TasteObservation {
  acidity: number;
  tannin: number;
  sweetness: number;
  alcohol: number;
  body: number;
}

export interface ThinkObservation {
  balance: number;
  complexity: number;
  finishLength: FinishLength | null;
  wouldDrinkAgain: boolean | null;
  notes: string;
}

// Aroma Wheel
export interface Aroma {
  id: string;
  label: string;
  description: string;
  commonIn: string[];
}

export interface AromaSubcategory {
  id: string;
  label: string;
  aromas: Aroma[];
}

export interface AromaCategory {
  id: string;
  label: string;
  color: string;
  subcategories: AromaSubcategory[];
}

// Serving Guide
export interface ServingTemperature {
  wineType: string;
  label: string;
  tempMinF: number;
  tempMaxF: number;
  tempMinC: number;
  tempMaxC: number;
  tip: string;
  color: string;
}

export interface GlasswareRecommendation {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
  whyItMatters: string;
  image?: string;
}
