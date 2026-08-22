export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export type UserRoleType = 'super_admin' | 'admin' | 'scientific_editor' | 'premium_user' | 'standard_user';

export interface StoredUser {
  id?: number;
  name: string;
  email: string;
  role?: UserRoleType;
  token: string;
  is_active?: boolean;
}

export interface SecurityAuditLogItem {
  id: number;
  user_id: number | null;
  event_type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ip_address: string | null;
  user_agent: string | null;
  resource_target: string | null;
  description: string;
  payload: any;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface SystemSettingItem {
  id: number;
  key: string;
  group: string;
  value: string;
  type: string;
  description: string | null;
  is_public: boolean;
}

export interface AiClinicalCopilot {
  is_physical_applicator: boolean;
  format_type: 'LIQUID_SERUM' | 'CREAM_OR_BALM' | 'GEL_OR_LOTION' | 'CLEANSING_WIPES' | 'EXFOLIATING_PADS' | 'SHEET_MASK' | 'HYDROCOLLOID_PATCH' | 'SKINCARE_TOOL' | 'MISCELLANEOUS';
  friction_risk_level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  is_rinse_off_required: boolean;
  barrier_warning: string | null;
  plain_language_summary: string;
  contraindications: string[];
  quality_factors: string[];
  format_quality_score: number;
  when_to_use: string | null;
  how_to_use: string | null;
  superior_alternatives: string[];
  price_context?: {
    price: number | null;
    currency: string;
  };
  transparency_meta: {
    source_type: 'AI_GENERATED' | 'EXPERT_VERIFIED' | 'DATABASE_FLYWHEEL' | 'DETERMINISTIC_CACHE';
    source_label: string;
    confidence_score: number;
    total_community_lookups?: number;
  };
}

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
  ai_clinical_copilot: AiClinicalCopilot;
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

export async function auditInci(
  inciText: string,
  productName?: string,
  price?: number | null,
  currency: string = 'USD'
): Promise<AuditReport> {
  const endpoint = `${API_BASE_URL}/audit/inci`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inci_text: inciText,
      product_name: productName,
      price: price !== undefined ? price : null,
      currency: currency || 'USD',
    }),
  });

  if (!res.ok) {
    throw new Error('Error al auditar la fórmula');
  }

  const json = await res.json();
  return json.data;
}

export async function getProductAudit(slug: string): Promise<AuditReport> {
  const res = await fetch(`${API_BASE_URL}/audit/product/${slug}`);
  if (res.ok) {
    const json = await res.json();
    return json.data;
  }

  return auditInci('Aqua, Niacinamide, Zinc PCA', slug);
}

export async function getCatalogProducts() {
  const res = await fetch(`${API_BASE_URL}/catalog/products`);
  if (res.ok) return res.json();
  return { data: [] };
}

// User & Routine Storage Helpers
export function getCurrentUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('allabout_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: StoredUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('allabout_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('allabout_user');
  }
}

export function isUserAdmin(user: StoredUser | null): boolean {
  if (!user || !user.role) return false;
  return user.role === 'admin' || user.role === 'super_admin';
}

export function getSavedCustomProtocol() {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('allabout_saved_protocol');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setSavedCustomProtocol(protocol: any, diagnosisInput: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('allabout_saved_protocol', JSON.stringify({ protocol, diagnosisInput, savedAt: new Date().toISOString() }));
}

export function getStoredRoutineProducts() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('allabout_routine_products');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setStoredRoutineProducts(products: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('allabout_routine_products', JSON.stringify(products));
}

export interface RecentAuditItem {
  id: string;
  query: string;
  productName: string;
  brandName?: string | null;
  safetyScore: number;
  safetyRating: string;
  cleanIngredientsCount: number;
  totalIngredientsCount: number;
  formatType?: string;
  auditedAt: string;
  price?: number | null;
  currency?: string;
}

export function getRecentAudits(): RecentAuditItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('allabout_recent_audits');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecentAudit(item: RecentAuditItem) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentAudits();
    const filtered = current.filter(
      (a) => a.productName.toLowerCase() !== item.productName.toLowerCase() && a.query.toLowerCase() !== item.query.toLowerCase()
    );
    const updated = [item, ...filtered].slice(0, 10);
    localStorage.setItem('allabout_recent_audits', JSON.stringify(updated));
  } catch {}
}

export function clearRecentAudits() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('allabout_recent_audits');
}

export interface AuditFeedbackItem {
  id: string;
  productName: string;
  isHelpful: boolean;
  skinType?: string;
  timestamp: string;
}

export function getAuditFeedbackList(): AuditFeedbackItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('allabout_audit_feedback');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAuditFeedback(productName: string, isHelpful: boolean, skinType?: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getAuditFeedbackList();
    const newItem: AuditFeedbackItem = {
      id: 'fb_' + Date.now(),
      productName,
      isHelpful,
      skinType,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('allabout_audit_feedback', JSON.stringify([newItem, ...list].slice(0, 50)));
  } catch {}
}

export interface UserDailyRoutine {
  skinType: string;
  isDailyFixed: boolean;
  steps: Array<{
    stepNumber: number;
    stepName: string;
    productName: string;
    brand?: string;
    timing: 'AM' | 'PM' | 'BOTH';
  }>;
  updatedAt: string;
}

export function getSavedDailyRoutine(): UserDailyRoutine | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('allabout_daily_routine');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveDailyRoutine(routine: UserDailyRoutine) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('allabout_daily_routine', JSON.stringify(routine));
}

// Admin API Methods
function getAuthHeaders() {
  const user = getCurrentUser();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': user?.token ? `Bearer ${user.token}` : '',
  };
}

export async function fetchAdminUsers(params: { page?: number; search?: string; role?: string; status?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.search) query.append('search', params.search);
  if (params.role) query.append('role', params.role);
  if (params.status) query.append('status', params.status);

  const res = await fetch(`${API_BASE_URL}/admin/users?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('No se pudieron cargar los usuarios');
  return res.json();
}

export async function updateAdminUserRole(userId: number, role: UserRoleType) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Error al actualizar rol');
  }
  return res.json();
}

export async function toggleAdminUserStatus(userId: number) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Error al modificar estado');
  }
  return res.json();
}

export async function unlockAdminUser(userId: number) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/unlock`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al desbloquear cuenta');
  return res.json();
}

export async function fetchAdminSecurityLogs(params: { page?: number; severity?: string; event_type?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.severity) query.append('severity', params.severity);
  if (params.event_type) query.append('event_type', params.event_type);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/admin/security/logs?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al consultar logs de seguridad');
  return res.json();
}

export async function fetchAdminSecurityStats() {
  const res = await fetch(`${API_BASE_URL}/admin/security/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al consultar métricas de seguridad');
  return res.json();
}

export async function fetchAdminSystemSettings() {
  const res = await fetch(`${API_BASE_URL}/admin/settings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar configuraciones');
  return res.json();
}

export async function updateAdminSystemSettings(settings: Array<{ key: string; value: any; group?: string; type?: string; description?: string }>) {
  const res = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ settings }),
  });
  if (!res.ok) throw new Error('Error al guardar configuraciones');
  return res.json();
}

export async function fetchAdminSystemHealth() {
  const res = await fetch(`${API_BASE_URL}/admin/settings/health`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al consultar estado de salud del sistema');
  return res.json();
}

// AI Skincare Endpoints
export async function fetchAiDiagnosis(params: {
  inci_text: string;
  skin_type?: string;
  concerns?: string[];
  product_name?: string;
}) {
  const res = await fetch('/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Error al obtener diagnóstico de IA');
  const json = await res.json();
  return json.data;
}

export async function sendCopilotMessage(params: {
  question: string;
  inci_text: string;
  product_name?: string;
  skin_type?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const res = await fetch('/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'chat', ...params }),
  });
  if (!res.ok) throw new Error('Error al consultar al copiloto');
  const json = await res.json();
  return json.data;
}

export async function scanImageWithGeminiVision(base64Image: string, mimeType: string = 'image/jpeg') {
  const res = await fetch('/api/ai/scan-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mimeType }),
  });
  if (!res.ok) throw new Error('Error al analizar imagen con IA');
  const json = await res.json();
  return json.data;
}

export async function auditFullRoutineAi(products: any[], skinType: string = 'COMBINATION') {
  const res = await fetch('/api/ai/routine-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products, skin_type: skinType }),
  });
  if (!res.ok) throw new Error('Error al auditar rutina completa');
  const json = await res.json();
  return json.data;
}

