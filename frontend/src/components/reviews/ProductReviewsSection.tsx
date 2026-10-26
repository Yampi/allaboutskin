'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Send,
  Filter,
  User
} from 'lucide-react';
import {
  ProductReviewItem,
  ProductReviewsResponse,
  fetchProductReviews,
  submitProductReview,
  voteReviewHelpful,
  getCurrentUser
} from '@/lib/api';

interface ProductReviewsSectionProps {
  productSlug: string;
  productName: string;
  className?: string;
}

export default function ProductReviewsSection({
  productSlug,
  productName,
  className = '',
}: ProductReviewsSectionProps) {
  const [reviewsData, setReviewsData] = useState<ProductReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Form State
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newSkinType, setNewSkinType] = useState('');
  const [newUsageDuration, setNewUsageDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [votedReviews, setVotedReviews] = useState<{ [id: number]: boolean }>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState(false);

  const loadReviews = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchProductReviews(productSlug);
      setReviewsData(data);
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
      setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar las opiniones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  // Opinar y votar requieren sesión (el backend responde 401 sin token)
  const requireLogin = () => {
    if (getCurrentUser()?.token) return true;
    setLoginNotice(true);
    return false;
  };

  const handleHelpful = async (reviewId: number) => {
    if (votedReviews[reviewId] || !requireLogin()) return;
    try {
      await voteReviewHelpful(reviewId);
      setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
      setReviewsData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
          ),
        };
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    setSubmitFeedback(null);
    try {
      await submitProductReview(productSlug, {
        rating: newRating,
        title: newTitle,
        comment: newComment,
        user_skin_type: newSkinType || undefined,
        usage_duration: newUsageDuration || undefined,
      });

      setSubmitFeedback('¡Gracias por tu opinión! Se ha publicado con éxito.');
      setTimeout(() => {
        setIsWriteModalOpen(false);
        setSubmitFeedback(null);
        setNewTitle('');
        setNewComment('');
        loadReviews();
      }, 1500);
    } catch (error: unknown) {
      setSubmitFeedback(error instanceof Error ? error.message : 'Error al enviar opinión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviewsData?.reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  }) || [];

  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6 ${className}`}>
      {/* Header Reseñas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold border border-[#D5E2DB]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Opiniones & Calificaciones Reales</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#2D2825]">
            Experiencia de la Comunidad
          </h3>
          <p className="text-xs text-[#66615C]">
            Evaluaciones dermatológicas y vivencias de usuarios con {productName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => requireLogin() && setIsWriteModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Calificar Producto</span>
        </button>
      </div>

      {loginNotice && (
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E1D7] text-xs text-[#4A4540]">
          Para opinar o votar necesitas una cuenta.{' '}
          <a href="/login" className="font-bold text-[#2E7D5B] underline">Inicia sesión</a> o{' '}
          <a href="/registro" className="font-bold text-[#2E7D5B] underline">regístrate gratis</a>.
        </div>
      )}

      {loadError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3">
          <span>No se pudieron cargar las opiniones: {loadError}</span>
          <button type="button" onClick={loadReviews} className="font-bold underline cursor-pointer">
            Reintentar
          </button>
        </div>
      )}

      {/* Resumen de Calificación Doble (Estrellas + Métricas) */}
      {reviewsData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7]">
          {/* Calificación Promedio */}
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-4xl font-black text-[#2D2825]">
                {reviewsData.average_rating ?? '—'}
              </span>
              <span className="text-sm font-bold text-[#8C827A]">/ 5.0</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(reviewsData.average_rating ?? 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] font-semibold text-[#66615C]">
              {reviewsData.total_reviews === 0
                ? 'Aún no hay opiniones'
                : `Basado en ${reviewsData.total_reviews} ${reviewsData.total_reviews === 1 ? 'opinión' : 'opiniones'}`}
            </p>
          </div>

          {/* Barras de Distribución de Estrellas */}
          <div className="md:col-span-8 space-y-1.5 border-t md:border-t-0 md:border-l border-[#E8E1D7] pt-4 md:pt-0 md:pl-6">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewsData.stars_breakdown[stars] || 0;
              const pct = reviewsData.total_reviews > 0 ? (count / reviewsData.total_reviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-bold text-[#66615C] text-right flex items-center justify-end gap-0.5">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 bg-[#E8E1D7]/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[11px] font-semibold text-[#8C827A] text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros rápidos por estrellas */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-[#66615C] flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-[#2E7D5B]" />
          Filtrar:
        </span>
        <button
          type="button"
          onClick={() => setFilterRating('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
            filterRating === 'all'
              ? 'bg-[#2E7D5B] text-white shadow-2xs'
              : 'bg-[#FAF8F5] text-[#66615C] hover:bg-[#EFECE6]'
          }`}
        >
          Todas ({reviewsData?.total_reviews || 0})
        </button>
        {[5, 4, 3, 2, 1].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterRating(st)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterRating === st
                ? 'bg-[#2E7D5B] text-white shadow-2xs'
                : 'bg-[#FAF8F5] text-[#66615C] hover:bg-[#EFECE6]'
            }`}
          >
            <span>{st}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>({reviewsData?.stars_breakdown[st] || 0})</span>
          </button>
        ))}
      </div>

      {/* Lista de Opiniones */}
      <div className="space-y-4 pt-2">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#E8E1D7] text-[#8C827A] space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-[#2E7D5B]/50" />
            <p className="text-sm font-bold text-[#2D2825]">
              No hay opiniones con {filterRating} estrellas aún
            </p>
            <p className="text-xs">
              Sé el primero en compartir tu experiencia con este cosmético.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-3 hover:border-[#2E7D5B]/30 transition"
            >
              {/* Usuario, Calificación y Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-black text-xs flex items-center justify-center">
                    {rev.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-[#2D2825]">
                        {rev.user_name}
                      </span>
                      {rev.is_verified && (
                        <span
                          title="Tiene este producto en su rutina"
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-1.5 py-0.2 rounded-full"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Lo usa en su rutina
                        </span>
                      )}
                    </div>
                    {(rev.user_skin_type || rev.usage_duration) && (
                      <span className="text-[10px] text-[#8C827A] font-semibold block">
                        {[rev.user_skin_type, rev.usage_duration && `Uso: ${rev.usage_duration}`].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estrellas */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Título y Comentario */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-[#2D2825]">
                  {rev.title}
                </h4>
                <p className="text-xs text-[#4A4540] leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Footer de la Opinión con Voto Útil */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E8E1D7]/70 text-[11px] text-[#8C827A]">
                <span>
                  {new Date(rev.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>

                <button
                  type="button"
                  onClick={() => handleHelpful(rev.id)}
                  disabled={votedReviews[rev.id]}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    votedReviews[rev.id]
                      ? 'bg-[#E6F4EC] text-[#2E7D5B]'
                      : 'bg-white border border-[#E8E1D7] hover:bg-[#FAF8F5] text-[#66615C]'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>
                    {votedReviews[rev.id] ? '¡Te resultó útil!' : '¿Te fue útil?'} ({rev.helpful_count})
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para escribir opinión */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 sm:p-7 space-y-5 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-2.5 py-0.5 rounded-full">
                  Tu Calificación
                </span>
                <h3 className="text-base font-extrabold text-[#2D2825] mt-1">
                  Opina sobre {productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-full text-[#8C827A] hover:text-[#2D2825] hover:bg-[#FAF8F5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Selector de Estrellas */}
              <div className="space-y-1 text-center py-2 bg-[#FAFAF7] rounded-2xl border border-[#E8E1D7]">
                <span className="text-xs font-bold text-[#66615C] block">
                  ¿Cuántas estrellas le das a este producto?
                </span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewRating(st)}
                      className="p-1 transition transform hover:scale-115 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          st <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-extrabold text-[#2E7D5B]">
                  {newRating === 5
                    ? 'Excelente · Muy recomendado'
                    : newRating === 4
                    ? 'Muy bueno · Efectivo'
                    : newRating === 3
                    ? 'Regular · Esperaba más'
                    : newRating === 2
                    ? 'Poco favorable'
                    : 'No me funcionó'}
                </span>
              </div>

              {/* Título de la opinión */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D2825]">
                  Título resumido
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Reducción de brillo en 2 semanas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D7] text-xs font-medium focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B]"
                />
              </div>

              {/* Comentario detallado */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D2825]">
                  Tu opinión detallada
                </label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Cuéntanos cómo reaccionó tu piel, en qué paso del ciclo lo usaste y qué cambios observaste..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D7] text-xs font-medium focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B] resize-none"
                />
              </div>

              {/* Metadatos: Tipo de piel y tiempo de uso */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#66615C]">
                    Tu Tipo de Piel
                  </label>
                  <select
                    value={newSkinType}
                    onChange={(e) => setNewSkinType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E1D7] text-xs font-medium bg-white"
                  >
                    <option value="">Prefiero no decirlo</option>
                    <option value="Piel Grasa">Piel Grasa</option>
                    <option value="Piel Mixta">Piel Mixta</option>
                    <option value="Piel Seca">Piel Seca</option>
                    <option value="Piel Sensible">Piel Sensible</option>
                    <option value="Piel Equilibrada">Piel Equilibrada</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#66615C]">
                    Tiempo de Uso
                  </label>
                  <select
                    value={newUsageDuration}
                    onChange={(e) => setNewUsageDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E1D7] text-xs font-medium bg-white"
                  >
                    <option value="">Prefiero no decirlo</option>
                    <option value="1 a 2 semanas">1 a 2 semanas</option>
                    <option value="3 a 4 semanas">3 a 4 semanas</option>
                    <option value="2 a 3 meses">2 a 3 meses</option>
                    <option value="Más de 3 meses">Más de 3 meses</option>
                  </select>
                </div>
              </div>

              {/* Feedback o Error */}
              {submitFeedback && (
                <div className="p-3 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold text-center">
                  {submitFeedback}
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E8E1D7] text-xs font-bold text-[#66615C] hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publicando...' : 'Publicar Opinión'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
