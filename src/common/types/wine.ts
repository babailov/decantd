export type WineType = 'red' | 'white' | 'rose' | 'sparkling';

export type Occasion =
  | 'dinner_party'
  | 'date_night'
  | 'casual'
  | 'celebration'
  | 'educational'
  | 'business';

export interface FlavorProfile {
  acidity: number;
  tannin: number;
  sweetness: number;
  alcohol: number;
  body: number;
}

export interface WineRecommendation {
  id: string;
  varietal: string;
  region: string;
  subRegion?: string;
  yearRange?: string;
  wineType: WineType;
  description: string;
  pairingRationale: string;
  flavorNotes: string[];
  flavorProfile: FlavorProfile;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  tastingOrder: number;
}
