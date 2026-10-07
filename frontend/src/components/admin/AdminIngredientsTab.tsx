'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Search,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Microscope,
  ShieldCheck,
  AlertTriangle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Sun,
  Moon,
  Scale
} from 'lucide-react';
import {
  fetchAdminIngredients,
  fetchAdminIngredientDetail,
  AdminIngredientItem,
  AdminIngredientDetail
} from '@/lib/api';

export default function AdminIngredientsTab() {
  // Estado de lista y filtros
  const [ingredients, setIngredients] = useState<AdminIngredientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVES' | 'EXCIPIENTS'>('ALL');
  const [timingFilter, setTimingFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('inci_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal de Ficha Técnica Científica
  const [selectedIngredient, setSelectedIngredient] = useState<AdminIngredientDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Carga de ingredientes
  const loadIngredients = async (page = 1) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const activeParam = activeFilter === 'ACTIVES' ? true : activeFilter === 'EXCIPIENTS' ? false : undefined;
      const res = await fetchAdminIngredients({
        q: searchQuery.trim() || undefined,
        is_active: activeParam,
        evidence_level: evidenceFilter || undefined,
        timing: timingFilter || undefined,
        sort_by: sortBy,
        order: sortOrder,
        page,
        per_page: 20,
      });

      setIngredients(res.data);
      setCurrentPage(res.current_page);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al conectar con la base de datos de ingredientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients(1);
  }, [evidenceFilter, activeFilter, timingFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadIngredients(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setEvidenceFilter('');
    setActiveFilter('ALL');
    setTimingFilter('');
    setSortBy('inci_name');
    setSortOrder('asc');
  };

  // Abrir Ficha Científica Completa
  const handleOpenDetail = async (ingredientId: number) => {
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedIngredient(null);
    try {
      const detail = await fetchAdminIngredientDetail(ingredientId);
      setSelectedIngredient(detail);
    } catch (err: any) {
      setErrorNotice(err.message || 'No fue posible cargar el dossier del componente.');
      setIsModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Cálculo de KPIs rápidos en base a la página actual y totales
  const activesCount = ingredients.filter(i => i.is_active).length;
  const gradeACount = ingredients.filter(i => i.evidence_level === 'A').length;

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Bar DLG-EXEC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E1D7] shadow-xs p-5 rounded-2xl">
          <span className="text-xs font-bold text-[#7E756F] uppercase tracking-wider block">Total Componentes</span>
          <div className="text-2xl font-black text-[#2D2825] mt-1">
            {totalCount}
          </div>
          <p className="text-[11px] text-[#9D948B] mt-1">Nomenclaturas INCI registradas</p>
        </div>

        <div className="bg-white border border-[#E8E1D7] shadow-xs p-5 rounded-2xl">
          <span className="text-xs font-bold text-[#7E756F] uppercase tracking-wider block">Activos Clínicos</span>
          <div className="text-2xl font-black text-[#4A6B5B] mt-1">
            {ingredients.filter(i => i.is_active).length} <span className="text-xs font-normal text-[#7E756F]">(en vista)</span>
          </div>
          <p className="text-[11px] text-[#9D948B] mt-1">Con acción biológica declarada</p>
        </div>

        <div className="bg-white border border-[#E8E1D7] shadow-xs p-5 rounded-2xl">
          <span className="text-xs font-bold text-[#7E756F] uppercase tracking-wider block">Alta Evidencia (Grado A/B)</span>
          <div className="text-2xl font-black text-[#2D2825] mt-1">
            {ingredients.filter(i => i.evidence_level === 'A' || i.evidence_level === 'B').length}
          </div>
          <p className="text-[11px] text-[#9D948B] mt-1">Respaldo en ensayos clínicos controlados</p>
        </div>

        <div className="bg-white border border-[#E8E1D7] shadow-xs p-5 rounded-2xl">
          <span className="text-xs font-bold text-[#7E756F] uppercase tracking-wider block">Trazabilidad Oficial</span>
          <div className="text-2xl font-black text-[#0D9488] mt-1">
            CosIng / PubMed
          </div>
          <p className="text-[11px] text-[#9D948B] mt-1">Reglamento CE 1223/2009 e indexación NLM</p>
        </div>
      </div>

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Barra de Búsqueda y Filtros DLG-EXEC */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E1D7] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9D948B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar componente por nombre INCI, nombre común (ej. Niacinamida, Retinol) o número CAS..."
              className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2825] placeholder-[#9D948B] focus:outline-none focus:border-[#4A6B5B] focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#4A6B5B] hover:bg-[#3D5A4C] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </form>

        {/* Filtros Dropdown DLG-EXEC */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-[#E8E1D7]/60 text-xs">
          {/* Nivel de Evidencia */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7E756F] mb-1">Nivel de Evidencia</label>
            <select
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2825] focus:outline-none focus:border-[#4A6B5B]"
            >
              <option value="">Todos los niveles</option>
              <option value="A">Grado A: Alta evidencia clínica (RCTs)</option>
              <option value="B">Grado B: Evidencia moderada (in vivo)</option>
              <option value="C">Grado C: Preliminar (ex vivo/abierto)</option>
              <option value="D">Grado D: Mecanística básica (in vitro)</option>
            </select>
          </div>

          {/* Tipo de Componente */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7E756F] mb-1">Tipo de Componente</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2825] focus:outline-none focus:border-[#4A6B5B]"
            >
              <option value="ALL">Todos los componentes</option>
              <option value="ACTIVES">Solo Activos Funcionales</option>
              <option value="EXCIPIENTS">Excipientes y Solventes</option>
            </select>
          </div>

          {/* Momento de Uso */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7E756F] mb-1">Momento Recomendado</label>
            <select
              value={timingFilter}
              onChange={(e) => setTimingFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2825] focus:outline-none focus:border-[#4A6B5B]"
            >
              <option value="">Indistinto / Todos</option>
              <option value="AM">Diurno (AM)</option>
              <option value="PM">Nocturno (PM)</option>
              <option value="BOTH">Día y Noche (Ambos)</option>
            </select>
          </div>

          {/* Ordenación */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7E756F] mb-1">Ordenar Por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2825] focus:outline-none focus:border-[#4A6B5B]"
            >
              <option value="inci_name">Nombre INCI (Alfabético)</option>
              <option value="evidence_level">Nivel de Evidencia</option>
              <option value="products_count">Fórmulas en Catálogo</option>
              <option value="comedogenic_rating">Índice Comedogénico</option>
              <option value="irritation_rating">Índice de Irritación</option>
            </select>
          </div>

          {/* Acciones Reset */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-lg border border-[#E8E1D7] hover:bg-[#FAF8F5] text-[#7E756F] hover:text-[#2D2825] text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3 text-[#9D948B]" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Data Grid de Componentes DLG-EXEC */}
      <div className="bg-white rounded-2xl border border-[#E8E1D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8E1D7] text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7E756F] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-5 py-3.5">Componente (INCI & Común)</th>
                <th scope="col" className="px-4 py-3.5">Evidencia Científica</th>
                <th scope="col" className="px-4 py-3.5">Perfil Fisicoquímico</th>
                <th scope="col" className="px-4 py-3.5">Uso & Seguridad</th>
                <th scope="col" className="px-4 py-3.5 text-center">En Catálogo</th>
                <th scope="col" className="px-5 py-3.5 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D7]/70 text-[#2D2825]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-flex items-center gap-2.5 text-xs text-[#7E756F] font-medium">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#4A6B5B]" />
                      <span>Cargando biblioteca de componentes...</span>
                    </div>
                  </td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center space-y-2">
                    <FlaskConical className="w-8 h-8 text-[#9D948B] mx-auto opacity-60" />
                    <p className="text-xs font-semibold text-[#2D2825]">No se encontraron componentes con los filtros aplicados</p>
                    <p className="text-[11px] text-[#7E756F]">Prueba cambiando los términos de búsqueda o restableciendo los selectores.</p>
                  </td>
                </tr>
              ) : (
                ingredients.map((item) => {
                  // Badges de evidencia sobrios DLG-EXEC
                  const evidenceBadge = {
                    A: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    B: 'bg-teal-50 text-teal-800 border-teal-200',
                    C: 'bg-amber-50 text-amber-800 border-amber-200',
                    D: 'bg-slate-50 text-slate-700 border-slate-200',
                  }[item.evidence_level || 'D'] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item.id)}
                      className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group"
                    >
                      {/* Componente */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D2825] group-hover:text-[#4A6B5B] transition-colors">
                            {item.inci_name}
                          </span>
                          {item.is_active && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EBF1EE] text-[#4A6B5B] border border-[#D5E2DB]">
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#7E756F] mt-0.5 truncate max-w-xs">
                          {item.common_name || 'Sin denominación común'}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9D948B] font-mono">
                          {item.cas_number && <span>CAS: {item.cas_number}</span>}
                          {item.cosing_id && <span>• CosIng #{item.cosing_id}</span>}
                        </div>
                      </td>

                      {/* Evidencia Científica */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${evidenceBadge}`}>
                            Grado {item.evidence_level || 'D'}
                          </span>
                          <span className="text-[11px] text-[#7E756F] block truncate max-w-[180px]">
                            {item.source_name || 'CosIng UE / PubMed'}
                          </span>
                        </div>
                      </td>

                      {/* Fisicoquímica */}
                      <td className="px-4 py-3.5">
                        <div className="text-[11px] space-y-0.5">
                          <div>
                            <span className="text-[#9D948B]">pH: </span>
                            <span className="font-mono text-[#2D2825]">
                              {item.optimal_ph_min && item.optimal_ph_max
                                ? `${item.optimal_ph_min} - ${item.optimal_ph_max}`
                                : 'Neutro / N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#7E756F]">
                            <span>Comedogénico: <strong className="text-[#2D2825]">{item.comedogenic_rating}/5</strong></span>
                            <span>•</span>
                            <span>Irritabilidad: <strong className="text-[#2D2825]">{item.irritation_rating}/5</strong></span>
                          </div>
                        </div>
                      </td>

                      {/* Uso & Seguridad */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2D2825]">
                            {item.recommended_timing === 'AM' && <Sun className="w-3 h-3 text-amber-600" />}
                            {item.recommended_timing === 'PM' && <Moon className="w-3 h-3 text-indigo-600" />}
                            {item.recommended_timing === 'BOTH' && <Sparkles className="w-3 h-3 text-[#4A6B5B]" />}
                            <span>{item.recommended_timing === 'AM' ? 'Diurno' : item.recommended_timing === 'PM' ? 'Nocturno' : 'Día / Noche'}</span>
                          </span>

                          <div className="flex items-center gap-1 text-[10px]">
                            {item.is_uv_sensitizing && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                Fotosensibilizante
                              </span>
                            )}
                            {item.requires_sunscreen && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                Requiere FPS
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* En Catálogo */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF8F5] text-[#2D2825] border border-[#E8E1D7]">
                          {item.products_count ?? 0}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(item.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E1D7] bg-white hover:bg-[#FAF8F5] text-[#2D2825] text-xs font-semibold shadow-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#4A6B5B]" />
                          <span>Ver Ficha</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador DLG-EXEC */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-[#E8E1D7] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7E756F]">
            <div>
              Mostrando página <strong className="text-[#2D2825]">{currentPage}</strong> de <strong className="text-[#2D2825]">{totalPages}</strong> ({totalCount} componentes en total)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadIngredients(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#E8E1D7] bg-white text-[#2D2825] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => loadIngredients(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#E8E1D7] bg-white text-[#2D2825] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal / Drawer de Ficha Técnica Exhaustiva DLG-EXEC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E8E1D7] pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EBF1EE] text-[#4A6B5B] border border-[#D5E2DB] text-xs font-mono font-bold uppercase">
                    Ficha Técnica INCI #{selectedIngredient?.id || '...'}
                  </span>
                  {selectedIngredient?.is_active && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                      Activo Clínico
                    </span>
                  )}
                  {selectedIngredient?.evidence_level && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Evidencia Grado {selectedIngredient.evidence_level}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2825] mt-2 tracking-tight">
                  {selectedIngredient?.inci_name || 'Cargando componente...'}
                </h2>
                <p className="text-xs sm:text-sm text-[#7E756F] mt-1">
                  {selectedIngredient?.common_name || 'Denominación química oficial'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#9D948B] hover:text-[#2D2825] hover:bg-[#FAF8F5] transition"
                aria-label="Cerrar ficha"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {isLoadingDetail || !selectedIngredient ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#4A6B5B] animate-spin mx-auto" />
                <p className="text-xs font-semibold text-[#7E756F]">Recuperando dossier científico y colisiones químicas...</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-[#2D2825]">
                {/* A. Resumen y Trazabilidad Regulatoria */}
                <div className="rounded-xl border border-[#E8E1D7] bg-[#FAF8F5] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#2D2825]">
                    <ShieldCheck className="w-4 h-4 text-[#4A6B5B]" />
                    <span>Respaldo Científico & Trazabilidad Regulatoria</span>
                  </div>

                  <p className="text-xs text-[#7E756F] leading-relaxed">
                    {selectedIngredient.evidence_grade_description || 'Evaluación científica conforme a la literatura biomédica indexada.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] border-t border-[#E8E1D7]/70">
                    <div>
                      <span className="text-[#9D948B] block">Fuente Científica:</span>
                      <strong className="text-[#2D2825]">{selectedIngredient.source_name || 'CosIng UE / PubMed'}</strong>
                    </div>
                    <div>
                      <span className="text-[#9D948B] block">Licencia de Datos:</span>
                      <strong className="text-[#2D2825]">{selectedIngredient.source_license || 'EU Open Data / Public Domain'}</strong>
                    </div>
                    <div>
                      <span className="text-[#9D948B] block">Revisión Técnica:</span>
                      <strong className="text-[#2D2825]">
                        {selectedIngredient.reviewed_at ? new Date(selectedIngredient.reviewed_at).toLocaleDateString('es-VE') : 'Vigente (2026)'}
                      </strong>
                    </div>
                  </div>

                  {selectedIngredient.source_url && (
                    <div className="pt-1">
                      <a
                        href={selectedIngredient.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#4A6B5B] hover:text-[#3D5A4C] font-semibold underline underline-offset-2"
                      >
                        <span>Consultar ficha en fuente oficial</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* B. Identificadores Oficiales & Fisicoquímica */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-[#E8E1D7] bg-white">
                    <span className="text-[10px] font-bold text-[#9D948B] uppercase tracking-wider block">Número CAS</span>
                    <span className="font-mono text-xs font-bold text-[#2D2825] mt-1 block">
                      {selectedIngredient.cas_number || 'No asignado'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#E8E1D7] bg-white">
                    <span className="text-[10px] font-bold text-[#9D948B] uppercase tracking-wider block">CosIng ID</span>
                    <span className="font-mono text-xs font-bold text-[#2D2825] mt-1 block">
                      {selectedIngredient.cosing_id ? `#${selectedIngredient.cosing_id}` : 'No disponible'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#E8E1D7] bg-white">
                    <span className="text-[10px] font-bold text-[#9D948B] uppercase tracking-wider block">Rango de pH Óptimo</span>
                    <span className="font-mono text-xs font-bold text-[#4A6B5B] mt-1 block">
                      {selectedIngredient.optimal_ph_min && selectedIngredient.optimal_ph_max
                        ? `${selectedIngredient.optimal_ph_min} - ${selectedIngredient.optimal_ph_max}`
                        : 'Neutro / Universal'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#E8E1D7] bg-white">
                    <span className="text-[10px] font-bold text-[#9D948B] uppercase tracking-wider block">Peso Molecular</span>
                    <span className="font-mono text-xs font-bold text-[#2D2825] mt-1 block">
                      {selectedIngredient.molecular_weight ? `${selectedIngredient.molecular_weight} Da` : '< 500 Da (Estándar)'}
                    </span>
                  </div>
                </div>

                {/* C. Tolerancia Dérmica & Reglas de Uso */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#E8E1D7] bg-white space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#2D2825]">
                      <Scale className="w-4 h-4 text-[#7E756F]" />
                      <span>Índices de Tolerancia Cutánea</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E1D7]/60">
                      <span className="text-[#7E756F]">Escala Comedogénica:</span>
                      <strong className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        selectedIngredient.comedogenic_rating === 0
                          ? 'bg-emerald-50 text-emerald-800'
                          : selectedIngredient.comedogenic_rating <= 2
                          ? 'bg-teal-50 text-teal-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {selectedIngredient.comedogenic_rating} / 5 ({selectedIngredient.comedogenic_rating === 0 ? 'Nulo' : selectedIngredient.comedogenic_rating <= 2 ? 'Bajo' : 'Moderado/Alto'})
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E1D7]/60">
                      <span className="text-[#7E756F]">Índice de Irritación:</span>
                      <strong className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        selectedIngredient.irritation_rating === 0
                          ? 'bg-emerald-50 text-emerald-800'
                          : selectedIngredient.irritation_rating <= 2
                          ? 'bg-teal-50 text-teal-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {selectedIngredient.irritation_rating} / 5 ({selectedIngredient.irritation_rating === 0 ? 'Hipoalergénico' : selectedIngredient.irritation_rating <= 2 ? 'Bajo' : 'Potencial Irritante'})
                      </strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E8E1D7] bg-white space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#2D2825]">
                      <Layers className="w-4 h-4 text-[#7E756F]" />
                      <span>Rutina & Layering</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E1D7]/60">
                      <span className="text-[#7E756F]">Fase de Aplicación:</span>
                      <strong className="text-[#2D2825] font-mono">
                        {selectedIngredient.layering_category || 'Sérum Acuoso'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E1D7]/60">
                      <span className="text-[#7E756F]">Timeline de Resultados:</span>
                      <strong className="text-[#2D2825]">
                        {selectedIngredient.results_timeline_weeks_min && selectedIngredient.results_timeline_weeks_max
                          ? `${selectedIngredient.results_timeline_weeks_min} a ${selectedIngredient.results_timeline_weeks_max} semanas`
                          : '4 a 8 semanas promedio'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* D. Descripción y Funciones CosIng */}
                {selectedIngredient.description && (
                  <div className="p-4 rounded-xl border border-[#E8E1D7] bg-white space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E756F] block">
                      Descripción Clínica & Mecanismo de Acción
                    </span>
                    <p className="text-xs text-[#2D2825] leading-relaxed">
                      {selectedIngredient.description}
                    </p>
                    {selectedIngredient.cosing_functions && selectedIngredient.cosing_functions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {selectedIngredient.cosing_functions.map((fn, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF8F5] text-[#4A6B5B] border border-[#E8E1D7]"
                          >
                            {fn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* E. Conflictos Químicos & Colisiones de Rutina */}
                {((selectedIngredient.conflicts_as_a && selectedIngredient.conflicts_as_a.length > 0) ||
                  (selectedIngredient.conflicts_as_b && selectedIngredient.conflicts_as_b.length > 0)) && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>Colisiones Químicas Detectadas en Rutina</span>
                    </div>
                    <div className="space-y-2 pt-1">
                      {selectedIngredient.conflicts_as_a?.map((conf, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-[11px]">
                          <strong className="text-[#2D2825]">Incompatible con: {conf.ingredient_b?.inci_name || 'Compuesto reactivo'}</strong>
                          <p className="text-[#7E756F] mt-0.5">{conf.interaction_mechanism || conf.mitigation_recommendation}</p>
                        </div>
                      ))}
                      {selectedIngredient.conflicts_as_b?.map((conf, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-[11px]">
                          <strong className="text-[#2D2825]">Incompatible con: {conf.ingredient_a?.inci_name || 'Compuesto reactivo'}</strong>
                          <p className="text-[#7E756F] mt-0.5">{conf.interaction_mechanism || conf.mitigation_recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* F. Estudios PubMed Indexados */}
                {selectedIngredient.pubmed_studies && selectedIngredient.pubmed_studies.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#2D2825]">
                      <Microscope className="w-4 h-4 text-[#4A6B5B]" />
                      <span>Estudios Biomédicos Indexados en PubMed (NCBI)</span>
                    </div>
                    <div className="space-y-2">
                      {selectedIngredient.pubmed_studies.map((study) => (
                        <div key={study.id} className="p-3.5 rounded-xl border border-[#E8E1D7] bg-white space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[#2D2825] leading-snug">{study.title}</span>
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-[#4A6B5B] hover:underline flex items-center gap-1 shrink-0"
                            >
                              <span>PMID: {study.pmid}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#9D948B]">
                            {study.journal && <span>{study.journal}</span>}
                            {study.publication_year && <span>• {study.publication_year}</span>}
                            {study.study_type && <span>• {study.study_type}</span>}
                          </div>
                          {study.pivot?.primary_finding && (
                            <p className="text-[11px] text-[#7E756F] italic pt-1 border-t border-[#E8E1D7]/50">
                              "{study.pivot.primary_finding}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* G. Cosméticos y Fórmulas Comerciales en Plataforma */}
                <div className="space-y-2 pt-2 border-t border-[#E8E1D7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#2D2825]">
                      <Package className="w-4 h-4 text-[#4A6B5B]" />
                      <span>Fórmulas en Catálogo que contienen este activo ({selectedIngredient.products?.length || 0})</span>
                    </div>
                  </div>

                  {selectedIngredient.products && selectedIngredient.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {selectedIngredient.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 rounded-xl border border-[#E8E1D7] bg-[#FAF8F5] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-[#2D2825] block truncate text-xs">{prod.name}</span>
                            <span className="text-[10px] text-[#7E756F] block">{prod.brand?.name || 'Marca certificada'}</span>
                          </div>
                          {prod.store_offers && prod.store_offers.length > 0 && (
                            <span className="text-[10px] font-mono font-bold text-[#4A6B5B] px-2 py-0.5 rounded bg-white border border-[#E8E1D7] shrink-0">
                              {prod.store_offers[0].formatted_price_usd}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7E756F] bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E1D7]">
                      Ningún producto del catálogo tiene asignado este ingrediente actualmente.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-[#E8E1D7]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#E8E1D7] bg-white hover:bg-[#FAF8F5] text-[#2D2825] text-xs font-bold transition shadow-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
