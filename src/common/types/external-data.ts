export type SourceType = 'license' | 'partner' | 'public';

export type LicenseType =
  | 'paid'
  | 'permissioned'
  | 'public_domain'
  | 'owned';

export type TrustTier = 'A' | 'B' | 'C';

export type SubmissionType =
  | 'venue_wine_list'
  | 'market_listing'
  | 'pairing_note';

export interface SourceRecord {
  id: string;
  name: string;
  sourceType: SourceType;
  licenseType: LicenseType;
  trustTier: TrustTier;
  updateCadence?: string;
  accessNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VenueWineListRecordInput {
  wineCanonicalId?: string;
  venueName: string;
  city: string;
  neighborhood?: string;
  servingFormat: 'glass' | 'bottle';
  currency?: string;
  price: number;
  available?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  rawWineName: string;
  rawProducerName?: string;
  rawVintage?: number;
}

export interface MarketListingRecordInput {
  wineCanonicalId?: string;
  merchantName: string;
  locationText?: string;
  channel: 'retail' | 'restaurant' | 'distributor' | 'agent';
  currency?: string;
  price: number;
  inStock?: boolean;
  stockWindowStart?: string;
  stockWindowEnd?: string;
  listingUrl?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  confidenceScore?: number;
  rawWineName: string;
  rawProducerName?: string;
  rawVintage?: number;
}

export interface PairingKnowledgeRecordInput {
  wineCanonicalId?: string;
  dishName: string;
  cuisineType?: string;
  dishAttributes?: string[];
  rationale: string;
  evidenceLevel?: 'practitioner' | 'editorial' | 'reference';
  authorLabel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}
