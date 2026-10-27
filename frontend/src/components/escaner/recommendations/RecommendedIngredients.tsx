'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import IngredientExplainer from './IngredientExplainer';
import { getRecommendedIngredients, SkinType } from './ingredientRecommendations';

interface RecommendedIngredientsProps {
  skinType?: SkinType | null;
}

export default function RecommendedIngredients({ skinType }: RecommendedIngredientsProps) {
  const recommendations = getRecommendedIngredients(skinType);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex !== null ? recommendations[openIndex] : null;

  return (
    <div className="space-y-2.5 pt-1">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Ingredientes Clave Recomendados para tu Piel:
        </span>
        <span className="text-[11px] text-slate-500">Toca uno para saber qué es y por qué te lo recomendamos.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recommendations.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <button
              key={`${item.slug}-${i}`}
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={`p-3.5 rounded-2xl glass-subcard flex items-center gap-3 border text-left transition cursor-pointer ${
                isOpen ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-white hover:border-emerald-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${item.iconClass} flex items-center justify-center font-bold text-lg shrink-0`}>
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.label}</h4>
                <span className="text-[11px] text-slate-500 font-medium block truncate">{item.tag}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          );
        })}
      </div>

      {openItem && <IngredientExplainer key={openIndex} recommendation={openItem} onClose={() => setOpenIndex(null)} />}
    </div>
  );
}
