'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

export interface IngredientDetail {
  id: number;
  inci_name: string;
  common_name: string | null;
  description: string | null;
  clinical_summary: string | null;
  recommended_timing: 'AM' | 'PM' | 'BOTH' | null;
  requires_sunscreen: boolean;
  is_uv_sensitizing: boolean;
  irritation_rating: number | null;
  comedogenic_rating: number | null;
  results_timeline_weeks_min: number | null;
  results_timeline_weeks_max: number | null;
  evidence_level: string | null;
  evidence_grade_description: string | null;
}

// Caché en memoria para no repetir la consulta al abrir y cerrar la misma tarjeta
const cache = new Map<string, IngredientDetail>();

interface FetchOutcome {
  slug: string;
  attempt: number;
  error: string;
}

export function useIngredientDetail(slug: string | null) {
  const [attempt, setAttempt] = useState(0);
  // Se guarda el último fallo con su slug e intento: así el estado de carga y de error se deriva sin setState síncrono en el efecto
  const [failure, setFailure] = useState<FetchOutcome | null>(null);
  const [, setLoadedTick] = useState(0);

  useEffect(() => {
    if (!slug || cache.has(slug)) return;

    let cancelled = false;
    fetch(`${API_BASE_URL}/catalog/ingredients/${encodeURIComponent(slug)}`, { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not-found' : 'error');
        const json = await res.json();
        return json.data as IngredientDetail;
      })
      .then((data) => {
        cache.set(slug, data);
        if (!cancelled) setLoadedTick((t) => t + 1);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setFailure({
          slug,
          attempt,
          error:
            err.message === 'not-found'
              ? 'Este ingrediente todavía no tiene ficha en nuestra base de datos.'
              : 'No pudimos cargar la información del ingrediente.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  const detail = slug ? cache.get(slug) ?? null : null;
  const error = !detail && failure && failure.slug === slug && failure.attempt === attempt ? failure.error : null;
  const isLoading = !!slug && !detail && !error;

  return { detail, isLoading, error, retry: () => setAttempt((a) => a + 1) };
}
