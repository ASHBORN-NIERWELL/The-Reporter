export interface PropertyImage {
  id: string;
  base64: string; 
  caption?: string;
  isCover: boolean;
}

export interface PropertyEval {
  id: string;
  name: string;
  price: string;
  location: string;
  rating: number; 
  isTopRecommendation: boolean;
  comments?: string; 
  pros?: string[];
  cons?: string[];
  images: PropertyImage[];
  imageHeight?: number; 
}

export interface PropertyEvalState extends PropertyEval {
  _showInsights: boolean;
  _prosRaw: string;
  _consRaw: string;
}

export interface EvalReport {
  clientName: string;
  accentColor: string;
  // --- NEW GLOBAL METADATA ---
  companyName: string;
  companyLogo: string | null;
  preparerName: string;
  contactInfo: string;
  // ---------------------------
  properties: PropertyEval[]; 
}