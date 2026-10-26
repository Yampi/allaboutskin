import React from 'react';
import { Clock, Package } from 'lucide-react';
import type { RoutineItem, TodayRoutine } from '@/lib/userDashboardApi';
import type { Section } from '@/hooks/useUserDashboard';
import DashboardCard, { EmptyNote } from './DashboardCard';
import { daysUntilExpiry } from './labels';

interface ProductsCardsProps {
  routine: Section<TodayRoutine>;
  onRetry: () => void;
}

function expiryText(days: number): string {
  if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
  return days === 0 ? 'Vence hoy' : `${days} días restantes`;
}

export default function ProductsCards({ routine, onRetry }: ProductsCardsProps) {
  const items: RoutineItem[] = routine.data ? [...routine.data.am_routine.items, ...routine.data.pm_routine.items] : [];
  const products = items.filter((i) => i.product);
  const withPao = products
    .map((i) => ({ item: i, days: daysUntilExpiry(i.opened_at, i.product?.pao_months) }))
    .filter((x): x is { item: RoutineItem; days: number } => x.days !== null)
    .sort((a, b) => a.days - b.days);

  return (
    <>
      <DashboardCard
        title="PAO y vencimientos"
        icon={<Clock className="w-4 h-4 text-[#8C827A]" />}
        section={routine}
        onRetry={onRetry}
        link={{ href: '/biblioteca', label: 'Ver todos los productos' }}
      >
        {withPao.length === 0 ? (
          <EmptyNote text="Sin productos con fecha de apertura y PAO registrados." />
        ) : (
          <div className="space-y-2">
            {withPao.slice(0, 3).map(({ item, days }) => (
              <div key={item.id} className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] text-xs">
                <div className="font-bold text-[#2D2825] truncate">{item.product?.name}</div>
                <div className={days < 30 ? 'text-amber-700' : 'text-[#66615C]'}>{expiryText(days)}</div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Tus productos"
        icon={<Package className="w-4 h-4 text-[#8C827A]" />}
        section={routine}
        onRetry={onRetry}
        link={{ href: '/mi-rutina', label: 'Ver mi rutina' }}
      >
        {products.length === 0 ? (
          <EmptyNote text="Todavía no has añadido productos a tu rutina." cta={{ href: '/biblioteca', label: 'Explorar productos' }} />
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] text-xs font-bold text-[#2D2825]">
            <span className="text-[#2E7D5B] font-extrabold">{products.length}</span> en tu rutina de hoy
          </div>
        )}
      </DashboardCard>
    </>
  );
}
