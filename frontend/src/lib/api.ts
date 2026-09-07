export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

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

export function isUserBusiness(user: StoredUser | null): boolean {
  if (!user || !user.role) return false;
  return user.role === 'business_owner' || user.role === 'admin' || user.role === 'super_admin';
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
  instagram_handle?: string | null;
  whatsapp_contact?: string | null;
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
}

export interface AdminStoresResponse {
  status: string;
  summary: {
    pending_review: number;
    total_verified: number;
    total_stores: number;
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
  search?: string;
  verification_status?: string;
  subscription_tier?: string;
}): Promise<AdminStoresResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.verification_status) query.append('verification_status', params.verification_status);
  if (params?.subscription_tier) query.append('subscription_tier', params.subscription_tier);

  const res = await fetch(`${API_BASE_URL}/admin/stores?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar tiendas');
  return res.json();
}

export async function fetchAdminStoreDetail(id: number): Promise<{ status: string; store: AdminStoreItem }> {
  const res = await fetch(`${API_BASE_URL}/admin/stores/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al cargar detalle de tienda');
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

export async function scanImageWithGeminiVision(base64Image: string, mimeType: string = 'image/jpeg'): Promise<VisionClassificationResult> {
  const res = await fetch('/api/ai/scan-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mimeType }),
  });
  if (!res.ok) {
    let errorMsg = 'Error al analizar imagen con IA';
    try {
      const errorJson = await res.json();
      if (errorJson?.error) errorMsg = errorJson.error;
    } catch {
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

