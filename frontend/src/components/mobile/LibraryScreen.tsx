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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Editorial & Buscador (Input estilo píldora) */}
      <div className="card-sand p-5 sm:p-8 border border-[#E2D9CD] relative overflow-hidden shadow-diffuse rounded-[24px]">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#8FA89B]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[11px] font-sans font-bold uppercase tracking-wider">
              Enciclopedia Farmacológica & CosIng
            </span>
            <span className="text-[12px] font-sans text-[#7E756F] hidden sm:inline">
              • {activeIngredientsList.length} Moléculas Indexadas
            </span>
          </div>

          <h1 className="font-serif text-[26px] sm:text-[34px] font-semibold text-[#2D2825] leading-tight">
            Biblioteca de Activos Dermatológicos
          </h1>

          <p className="text-[13.5px] sm:text-[15px] font-sans text-[#4A433E] mt-2 leading-relaxed max-w-2xl">
            Explora las propiedades químicas, mecanismos moleculares de acción y concentraciones óptimas validadas en literatura médica.
          </p>

          {/* Search bar input */}
          <div className="mt-5 max-w-2xl relative flex items-center">
            <Search className="w-4 h-4 text-[#7E756F] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar activo por nombre común, nomenclatura INCI o beneficio dérmico..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-full bg-white border border-[#E8E1D7] text-[#2D2825] text-[13px] sm:text-[14px] font-sans placeholder-[#9D948B] focus:outline-none focus:border-[#8FA89B] focus:ring-1 focus:ring-[#8FA89B] shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-[#7E756F] hover:text-[#2D2825] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#4A6B5B] text-white border-[#4A6B5B] shadow-xs'
                    : 'bg-white/80 text-[#4A433E] border-[#E2D9CD] hover:border-[#8FA89B]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Grid de Activos (Desktop: 3-4 Columnas / Mobile: 2 Columnas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-section-h3 text-[#7E756F]">
            MOLÉCULAS ENCONTRADAS ({filteredIngredients.length})
          </span>
          <span className="text-[12px] font-sans text-[#4A6B5B]">
            Toca una tarjeta para abrir la ficha clínica
          </span>
        </div>

        {/* Responsive Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              onClick={() => onSelectIngredient(ingredient)}
              className="card-white p-3.5 sm:p-4 border border-[#E8E1D7] rounded-[20px] flex flex-col justify-between hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition cursor-pointer group"
            >
              <div>
                {/* Macro Photography Container */}
                <div className="relative h-32 sm:h-36 w-full rounded-[16px] overflow-hidden bg-[#FAF8F5] border border-[#E2D9CD] mb-3">
                  <img
                    src={ingredient.macroImage}
                    alt={ingredient.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-xs text-white text-[9px] font-mono font-medium">
                      {ingredient.recommendedConcentration}
                    </span>
                  </div>
                </div>

                {/* Category metadata */}
                <span className="text-[10px] font-bold text-[#7E756F] uppercase tracking-wider block">
                  {ingredient.categoryLabel}
                </span>

                <h4 className="font-serif text-[16px] sm:text-[17px] font-semibold text-[#2D2825] mt-0.5 leading-tight group-hover:text-[#4A6B5B] transition">
                  {ingredient.name}
                </h4>

                <p className="text-[11.5px] font-mono text-[#9D948B] mt-0.5 line-clamp-1">
                  {ingredient.inci}
                </p>

                <p className="text-[12px] font-sans text-[#4A433E] mt-2 line-clamp-2 leading-snug">
                  {ingredient.shortDescription}
                </p>
              </div>

              {/* Badges Footer with PubMed and CosIng */}
              <div className="mt-4 pt-2.5 border-t border-[#E8E1D7] flex items-center justify-between text-[11px]">
                <span className="text-[#4A6B5B] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PubMed
                </span>
                <span className="text-[#7E756F] font-mono font-medium">
                  {ingredient.pubmedCount.toLocaleString()}+ estudios
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredIngredients.length === 0 && (
          <div className="card-sand p-10 text-center text-[#7E756F] space-y-3 rounded-[24px]">
            <BookOpen className="w-10 h-10 mx-auto text-[#8FA89B]" />
            <p className="font-serif text-[18px] text-[#2D2825]">
              No se encontraron activos para "{searchQuery}"
            </p>
            <p className="text-[13px]">
              Prueba buscando por nombre genérico o seleccionando "Todos los Activos".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2 rounded-full bg-[#8FA89B] text-white text-[13px] font-medium shadow-xs hover:bg-[#7D978A] cursor-pointer"
            >
              Restablecer Búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}