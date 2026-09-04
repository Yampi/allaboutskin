export interface StoreBranchInfo {
  id: number;
  name: string;
  slug: string;
  store_name: string;
  store_type: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  is_independent: boolean;
  state: string;
  city: string;
  address: string;
  reference_point?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram_handle?: string | null;
  opening_hours?: string | null;
  latitude: number;
  longitude: number;
  distance_meters: number;
  geofence_radius_meters: number;
  is_inside: boolean;
}

export interface NearbyStoresResponse {
  status: string;
  is_inside_store: boolean;
  current_store: StoreBranchInfo | null;
  in_store_catalog_count: number;
  nearby_branches_count: number;
  nearby_branches: StoreBranchInfo[];
}

export interface InStoreProduct {
  offer_id: number;
  product_id: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  volume_amount: number;
  volume_unit: string;
  barcode_ean: string | null;
  price_usd: number;
  price_ves: number | null;
  in_stock: boolean;
  scientific_score: number;
  badge: string;
  safety_label: string;
  highlights: string[];
  ingredients_count: number;
}

export interface BranchProductsResponse {
  status: string;
  branch: StoreBranchInfo;
  filters: {
    skin_type: string;
  };
  products_count: number;
  products: InStoreProduct[];
}

export interface StoreSuggestionInput {
  store_name: string;
  category: 'PHARMACY' | 'SUPERMARKET' | 'BEAUTY_SHOP' | 'INDEPENDENT' | 'OTHER';
  state: string;
  city: string;
  address: string;
  reference_point?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  instagram_handle?: string;
  submitted_by_email?: string;
  notes?: string;
}
