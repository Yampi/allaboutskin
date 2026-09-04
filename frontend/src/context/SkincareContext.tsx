'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ProductShelfItem } from '@/components/mobile/types';
import { initialUserProfile } from '@/components/mobile/skincareData';
import { getCurrentUser } from '@/lib/api';

const defaultInitialShelf: ProductShelfItem[] = [
  {
    id: 'shelf-default-1',
    name: '2% BHA Liquid Exfoliant',
    brand: "Paula's Choice",
    category: 'Exfoliante Químico Liposoluble',
    volume: '118 ml',
    paoMonths: 12,
    inciScore: 94,
    primaryActives: ['Ácido Salicílico 2%', 'Té Verde'],
    assignedPhase: 1,
    assignedPhaseName: 'Noche 1: Exfoliación',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Líquido penetrante queratolítico',
  },
  {
    id: 'shelf-default-2',
    name: 'Granactive Retinoid 2% in Squalane',
    brand: 'The Ordinary',
    category: 'Retinoide Dermatológico',
    volume: '30 ml',
    paoMonths: 6,
    inciScore: 92,
    primaryActives: ['Hidroxipinacolona Retinoato', 'Escualano'],
    assignedPhase: 2,
    assignedPhaseName: 'Noche 2: Retinoides',
    image: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Solución anhidra de alta tolerancia',
  },
  {
    id: 'shelf-default-3',
    name: 'Cicaplast Baume B5+ Ultra-Reparador',
    brand: 'La Roche-Posay',
    category: 'Bálsamo Calmante de Barrera',
    volume: '40 ml',
    paoMonths: 12,
    inciScore: 98,
    primaryActives: ['Pantenol 5%', 'Madecassoside (Cica)', 'Zinc'],
    assignedPhase: 3,
    assignedPhaseName: 'Noche 3: Recuperación',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    textureNote: 'Bálsamo oclusivo biomimético',
  },
];

const STORAGE_KEY_PROFILE = 'allabout_skin_user_profile_v2';
const STORAGE_KEY_SHELF = 'allabout_skin_shelf_items_v2';
const STORAGE_KEY_ROUTINE_V1 = 'allabout_routine_products_v1';

export interface SkincareConflict {
  id: string;
  severity: 'WARNING' | 'CRITICAL' | 'TIP';
  title: string;
  description: string;
  involvedProducts: string[];
  recommendation: string;
}

interface SkincareContextType {
  userProfile: UserProfile;
  shelfItems: ProductShelfItem[];
  isLoaded: boolean;
  conflicts: SkincareConflict[];
  updateProfile: (updated: Partial<UserProfile>) => void;
  addProductToShelf: (product: ProductShelfItem) => void;
  removeProductFromShelf: (productId: string) => void;
  assignProductPhase: (productId: string, phaseNumber: number) => void;
  completeNightRitual: (nightNumber: number) => void;
  activeNightData: {
    nightNumber: number;
    phaseName: string;
    phaseTitle: string;
    accentColor: string;
    products: ProductShelfItem[];
  };
  getProductsForPhase: (phaseNumber: number) => ProductShelfItem[];
}

const SkincareContext = createContext<SkincareContextType | undefined>(undefined);

const PHASE_NAMES: Record<number, string> = {
  0: 'Rutina AM (Día)',
  1: 'Noche 1: Exfoliación',
  2: 'Noche 2: Retinoides',
  3: 'Noche 3: Recuperación',
  4: 'Noche 4: Recuperación Profunda',
};

const PHASE_COLORS: Record<number, string> = {
  0: '#8FA89B',
  1: '#C28E6A', // Warm Terracotta
  2: '#5B4B75', // Deep Amethyst
  3: '#4A6B5B', // Clinical Sage
  4: '#4A6B5B', // Clinical Sage
};

export function SkincareProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window === 'undefined') return initialUserProfile;
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        const authUser = getCurrentUser();
        if (authUser && !parsed.name) {
          parsed.name = authUser.name || authUser.email.split('@')[0];
        }
        return parsed;
      }
    } catch (e) {
      console.warn('SkincareContext: Error loading profile:', e);
    }
    return initialUserProfile;
  });

  const [shelfItems, setShelfItems] = useState<ProductShelfItem[]>(() => {
    if (typeof window === 'undefined') return defaultInitialShelf;
    try {
      const savedShelf = localStorage.getItem(STORAGE_KEY_SHELF);
      if (savedShelf) {
        const parsed = JSON.parse(savedShelf);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('SkincareContext: Error loading shelf:', e);
    }
    return defaultInitialShelf;
  });

  const isLoaded = true;

  // Derivación reactiva directa de conflictos para evitar setState dentro de useEffect
  const conflicts = React.useMemo(() => detectShelfConflicts(shelfItems), [shelfItems]);

  // Sync to localStorage
  const persistProfile = (nextProfile: UserProfile) => {
    setUserProfile(nextProfile);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(nextProfile));
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  };

  const persistShelf = (nextShelf: ProductShelfItem[]) => {
    setShelfItems(nextShelf);
    try {
      localStorage.setItem(STORAGE_KEY_SHELF, JSON.stringify(nextShelf));
      // Bridge to legacy v1 store as well
      const v1Mapped = nextShelf.map((p) => ({
        id: p.id,
        phaseId: p.assignedPhase,
        productName: p.name,
        brand: p.brand,
        category: mapToV1Category(p.category, p.name),
      }));
      localStorage.setItem(STORAGE_KEY_ROUTINE_V1, JSON.stringify(v1Mapped));
    } catch (e) {
      console.warn('Error saving shelf:', e);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    persistProfile({ ...userProfile, ...updated });
  };

  const addProductToShelf = (newProduct: ProductShelfItem) => {
    const exists = shelfItems.some(
      (p) => p.name.toLowerCase() === newProduct.name.toLowerCase()
    );
    const updated = exists
      ? shelfItems.map((p) => (p.name.toLowerCase() === newProduct.name.toLowerCase() ? newProduct : p))
      : [newProduct, ...shelfItems];
    persistShelf(updated);
  };

  const removeProductFromShelf = (productId: string) => {
    const updated = shelfItems.filter((p) => p.id !== productId);
    persistShelf(updated);
  };

  const assignProductPhase = (productId: string, phaseNumber: number) => {
    const updated = shelfItems.map((p) => {
      if (p.id !== productId) return p;
      return {
        ...p,
        assignedPhase: phaseNumber,
        assignedPhaseName: PHASE_NAMES[phaseNumber] || `Fase ${phaseNumber}`,
      };
    });
    persistShelf(updated);
  };

  const completeNightRitual = (completedNight: number) => {
    const nextNight = (completedNight % 4) + 1;
    const nextStreak = (userProfile.cycleStreakDays || 0) + 1;
    persistProfile({
      ...userProfile,
      cycleStreakDays: nextStreak,
      activeNight: nextNight,
      barrierStatus: nextStreak >= 4 ? 'Barrera Óptima (98%)' : 'Barrera Estable (89%)',
      tewlScore: nextStreak >= 4 ? '8.4 g/m²h (Óptimo)' : '10.2 g/m²h (Normal)',
    });
  };

  const getProductsForPhase = (phaseNumber: number) => {
    return shelfItems.filter((p) => p.assignedPhase === phaseNumber);
  };

  const activeNight = userProfile.activeNight || 1;
  const activeNightProducts = getProductsForPhase(activeNight);

  const activeNightData = {
    nightNumber: activeNight,
    phaseName: PHASE_NAMES[activeNight] || `Noche ${activeNight}`,
    phaseTitle:
      activeNight === 1
        ? 'Renovación Dérmica & Exfoliación Química'
        : activeNight === 2
        ? 'Diferenciación Celular & Retinoides'
        : activeNight === 3
        ? 'Reparación de Barrera Lipídica'
        : 'Recuperación Celular & Sellado Oclusivo',
    accentColor: PHASE_COLORS[activeNight] || '#4A6B5B',
    products: activeNightProducts,
  };

  return (
    <SkincareContext.Provider
      value={{
        userProfile,
        shelfItems,
        isLoaded,
        conflicts,
        updateProfile,
        addProductToShelf,
        removeProductFromShelf,
        assignProductPhase,
        completeNightRitual,
        activeNightData,
        getProductsForPhase,
      }}
    >
      {children}
    </SkincareContext.Provider>
  );
}

export function useSkincare() {
  const context = useContext(SkincareContext);
  if (!context) {
    throw new Error('useSkincare debe usarse dentro de un SkincareProvider');
  }
  return context;
}

// Conflict Analysis Engine
function detectShelfConflicts(products: ProductShelfItem[]): SkincareConflict[] {
  const conflicts: SkincareConflict[] = [];

  // Group products by phase
  const byPhase: Record<number, ProductShelfItem[]> = {};
  products.forEach((p) => {
    if (!byPhase[p.assignedPhase]) byPhase[p.assignedPhase] = [];
    byPhase[p.assignedPhase].push(p);
  });

  // 1. Check if Retinoid + Strong Exfoliant are in the same phase
  Object.entries(byPhase).forEach(([phaseStr, items]) => {
    const phase = parseInt(phaseStr);
    const hasExfoliant = items.some(
      (p) =>
        p.name.toLowerCase().includes('salicyl') ||
        p.name.toLowerCase().includes('bha') ||
        p.name.toLowerCase().includes('glycol') ||
        p.name.toLowerCase().includes('aha') ||
        p.name.toLowerCase().includes('lactic')
    );
    const hasRetinoid = items.some(
      (p) =>
        p.name.toLowerCase().includes('retin') ||
        p.name.toLowerCase().includes('tretin') ||
        p.name.toLowerCase().includes('adapalen')
    );

    if (hasExfoliant && hasRetinoid) {
      conflicts.push({
        id: `conflict-retin-acid-${phase}`,
        severity: 'CRITICAL',
        title: `Conflicto Severo en ${PHASE_NAMES[phase] || `Fase ${phase}`}`,
        description:
          'Has asignado un exfoliante químico y un retinoide a la misma noche. Aplicarlos juntos compromete la integridad del estrato córneo y causa irritación aguda.',
        involvedProducts: items
          .filter(
            (p) =>
              p.name.toLowerCase().includes('salicyl') ||
              p.name.toLowerCase().includes('bha') ||
              p.name.toLowerCase().includes('glycol') ||
              p.name.toLowerCase().includes('retin')
          )
          .map((p) => p.name),
        recommendation:
          'Separa estos activos: usa el exfoliante en la Noche 1 y el retinoide en la Noche 2.',
      });
    }
  });

  // 2. Check if Recovery Nights lack moisturizers/barrier lipids
  const recoveryProds = [...(byPhase[3] || []), ...(byPhase[4] || [])];
  const hasLipidBarrier = recoveryProds.some(
    (p) =>
      p.name.toLowerCase().includes('ceramid') ||
      p.name.toLowerCase().includes('cica') ||
      p.name.toLowerCase().includes('baume') ||
      p.name.toLowerCase().includes('crema') ||
      p.name.toLowerCase().includes('lipid') ||
      p.name.toLowerCase().includes('hyalur') ||
      p.name.toLowerCase().includes('hidrat')
  );

  if (products.length > 2 && !hasLipidBarrier) {
    conflicts.push({
      id: 'conflict-no-barrier',
      severity: 'WARNING',
      title: 'Faltan activos de recuperación en tu neceser',
      description:
        'Tienes activos potentes programados, pero ninguna crema o bálsamo reparador asignado a tus noches de descanso (Noches 3 y 4).',
      involvedProducts: [],
      recommendation:
        'Añade un producto rico en Ceramidas NP/AP, Centella Asiática o Pantenol para sellar la hidratación.',
    });
  }

  return conflicts;
}

function mapToV1Category(category: string, name: string): 'CLEANSER' | 'TONER' | 'SERUM' | 'EXFOLIANT' | 'RETINOID' | 'MOISTURIZER' | 'SPF' {
  const lower = (category + ' ' + name).toLowerCase();
  if (lower.includes('retin')) return 'RETINOID';
  if (lower.includes('exfoli') || lower.includes('bha') || lower.includes('aha') || lower.includes('salicyl')) return 'EXFOLIANT';
  if (lower.includes('limpia') || lower.includes('clean') || lower.includes('gel')) return 'CLEANSER';
  if (lower.includes('spf') || lower.includes('solar') || lower.includes('sun')) return 'SPF';
  if (lower.includes('crema') || lower.includes('moistur') || lower.includes('baume')) return 'MOISTURIZER';
  if (lower.includes('tónico') || lower.includes('toner')) return 'TONER';
  return 'SERUM';
}
