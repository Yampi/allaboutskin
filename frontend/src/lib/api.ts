export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

import {
  apiCircuitBreaker,
  ApiError,
  CircuitBreakerError,
} from './circuitBreaker';

export { apiCircuitBreaker, ApiError, CircuitBreakerError };
export type { CircuitState, ApiErrorState, ApiErrorCode } from './circuitBreaker';

/**
 * Robust fetch wrapper integrated with SRE Circuit Breaker.
 * Enforces timeouts, tracks failures, and fails fast when circuit is OPEN.
 */
export async function apiFetch<T = any>(
  url: string,
  init?: RequestInit,
  timeoutMs?: number
): Promise<T> {
  return apiCircuitBreaker.execute(async () => {
    const res = await fetch(url, init);
    if (!res.ok) {
      let errorData: any = {};
      try {
        errorData = await res.json();
      } catch {
        // Body is not JSON
      }
      const message =
        errorData?.message ||
        `HTTP ${res.status}: ${res.statusText || 'Error en petición al servidor'}`;
      const code =
        res.status === 401 || res.status === 403
          ? 'UNAUTHORIZED'
          : res.status === 404
          ? 'NOT_FOUND'
          : res.status === 422
          ? 'VALIDATION_ERROR'
          : res.status === 429
          ? 'RATE_LIMITED'
          : res.status >= 500
          ? 'BACKEND_DOWN'
          : 'UNKNOWN';
      const retryAfter = res.headers.get('Retry-After');
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
      throw new ApiError(message, code, res.status, retryAfterSeconds);
    }
    return await res.json();
  }, timeoutMs);
}


export type UserRoleType = 'super_admin' | 'admin' | 'scientific_editor' | 'business_owner' | 'premium_user' | 'standard_user';

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
    unmatched_suggestions?: Array<{ raw_token: string; suggested_inci_name: string; confidence: number }>;
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
    overall_evidence_grade: 'A' | 'B' | 'C' | 'D' | null;
    evidence_grade_label: string;
    by_ingredient?: Array<{
      inci_name: string;
      common_name: string | null;
      studies_count: number;
      evidence_grade: 'A' | 'B' | 'C' | 'D' | null;
    }>;
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

  const json = await apiFetch<{ data: AuditReport }>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inci_text: inciText,
      product_name: productName,
      price: price !== undefined ? price : null,
      currency: currency || 'USD',
    }),
  });

  return json.data;
}

export async function getProductAudit(slug: string): Promise<AuditReport> {
  const json = await apiFetch<{ data: AuditReport }>(`${API_BASE_URL}/audit/product/${slug}`);
  return json.data;
}

export async function getCatalogProducts() {
  return apiFetch(`${API_BASE_URL}/catalog/products`);
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

export function isUserBusiness(user: StoredUser | null): boolean {
  if (!user || !user.role) return false;
  return user.role === 'business_owner' || user.role === 'admin' || user.role === 'super_admin';
}

export async function loginUser(email: string, password: string): Promise<StoredUser> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Credenciales incorrectas o error al iniciar sesión');
  }

  const json = await res.json();
  const userData = json.user;
  const storedUser: StoredUser = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    is_active: userData.is_active,
    token: json.access_token,
  };

  setCurrentUser(storedUser);
  return storedUser;
}

export async function registerUser(name: string, email: string, password: string): Promise<StoredUser> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Error al crear la cuenta. Verifica los datos introducidos.');
  }

  const json = await res.json();
  const userData = json.user;
  const storedUser: StoredUser = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role || 'standard_user',
    is_active: userData.is_active ?? true,
    token: json.access_token,
  };

  setCurrentUser(storedUser);
  return storedUser;
}


export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.error('Error during logout:', err);
  } finally {
    setCurrentUser(null);
  }
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

export interface SkinProfileData {
  id?: number;
  user_id?: number;
  skin_type: 'OILY' | 'DRY' | 'COMBINATION' | 'NORMAL' | 'SENSITIVE';
  fitzpatrick_type?: number | null;
  barrier_status: 'HEALTHY' | 'COMPROMISED' | 'ACUTELY_DAMAGED';
  active_conditions?: string[];
  known_allergens?: string[];
  sun_exposure_level?: 'LOW' | 'MODERATE' | 'HIGH';
  pregnancy_or_nursing?: boolean;
}

export async function fetchUserProfile(): Promise<{ status: string; data: SkinProfileData } | null> {
  const user = getCurrentUser();
  if (!user?.token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Error al obtener perfil dermatológico:', err);
    return null;
  }
}

export async function updateUserProfile(data: Partial<SkinProfileData>): Promise<{ status: string; data: SkinProfileData; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar perfil de piel');
  }
  return await res.json();
}

export async function fetchUserTodayRoutine(date?: string) {
  const user = getCurrentUser();
  if (!user?.token) return null;
  try {
    const url = date ? `${API_BASE_URL}/routine/today?date=${date}` : `${API_BASE_URL}/routine/today`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Error al obtener rutina del día:', err);
    return null;
  }
}

export async function addUserRoutineItem(data: {
  product_id?: number;
  custom_name?: string;
  slot: 'AM' | 'PM';
  cycle_type: 'EVERYDAY' | 'EXFOLIATION_NIGHT' | 'RETINOID_NIGHT' | 'RECOVERY_NIGHT' | 'SPECIFIC_DAYS';
  step_order?: number;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/routine/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al agregar producto a la rutina');
  }
  return await res.json();
}

export async function deleteUserRoutineItem(id: number) {
  const res = await fetch(`${API_BASE_URL}/routine/items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar producto');
  }
  return await res.json();
}

export async function logUserRoutineAdherence(data: {
  slot: 'AM' | 'PM';
  skin_feeling_rating?: number;
  photo_url?: string;
  notes?: string;
  date?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/routine/log`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar cumplimiento de rutina');
  }
  return await res.json();
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
export function getAuthHeaders() {
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

// Admin Store Management Endpoints
export interface AdminStoreItem {
  id: number;
  owner_id: number | null;
  name: string;
  slug: string;
  website_url?: string | null;
  logo_url?: string | null;
  store_type: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  country_code: string;
  country_name?: string;
  country_flag?: string;
  instagram_handle?: string | null;
  whatsapp_contact?: string | null;
  contact_phone?: string | null;
  is_independent: boolean;
  verification_status: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  subscription_tier: 'FREE' | 'PRO_LOCAL' | 'ENTERPRISE';
  subscription_expires_at?: string | null;
  is_featured: boolean;
  verified_at?: string | null;
  rejected_reason?: string | null;
  submitted_by_email?: string | null;
  community_notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branches_count?: number;
  product_offers_count?: number;
  lead_interactions_count?: number;
  owner?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  branches?: Array<{
    id: number;
    name: string;
    city: string;
    state: string;
    is_active: boolean;
    slug: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
  }>;
  crawler_platform?: string;
  product_offers?: Array<{
    id: number;
    price: number;
    price_usd: number;
    price_local?: number;
    currency_local?: string;
    formatted_price_usd?: string;
    formatted_price_local?: string;
    in_stock: boolean;
    product_url?: string;
    product?: {
      id: number;
      name: string;
      slug: string;
      image_url?: string;
      category?: string;
      volume_amount?: number;
      volume_unit?: string;
      barcode_ean?: string;
      brand?: {
        id: number;
        name: string;
      };
    };
  }>;
  productOffers?: any[];
}

export interface AdminStoresResponse {
  status: string;
  summary: {
    pending_review: number;
    total_verified: number;
    total_stores: number;
    by_country?: Record<string, number>;
  };
  stores: {
    current_page: number;
    data: AdminStoreItem[];
    last_page: number;
    total: number;
  };
}

export async function fetchAdminStores(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  verification_status?: string;
  subscription_tier?: string;
  country_code?: string;
}): Promise<AdminStoresResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.per_page) query.append('per_page', params.per_page.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.verification_status) query.append('verification_status', params.verification_status);
  if (params?.subscription_tier) query.append('subscription_tier', params.subscription_tier);
  if (params?.country_code) query.append('country_code', params.country_code);

  const res = await fetch(`${API_BASE_URL}/admin/stores?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar tiendas');
  return res.json();
}

export async function fetchAdminStoreDetail(id: number, search?: string): Promise<{ status: string; store: AdminStoreItem }> {
  const url = search 
    ? `${API_BASE_URL}/admin/stores/${id}?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/admin/stores/${id}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar detalle de tienda');
  return res.json();
}

export async function fetchPublicStores(params?: {
  country?: string;
  search?: string;
}): Promise<{ status: string; total_stores: number; stores: any[] }> {
  const query = new URLSearchParams();
  if (params?.country) query.append('country', params.country);
  if (params?.search) query.append('search', params.search);
  const res = await fetch(`${API_BASE_URL}/stores?${query.toString()}`);
  if (!res.ok) throw new Error('Error al obtener tiendas públicas');
  return res.json();
}

export async function fetchPublicStoreDetail(
  identifier: string | number,
  params?: { search?: string; in_stock_only?: boolean; limit?: number }
): Promise<{ status: string; store: any; products: any[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.in_stock_only) query.append('in_stock_only', '1');
  if (params?.limit) query.append('limit', String(params.limit));
  const res = await fetch(`${API_BASE_URL}/stores/${identifier}?${query.toString()}`);
  if (!res.ok) throw new Error('Error al obtener detalle de la tienda');
  return res.json();
}

export async function updateAdminStoreVerification(id: number, data: {
  verification_status: 'VERIFIED' | 'REJECTED' | 'PENDING_REVIEW';
  rejected_reason?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/admin/stores/${id}/verification`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar verificación de tienda');
  return res.json();
}

export async function updateAdminStoreSubscription(id: number, data: {
  subscription_tier: 'FREE' | 'PRO_LOCAL' | 'ENTERPRISE';
  is_featured?: boolean;
  subscription_expires_at?: string | null;
}) {
  const res = await fetch(`${API_BASE_URL}/admin/stores/${id}/subscription`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar suscripción de tienda');
  return res.json();
}

export async function toggleAdminStoreStatus(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/stores/${id}/toggle-status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cambiar estado de la tienda');
  return res.json();
}

export async function deleteAdminStore(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/stores/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Error al eliminar la tienda');
  }
  return res.json();
}

export async function quickUpdateAdminStore(id: number, data: {
  country_code?: string;
  country_name?: string;
  country_flag?: string;
  city?: string;
  whatsapp_contact?: string;
  name?: string;
  is_active?: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/admin/stores/${id}/quick-update`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Error al actualizar datos rápidos de la tienda');
  }
  return res.json();
}

export async function recordStoreInteraction(params: {
  store_id: number;
  interaction_type: 'WHATSAPP_CLICK' | 'PHONE_CLICK' | 'MAP_ROUTE' | 'IN_STORE_VIEW' | 'PRODUCT_CLICK';
  branch_id?: number;
  metadata?: Record<string, any>;
}) {
  try {
    const user = getCurrentUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const res = await fetch(`${API_BASE_URL}/stores/interactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err) {
    console.debug('Aviso lead interaction anónimo:', err);
    return null;
  }
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

import type { VisionClassificationResult } from './gemini';

/** El visitante agotó sus análisis gratis: hay que crear cuenta o iniciar sesión. */
export class ScanAccountRequiredError extends Error {}

export async function scanImageWithGeminiVision(base64Image: string, mimeType: string = 'image/jpeg'): Promise<VisionClassificationResult> {
  const token = getCurrentUser()?.token;
  const res = await fetch('/api/ai/scan-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ image: base64Image, mimeType }),
  });
  if (!res.ok) {
    let errorMsg = 'Error al analizar imagen con IA';
    try {
      const errorJson = await res.json();
      if (errorJson?.error) errorMsg = errorJson.error;
      if (errorJson?.code === 'ACCOUNT_REQUIRED') throw new ScanAccountRequiredError(errorMsg);
    } catch (parseErr) {
      if (parseErr instanceof ScanAccountRequiredError) throw parseErr;
      if (res.status === 413) {
        errorMsg = 'La imagen es demasiado pesada. Se requiere comprimir la foto antes de enviarla.';
      } else if (res.status === 429) {
        errorMsg = 'Has alcanzado el límite de escaneo de imágenes por minuto. Espera unos segundos.';
      }
    }
    throw new Error(errorMsg);
  }
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

// ==========================================
// Business Portal & Merchant Store API Types
// ==========================================

export interface BusinessStoreProfile {
  id: number;
  name: string;
  slug: string;
  website_url?: string | null;
  logo_url?: string | null;
  store_type: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  country_code: string;
  instagram_handle?: string | null;
  whatsapp_contact?: string | null;
  is_independent: boolean;
  verification_status: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';
  is_active: boolean;
  subscription_tier: 'FREE' | 'PRO_LOCAL' | 'ENTERPRISE';
  subscription_tier_label: string;
  subscription_expires_at?: string | null;
  is_featured: boolean;
  branches_count: number;
  offers_count: number;
  leads_this_month: number;
}

export interface BusinessBranchItem {
  id: number;
  store_id: number;
  name: string;
  slug: string;
  state: string;
  city: string;
  address: string;
  reference_point?: string | null;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  phone?: string | null;
  whatsapp?: string | null;
  opening_hours?: string | null;
  is_active: boolean;
  offers_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessOfferItem {
  id: number;
  store_id: number;
  product_id: number;
  branch_id?: number | null;
  price: number;
  price_ves?: number | null;
  currency: string;
  in_stock: boolean;
  product_url?: string | null;
  last_checked_at?: string | null;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    barcode_ean?: string | null;
    category?: string | null;
    image_url?: string | null;
    brand?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  branch?: {
    id: number;
    name: string;
    slug: string;
    city: string;
  } | null;
}

export interface BusinessAnalyticsData {
  status: string;
  store_id: number;
  plan: {
    tier: string;
    is_featured: boolean;
  };
  inventory: {
    total_offers: number;
    in_stock_offers: number;
    out_of_stock_offers: number;
    average_price_usd: number;
    total_branches: number;
  };
  leads_summary_30d: {
    total_leads: number;
    whatsapp_clicks: number;
    phone_clicks: number;
    in_store_views: number;
    map_routes?: number;
    product_clicks?: number;
  };
  routine_impact?: {
    total_routine_items: number;
    active_users_relying: number;
  };
  demand_gap_opportunities?: Array<{
    inci_name: string;
    common_name: string;
    evidence_level: string;
    benefit: string | null;
  }>;
  anonymous_demographics?: {
    total_sample_size: number;
    oily_skin_pct: number;
    dry_skin_pct: number;
    combination_skin_pct: number;
    sensitive_skin_pct: number;
  };
  branches_performance: Array<{
    id: number;
    name: string;
    city: string;
    offers_count: number;
    leads_count: number;
  }>;
}

// Business Portal API Functions

export async function fetchBusinessStoreProfile(): Promise<{ status: string; has_store: boolean; store?: BusinessStoreProfile; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/business/store`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 404) {
    return { status: 'not_found', has_store: false };
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Error al obtener datos de la tienda');
  }
  return res.json();
}

export async function registerBusinessStore(payload: {
  store_name: string;
  website_url?: string;
  instagram_handle?: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  opening_hours?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/store/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrar tienda');
  }
  return res.json();
}

export async function claimBusinessStore(payload: {
  store_id?: number;
  store_slug?: string;
  whatsapp?: string;
  verification_notes?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/store/claim`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al reclamar la tienda');
  }
  return res.json();
}

export async function updateBusinessStoreProfile(payload: {
  name?: string;
  website_url?: string | null;
  logo_url?: string | null;
  instagram_handle?: string | null;
  whatsapp_contact?: string | null;
  community_notes?: string | null;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/store`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar perfil del comercio');
  }
  return res.json();
}

export async function fetchBusinessBranches(): Promise<{
  status: string;
  store_id: number;
  total: number;
  max_allowed: number;
  branches: BusinessBranchItem[];
}> {
  const res = await fetch(`${API_BASE_URL}/business/branches`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al cargar sucursales');
  }
  return res.json();
}

export async function createBusinessBranch(payload: {
  name: string;
  state: string;
  city: string;
  address: string;
  reference_point?: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters?: number;
  phone?: string;
  whatsapp?: string;
  opening_hours?: string;
  is_active?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/branches`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear sucursal');
  }
  return res.json();
}

export async function updateBusinessBranch(branchId: number, payload: Partial<BusinessBranchItem>): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/branches/${branchId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar sucursal');
  }
  return res.json();
}

export async function deleteBusinessBranch(branchId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/branches/${branchId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar sucursal');
  }
  return res.json();
}

export async function fetchBusinessOffers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  branch_id?: number | string;
  in_stock?: boolean | string;
}): Promise<{
  status: string;
  store_id: number;
  offers: {
    current_page: number;
    data: BusinessOfferItem[];
    last_page: number;
    total: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.per_page) query.append('per_page', params.per_page.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.branch_id) query.append('branch_id', params.branch_id.toString());
  if (params?.in_stock !== undefined && params?.in_stock !== '') {
    query.append('in_stock', params.in_stock.toString());
  }

  const res = await fetch(`${API_BASE_URL}/business/offers?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al cargar ofertas');
  }
  return res.json();
}

export async function createBusinessOffer(payload: {
  product_id: number;
  branch_id?: number | null;
  price: number;
  price_ves?: number | null;
  in_stock?: boolean;
  product_url?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/offers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al crear oferta');
  }
  return res.json();
}

export async function updateBusinessOffer(offerId: number, payload: {
  branch_id?: number | null;
  price?: number;
  price_ves?: number | null;
  in_stock?: boolean;
  product_url?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/offers/${offerId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al actualizar oferta');
  }
  return res.json();
}

export async function deleteBusinessOffer(offerId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/business/offers/${offerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al eliminar oferta');
  }
  return res.json();
}

export async function bulkUpdateBusinessOffers(payload: {
  exchange_rate?: number;
  offers?: Array<{
    id: number;
    price?: number;
    price_ves?: number;
    in_stock?: boolean;
  }>;
}): Promise<{ status: string; message: string; updated_count: number }> {
  const res = await fetch(`${API_BASE_URL}/business/offers/bulk-update`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al recalcular ofertas');
  }
  return res.json();
}

export interface BulkImportItem {
  barcode_ean?: string;
  name: string;
  brand?: string;
  price_usd: number;
  price_ves?: number;
  in_stock?: boolean;
  product_url?: string;
}

export interface BulkImportResponse {
  status: string;
  message: string;
  summary: {
    total_processed: number;
    created_offers: number;
    updated_offers: number;
    matched_scientific_products: number;
    created_new_products: number;
    errors_count: number;
  };
  errors: Array<{
    row: number;
    name: string;
    error: string;
  }>;
}

export async function bulkImportBusinessCatalog(payload: {
  branch_id?: number | null;
  exchange_rate?: number;
  items: BulkImportItem[];
}): Promise<BulkImportResponse> {
  const res = await fetch(`${API_BASE_URL}/business/offers/import`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al importar catálogo');
  }
  return res.json();
}

export async function fetchBusinessAnalytics(): Promise<BusinessAnalyticsData> {
  const res = await fetch(`${API_BASE_URL}/business/analytics`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al consultar analíticas comerciales');
  }
  return res.json();
}

export async function searchCatalogProducts(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE_URL}/catalog/products?q=${encodeURIComponent(query)}&per_page=10`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function fetchNearbyStores(lat: number, lng: number, radiusMeters: number = 5000): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/stores/nearby?lat=${lat}&lng=${lng}&radius_meters=${radiusMeters}`);
  if (!res.ok) {
    throw new Error('Error al consultar tiendas cercanas');
  }
  return res.json();
}

export async function fetchOptimizeStoreRoutine(lat: number, lng: number, radiusMeters: number = 15000, productIds?: number[]): Promise<any> {
  let url = `${API_BASE_URL}/stores/optimize-routine?lat=${lat}&lng=${lng}&radius_meters=${radiusMeters}`;
  if (productIds && productIds.length > 0) {
    productIds.forEach(id => {
      url += `&product_ids[]=${id}`;
    });
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Error al optimizar rutina con tiendas cercanas');
  }
  return res.json();
}

export async function fetchAdminScraperStatus(country?: string): Promise<{
  status: string;
  metrics: {
    total_offers: number;
    total_branches: number;
    total_stores: number;
    cron_frequency: string;
  };
  active_ingredients?: Array<{
    id: number;
    inci_name: string;
    common_name: string | null;
    studies_count: number;
    products_count: number;
  }>;
  recent_offers: Array<{
    id: number;
    store_name: string;
    branch_name: string;
    country_code?: string;
    country_name?: string;
    country_flag?: string;
    product_name: string;
    brand_name: string;
    price: number;
    price_ves: number | null;
    price_local?: number;
    currency_local?: string;
    formatted_price_usd?: string;
    formatted_price_local?: string;
    currency: string;
    in_stock: boolean;
    last_checked_at: string;
  }>;
  logs: string;
}> {
  const queryParam = country && country !== 'ALL' ? `?country=${encodeURIComponent(country)}` : '';
  const res = await fetch(`${API_BASE_URL}/admin/scraper/status${queryParam}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener estado del scraper');
  }
  return res.json();
}

export async function triggerAdminScraperRun(payload: {
  store?: string;
  city?: string;
  url?: string;
  mode?: 'chain' | 'url' | 'ingredient' | 'all_active_ingredients' | 'refresh_prices' | 'discover_web';
  ingredient_id?: string | number;
}): Promise<{
  status: string;
  message: string;
  output: string;
  executed_at: string;
}> {
  const res = await fetch(`${API_BASE_URL}/admin/scraper/run`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al ejecutar el rastreador');
  }
  return res.json();
}

export async function triggerAdminDiscoverWeb(payload: {
  term?: string;
  limit?: number;
  crawl?: boolean;
}): Promise<{
  status: string;
  message: string;
  data: {
    queries_executed: number;
    urls_found: number;
    domains_evaluated: number;
    new_stores_registered: number;
    stores_compatible: number;
    new_products_synced?: number;
    discovered_stores: Array<{
      id: number;
      name: string;
      url: string;
      platform: string;
      country_code?: string;
      confidence?: number;
    }>;
    errors?: string[];
  };
}> {
  const res = await fetch(`${API_BASE_URL}/admin/scraper/discover-web`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error en el descubrimiento web');
  }
  return res.json();
}

export interface CrawlerSummaryData {
  summary_meta: {
    generated_at: string;
    generated_human: string;
    period_hours: number;
    period_since: string;
    cron_schedule: string;
  };
  health: {
    status: 'OPERATIONAL' | 'ATTENTION' | 'CRITICAL';
    score: number;
    badge: string;
    message: string;
  };
  kpis: {
    total_offers: number;
    in_stock_offers: number;
    out_of_stock_offers: number;
    stock_rate_percentage: number;
    new_offers_period: number;
    updated_offers_period: number;
    price_increases_period: number;
    price_decreases_period: number;
    total_active_ingredients: number;
    crawled_ingredients_period: number;
    coverage_rate_percentage: number;
  };
  next_queue: Array<{
    id: number;
    inci_name: string;
    common_name: string | null;
    last_crawled_human: string;
  }>;
  recent_price_changes: Array<{
    id: number;
    product_name: string;
    brand: string;
    store_name: string;
    country_code?: string;
    country_name?: string;
    country_flag?: string;
    currency_local?: string;
    old_price_usd: number;
    new_price_usd: number;
    difference_usd: number;
    old_price_local?: number;
    new_price_local?: number;
    difference_local?: number;
    formatted_old_local?: string;
    formatted_new_local?: string;
    percentage_change: number;
    is_discount: boolean;
    recorded_at: string;
  }>;
  stores: Array<{
    id: number;
    name: string;
    slug: string;
    website_url?: string;
    country_code?: string;
    country_name?: string;
    country_flag?: string;
    platform: string;
    crawler_enabled: boolean;
    last_crawled_at?: string;
    last_crawled_human: string;
    total_offers: number;
    new_offers_period: number;
    in_stock_offers: number;
  }>;
  execution_diagnostics: {
    cycles_analyzed_count: number;
    total_evaluated_quality_gate: number;
    total_accepted_quality_gate: number;
    total_rejected_quality_gate: number;
    total_new_offers_synced: number;
    logged_errors_count: number;
    detected_anomalies: string[];
    quality_gate_breakdown?: {
      reasons: Array<{
        code: string;
        title: string;
        description: string;
        percentage: number;
        count: number;
        color: string;
      }>;
      recent_audits: Array<{
        id: string;
        product_name: string;
        store_name: string;
        inci_name: string;
        status: 'APPROVED' | 'REJECTED';
        confidence_score: number;
        reason_code: string;
        reason: string;
        timestamp: string;
        time_human: string;
      }>;
    };
  };
  recommendations: string[];
}

export async function fetchAdminCrawlerSummary(hours: number = 24): Promise<{
  status: string;
  data: CrawlerSummaryData;
}> {
  const res = await fetch(`${API_BASE_URL}/admin/scraper/summary?hours=${hours}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener resumen del crawler');
  }
  return res.json();
}

export interface SystemHealthData {
  status: 'operational' | 'degraded';
  uptime_status: 'online' | 'offline';
  timestamp: string;
  services: {
    database: string;
    ingredient_dataset: string;
  };
}

export async function checkSystemHealth(): Promise<SystemHealthData> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Nodo no disponible (HTTP ${res.status})`);
  }
  return res.json();
}

export interface AdminIngredientItem {
  id: number;
  inci_name: string;
  common_name: string | null;
  cas_number: string | null;
  ec_number: string | null;
  cosing_id: string | null;
  description: string | null;
  cosing_functions: string[] | null;
  comedogenic_rating: number;
  irritation_rating: number;
  optimal_ph_min: number | null;
  optimal_ph_max: number | null;
  molecular_weight: number | null;
  is_active: boolean;
  is_uv_sensitizing: boolean;
  requires_sunscreen: boolean;
  recommended_timing: 'AM' | 'PM' | 'BOTH';
  layering_category: string | null;
  clinical_summary: string | null;
  results_timeline_weeks_min: number | null;
  results_timeline_weeks_max: number | null;
  source_name: string | null;
  source_url: string | null;
  source_license: string | null;
  evidence_level: 'A' | 'B' | 'C' | 'D' | null;
  reviewed_at: string | null;
  evidence_grade_description: string;
  products_count?: number;
  indications?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
  }>;
  pubmed_studies?: Array<{
    id: number;
    pmid: string;
    title: string;
    journal: string | null;
    publication_year: number | null;
    study_type: string | null;
    pivot?: {
      primary_finding: string | null;
    };
  }>;
}

export interface AdminIngredientDetail extends AdminIngredientItem {
  aliases?: Array<{
    id: number;
    alias_name: string;
    language: string;
  }>;
  conflicts_as_a?: Array<{
    id: number;
    ingredient_b_id: number;
    conflict_type: string;
    severity: string;
    interaction_mechanism: string;
    mitigation_recommendation: string;
    ingredient_b?: {
      id: number;
      inci_name: string;
      common_name: string | null;
    };
  }>;
  conflicts_as_b?: Array<{
    id: number;
    ingredient_a_id: number;
    conflict_type: string;
    severity: string;
    interaction_mechanism: string;
    mitigation_recommendation: string;
    ingredient_a?: {
      id: number;
      inci_name: string;
      common_name: string | null;
    };
  }>;
  products?: Array<{
    id: number;
    name: string;
    slug: string;
    category: string;
    brand?: {
      id: number;
      name: string;
    };
    store_offers?: Array<{
      id: number;
      price: number;
      price_usd: number;
      price_local: number;
      formatted_price_usd: string;
      formatted_price_local: string;
      in_stock: boolean;
      store?: {
        name: string;
      };
    }>;
  }>;
}

export interface AdminIngredientsPaginatedResponse {
  current_page: number;
  data: AdminIngredientItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export async function fetchAdminIngredients(params: {
  q?: string;
  is_active?: boolean;
  evidence_level?: string;
  timing?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
} = {}): Promise<AdminIngredientsPaginatedResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.is_active !== undefined) query.set('actives_only', params.is_active ? '1' : '0');
  if (params.evidence_level) query.set('evidence_level', params.evidence_level);
  if (params.timing) query.set('timing', params.timing);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.order) query.set('order', params.order);
  if (params.page) query.set('page', params.page.toString());
  if (params.per_page) query.set('per_page', params.per_page.toString());

  const res = await fetch(`${API_BASE_URL}/catalog/ingredients?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener ingredientes');
  }
  return res.json();
}

export async function fetchAdminIngredientDetail(identifier: string | number): Promise<AdminIngredientDetail> {
  const res = await fetch(`${API_BASE_URL}/catalog/ingredients/${identifier}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener ficha del ingrediente');
  }
  const json = await res.json();
  return json.data;
}

// ==========================================
// CALIFICACIONES Y OPINIONES DE PRODUCTOS
// ==========================================

export interface ProductReviewItem {
  id: number;
  product_id?: number | null;
  product_slug: string;
  user_id?: number | null;
  user_name: string;
  user_skin_type?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  usage_duration: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ProductReviewsResponse {
  product_slug: string;
  average_rating: number;
  total_reviews: number;
  stars_breakdown: { [stars: number]: number };
  reviews: ProductReviewItem[];
}

export async function fetchProductReviews(slug: string): Promise<ProductReviewsResponse> {
  try {
    return await apiFetch<ProductReviewsResponse>(
      `${API_BASE_URL}/catalog/products/${encodeURIComponent(slug)}/reviews`,
      { cache: 'no-store' }
    );
  } catch (error) {
    // Modo sin conexión o almacenamiento local exclusivamente para reseñas del usuario local
    const localKey = `allaboutskin_reviews_${slug}`;
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null;
    const localList: ProductReviewItem[] = localSaved ? JSON.parse(localSaved) : [];

    return {
      product_slug: slug,
      average_rating: localList.length
        ? +(localList.reduce((acc, r) => acc + r.rating, 0) / localList.length).toFixed(1)
        : 0,
      total_reviews: localList.length,
      stars_breakdown: {
        5: localList.filter((r) => r.rating === 5).length,
        4: localList.filter((r) => r.rating === 4).length,
        3: localList.filter((r) => r.rating === 3).length,
        2: localList.filter((r) => r.rating === 2).length,
        1: localList.filter((r) => r.rating === 1).length,
      },
      reviews: localList,
    };
  }
}

export async function submitProductReview(
  slug: string,
  payload: {
    rating: number;
    title: string;
    comment: string;
    user_name?: string;
    user_skin_type?: string;
    usage_duration?: string;
  }
): Promise<{ message: string; review: ProductReviewItem }> {
  try {
    const data = await apiFetch<{ message: string; review: ProductReviewItem }>(
      `${API_BASE_URL}/catalog/products/${encodeURIComponent(slug)}/reviews`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    return data;
  } catch (e: any) {
    // Persistencia local resiliente
    const localKey = `allaboutskin_reviews_${slug}`;
    const localSaved = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null;
    const localList: ProductReviewItem[] = localSaved ? JSON.parse(localSaved) : [];

    const newRev: ProductReviewItem = {
      id: Date.now(),
      product_slug: slug,
      user_name: payload.user_name || 'Tú (Usuario verificado)',
      user_skin_type: payload.user_skin_type || 'Piel Mixta',
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      usage_duration: payload.usage_duration || '2 semanas',
      is_verified: true,
      helpful_count: 0,
      created_at: new Date().toISOString(),
    };
    localList.unshift(newRev);
    if (typeof window !== 'undefined') {
      localStorage.setItem(localKey, JSON.stringify(localList));
    }
    return { message: '¡Opinión guardada localmente con éxito!', review: newRev };
  }
}

export async function voteReviewHelpful(reviewId: number): Promise<{ helpful_count: number }> {
  return apiFetch<{ helpful_count: number }>(`${API_BASE_URL}/catalog/reviews/${reviewId}/helpful`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

// ==========================================
// CAPTURAS DE REVISIÓN Y PROGRESO DE LA PIEL
// ==========================================

export interface UserSkinScanItem {
  id: number;
  user_id?: number | null;
  image_url?: string | null;
  // Las métricas solo existen si el análisis las devolvió; nunca se rellenan por defecto.
  overall_score: number | null;
  hydration_score: number | null;
  elasticity_score: number | null;
  pores_score: number | null;
  spots_score: number | null;
  fine_lines_score: number | null;
  barrier_status: string | null;
  scan_mode: 'face' | 'product' | string;
  clinical_summary?: string | null;
  recommendations?: string | null;
  created_at: string;
}

// Requiere sesión: el historial contiene datos de salud. Ante un error lanza ApiError,
// sin recurrir a localStorage ni a datos de ejemplo.
export async function saveUserSkinScan(
  payload: Partial<Omit<UserSkinScanItem, 'id' | 'created_at' | 'user_id'>>
): Promise<{ message: string; scan: UserSkinScanItem }> {
  return apiFetch(`${API_BASE_URL}/user/skin-scans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export interface AdminNotificationSummary {
  status: string;
  pending_stores_count: number;
  today_users_count: number;
  total_users_count: number;
  today_leads_count: number;
  security_alerts_count: number;
}

export async function fetchAdminNotificationSummary(): Promise<AdminNotificationSummary> {
  const res = await fetch(`${API_BASE_URL}/admin/notifications/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al obtener el resumen de notificaciones');
  }
  return res.json();
}
