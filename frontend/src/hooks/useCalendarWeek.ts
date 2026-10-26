import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logUserRoutineAdherence, StoredUser } from '@/lib/api';
import {
  fetchRoutineWeekStrict,
  fetchRoutineStatsStrict,
  restartSkinCycle,
  RoutineStats,
  TodayRoutine,
} from '@/lib/userDashboardApi';

export const toLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface WeekDay {
  date: Date;
  iso: string;
  routine: TodayRoutine;
}

// Lunes de la semana que está `offset` semanas respecto a hoy.
function mondayOf(offset: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
}

export function useCalendarWeek(weekOffset: number) {
  const [user, setUser] = useState<StoredUser | null | undefined>(undefined);
  const [days, setDays] = useState<WeekDay[] | null>(null);
  const [stats, setStats] = useState<RoutineStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeek = useCallback(async () => {
    const current = getCurrentUser();
    setUser(current);
    if (!current?.token) return;
    setError(null);
    try {
      const monday = mondayOf(weekOffset);
      const dates = Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
      const [routines, st] = await Promise.all([
        fetchRoutineWeekStrict(toLocalDate(monday)),
        fetchRoutineStatsStrict(),
      ]);
      setDays(dates.map((date, i) => ({ date, iso: toLocalDate(date), routine: routines[i] })));
      setStats(st);
    } catch (err) {
      setDays(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el calendario');
    }
  }, [weekOffset]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  const completeSlot = useCallback(async (slot: 'AM' | 'PM', iso: string) => {
    await logUserRoutineAdherence({ slot, date: iso });
    await fetchWeek();
  }, [fetchWeek]);

  // Hoy (fecha local) pasa a ser la noche 1 del ciclo.
  const restartCycle = useCallback(async () => {
    await restartSkinCycle(toLocalDate(new Date()));
    await fetchWeek();
  }, [fetchWeek]);

  return { user, days, stats, error, reload: fetchWeek, completeSlot, restartCycle };
}
