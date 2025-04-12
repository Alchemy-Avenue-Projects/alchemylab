
export interface ProductBrief {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  target_locations: string;
  dos?: string[];
  donts?: string[];
}

export type Platform = 'Meta' | 'Google' | 'TikTok' | 'LinkedIn' | 'Pinterest' | 'Snapchat';

export type Angle = 'urgency' | 'curiosity' | 'social proof' | 'exclusivity' | 'affordability' | 'emotional' | 'relief';

export interface GenerateAdPayload {
  platform: Platform[];
  product: string;
  audience: string;
  location: string;
  language: string;
  angle?: Angle;
  cta: boolean;
  dos: string[];
  donts: string[];
}

export interface AdResult {
  platform: Platform;
  headline: string;
  body: string;
  primary_text?: string;
  description?: string;
}
