export interface StoreBranchInfo {
  id: number;
  name: string;
  slug: string;
  store_id?: number;
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
  country_code?: string;
  country_name?: string;
  country_flag?: string;
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
  price_local?: number | null;
  currency_local?: string | null;
  formatted_price_usd?: string | null;
  formatted_price_local?: string | null;
  store_country_code?: string | null;
  store_country_name?: string | null;
  store_country_flag?: string | null;
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

export interface StoreRoutineProductComparison {
  product_id: number;
  product_name: string;
  category: string;
  brand: string | null;
  is_available_nearby: boolean;
  closest_store: {
    branch_id: number;
    branch_name: string;
    store_name: string;
    distance_meters: number;
    price_usd: number;
    price_ves: number;
    product_url?: string;
    phone?: string;
    whatsapp?: string;
    latitude: number;
    longitude: number;
    opening_hours?: string;
  } | null;
  best_price_store: {
    branch_id: number;
    branch_name: string;
    store_name: string;
    distance_meters: number;
    price_usd: number;
    price_ves: number;
    product_url?: string;
    phone?: string;
    whatsapp?: string;
    latitude: number;
    longitude: number;
    opening_hours?: string;
  } | null;
  savings_usd: number;
  available_stores_count: number;
}

export interface RoutineOptimizationResponse {
  status: string;
  user_location: {
    lat: number;
    lng: number;
    radius_meters: number;
  };
  total_routine_products: number;
  recommended_single_trip_store: {
    branch: StoreBranchInfo;
    products_available_count: number;
    total_usd: number;
    total_ves: number;
    items: Array<{
      product_id: number;
      product_name: string;
      price_usd: number;
      price_ves: number;
    }>;
  } | null;
  products_comparison: StoreRoutineProductComparison[];
  all_nearby_baskets: any[];
}
