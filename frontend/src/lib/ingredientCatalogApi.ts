import { API_BASE_URL, apiFetch } from './api';

export interface CatalogIngredient {
  id: number;
  inci_name: string;
  common_name: string | null;
  description: string | null;
  recommended_timing: 'AM' | 'PM' | 'BOTH' | null;
  is_active: boolean;
  is_uv_sensitizing: boolean;
  requires_sunscreen: boolean;
  evidence_level: string | null;
  evidence_grade_description: string | null;
  source_name: string | null;
  source_url: string | null;
  indications: Array<{ id: number; name?: string; slug?: string }>;
  pubmed_studies: Array<{ id: number; title?: string; journal?: string; year?: number; pmid?: string }>;
}

export interface IngredientPage {
  data: CatalogIngredient[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface IngredientQuery {
  q?: string;
  timing?: 'AM' | 'PM' | '';
  evidence_level?: string;
  page?: number;
}

export async function fetchIngredientsStrict(query: IngredientQuery): Promise<IngredientPage> {
  const params = new URLSearchParams({ per_page: '12', page: String(query.page ?? 1) });
  if (query.q?.trim()) params.set('q', query.q.trim());
  if (query.timing) params.set('timing', query.timing);
  if (query.evidence_level) params.set('evidence_level', query.evidence_level);
  return apiFetch<IngredientPage>(`${API_BASE_URL}/catalog/ingredients?${params.toString()}`, { cache: 'no-store' });
}
