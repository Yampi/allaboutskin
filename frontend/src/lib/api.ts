export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface AuditReport {
  meta: {
    product_name: string;
    brand_name: string | null;
    total_ingredients_count: number;
    active_ingredients_count: number;
    unmatched_tokens_count: number;
    unmatched_tokens: string[];
    audited_at: string;
  };
  clinical_indications: Array<{
    name: string;
    slug: string;
    description: string;
    highest_evidence_level: 'A' | 'B' | 'C' | 'D';
    supporting_actives: Array<{
      inci_name: string;
      common_name: string | null;
      evidence_level: string;
      mechanism: string;
    }>;
  }>;
  scientific_evidence: {
    overall_evidence_grade: 'A' | 'B' | 'C' | 'D';
    evidence_grade_label: string;
    total_referenced_studies: number;
    studies: Array<{
      pmid: string;
      title: string;
      journal: string;
      pub_year: number;
      study_type: string;
      evidence_grade: string;
      pubmed_url: string;
      associated_active: string;
    }>;
  };
  layering_and_usage: {
    recommended_timing: 'AM' | 'PM' | 'BOTH';
    timing_rationale: string;
    requires_sunscreen: boolean;
    sunscreen_rationale: string;
    layering_step_order: number;
    layering_rule: string;
  };
  results_timeline: {
    min_weeks: number;
    max_weeks: number;
    primary_driver: string;
    milestones?: Record<string, string>;
  };
  chemical_conflicts: Array<{
    ingredient_a: string;
    ingredient_b: string;
    conflict_type: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    warning_message: string;
    clinical_rationale: string;
    mitigation_strategy: string;
  }>;
  safety_and_skin_tolerance: {
    max_comedogenic_score: number;
    max_irritation_score: number;
    is_non_comedogenic_certified: boolean;
    flagged_comedogenic_ingredients: Array<{ inci_name: string; rating: number }>;
    flagged_irritant_ingredients: Array<{ inci_name: string; rating: number }>;
  };
  ingredients_breakdown: Array<{
    inci_name: string;
    common_name: string | null;
    cas_number: string | null;
    is_active: boolean;
    cosing_functions: string[];
    comedogenic_rating: number;
    irritation_rating: number;
    optimal_ph_range: string | null;
    position: number;
    match_confidence: number;
  }>;
}

export async function auditInci(inciText: string, productName?: string): Promise<AuditReport> {
  try {
    const res = await fetch(`${API_BASE_URL}/audit/inci`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inci_text: inciText, product_name: productName }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    // If external Laravel API is not reachable, fallback to internal Next.js API route on Vercel
  }

  const fallbackRes = await fetch('/api/audit/inci', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inci_text: inciText, product_name: productName }),
  });

  if (!fallbackRes.ok) {
    throw new Error('Error al auditar la fórmula');
  }

  const fallbackJson = await fallbackRes.json();
  return fallbackJson.data;
}

export async function getProductAudit(slug: string): Promise<AuditReport> {
  const res = await fetch(`${API_BASE_URL}/audit/product/${slug}`);
  if (!res.ok) {
    throw new Error('Error al consultar producto');
  }
  const json = await res.json();
  return json.data;
}

export async function getCatalogProducts() {
  const res = await fetch(`${API_BASE_URL}/catalog/products`);
  if (!res.ok) return { data: [] };
  return res.json();
}
