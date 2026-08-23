'use client';

import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Microscope,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { ActiveIngredient } from './types';
import { activeIngredientsList } from './skincareData';

interface LibraryScreenProps {
  onSelectIngredient: (ing: ActiveIngredient) => void;
}

export default function LibraryScreen({ onSelectIngredient }: LibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos los Activos' },
    { id: 'barrier', label: 'Barrera & Lípidos' },
    { id: 'retinoid', label: 'Retinoides' },
    { id: 'exfoliant', label: 'Exfoliantes BHA/AHA' },
    { id: 'soothing', label: 'Calmantes & Cica' },
  ];

  const filteredIngredients = activeIngredientsList.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.inci.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.benefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || ing.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 pb-24 pt-1 px-4 max-w-md mx-auto animate-in fade-in duration-300">
      {/* 1. Buscador (Input estilo píldora) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#7E756F] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar activo, INCI o beneficio..."
            className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-[#E8E1D7] text-[#2D2825] text-[13px] font-sans placeholder-[#9D948B] focus:outline-none focus:border-[#8FA89B] focus:ring-1 focus:ring-[#8FA89B] shadow-diffuse transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 text-[#7E756F] hover:text-[#2D2825] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#4A6B5B] text-white border-[#4A6B5B] shadow-xs'
                  : 'bg-[#F2ECE4] text-[#4A433E] border-[#E2D9CD] hover:border-[#8FA89B]'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Card Destacada (Banner "Ciencia de Skincare" con microscopio botánico) */}
      <div className="card-sand p-4 border border-[#E2D9CD] relative overflow-hidden shadow-diffuse">
        {/* Subtle decorative glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#8FA89B]/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#8FA89B]/40 flex items-center justify-center text-[#4A6B5B] shrink-0 shadow-xs">
            <Microscope className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider block">
              Dermatología Basada en Evidencia
            </span>
            <h3 className="font-serif text-[17px] font-semibold text-[#2D2825] mt-0.5 leading-snug">
              Ciencia de Skincare
            </h3>
            <p className="text-[12px] font-sans text-[#4A433E] mt-1 leading-relaxed">
              Cada ficha molecular está indexada contra el registro oficial <strong>CosIng de la Unión Europea</strong> y estudios clínicos indexados en <strong>PubMed (NCBI)</strong>.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#E2D9CD] flex items-center justify-between text-[11px] text-[#7E756F]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A6B5B]" />
            100% Sin sesgos comerciales
          </span>
          <span className="font-semibold text-[#4A6B5B]">
            {activeIngredientsList.length} Fórmulas Analizadas
          </span>
        </div>
      </div>

      {/* 3. Grid de Activos (2 Columnas) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-section-h3 text-[#7E756F]">
            ENCICLOPEDIA DE ACTIVOS ({filteredIngredients.length})
          </span>
          <span className="text-[11px] font-sans text-[#4A6B5B]">
            Toca una tarjeta para ver ficha
          </span>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              onClick={() => onSelectIngredient(ingredient)}
              className="card-white p-3 border border-[#E8E1D7] flex flex-col justify-between hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition cursor-pointer group"
            >
              <div>
                {/* Macro Photography Container */}
                <div className="relative h-28 w-full rounded-[14px] overflow-hidden bg-[#FAF8F5] border border-[#E2D9CD] mb-2.5">
                  <img
                    src={ingredient.macroImage}
                    alt={ingredient.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[8.5px] font-mono font-medium">
                      {ingredient.recommendedConcentration}
                    </span>
                  </div>
                </div>

                {/* Category metadata */}
                <span className="text-[9.5px] font-bold text-[#7E756F] uppercase tracking-wider block">
                  {ingredient.categoryLabel}
                </span>

                <h4 className="font-serif text-[15px] font-semibold text-[#2D2825] mt-0.5 leading-tight group-hover:text-[#4A6B5B] transition">
                  {ingredient.name}
                </h4>

                <p className="text-[11px] font-mono text-[#9D948B] mt-0.5 line-clamp-1">
                  {ingredient.inci}
                </p>

                <p className="text-[11.5px] font-sans text-[#4A433E] mt-1.5 line-clamp-2 leading-snug">
                  {ingredient.shortDescription}
                </p>
              </div>

              {/* Badges Footer */}
              <div className="mt-3 pt-2 border-t border-[#E8E1D7] flex items-center justify-between text-[10px]">
                <span className="text-[#4A6B5B] font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  PubMed
                </span>
                <span className="text-[#7E756F] font-mono">
                  {ingredient.pubmedCount.toLocaleString()}+
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredIngredients.length === 0 && (
          <div className="card-sand p-8 text-center text-[#7E756F] space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-[#8FA89B]" />
            <p className="font-serif text-[16px] text-[#2D2825]">
              No se encontraron activos para "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-[12px] text-[#4A6B5B] font-semibold underline cursor-pointer"
            >
              Restablecer búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}