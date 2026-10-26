import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logUserRoutineAdherence, StoredUser } from '@/lib/api';
import { fetchTodayRoutineStrict, TodayRoutine } from '@/lib/userDashboardApi';

export function useMiRutina() {
  const [user, setUser] = useState<StoredUser | null | undefined>(undefined);
  const [routine, setRoutine] = useState<TodayRoutine | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutine = useCallback(async () => {
    try {
      setRoutine(await fetchTodayRoutineStrict());
      setError(null);
    } catch (err) {
      setRoutine(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar tu rutina');
    }
  }, []);

  const reload = useCallback(() => {
    setRoutine(null);
    setError(null);
    return fetchRoutine();
  }, [fetchRoutine]);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    if (current?.token) fetchRoutine();
  }, [fetchRoutine]);

  // Registra el turno completo (el backend guarda el cumplimiento por turno, no por paso).
  const completeSlot = useCallback(async (slot: 'AM' | 'PM') => {
    await logUserRoutineAdherence({ slot });
    await fetchRoutine();
  }, [fetchRoutine]);

  return { user, routine, error, reload, completeSlot };
}
