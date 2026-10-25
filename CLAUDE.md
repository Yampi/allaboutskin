# Allabout.skin

Plataforma de auditoría científica de skincare con tres portales: **Usuario B2C**, **Tienda/Farmacia B2B** y **SuperAdmin**.

## Estructura

- `backend/` — API REST en Laravel 12 + PostgreSQL. Lógica de negocio en `app/Domain/*` (Audit, Cosmetics, Evidence, Routine, Store…), scrapers en `app/Services/Scraper/` (conectores VTEX, Shopify, WooCommerce y Schema.org).
- `frontend/` — Next.js 16 (App Router). Llama al backend a través de rutas proxy en `src/app/api/v1/**`, que reenvían a `LARAVEL_API_URL`. Cliente HTTP en `src/lib/api.ts`, con circuit breaker en `src/lib/circuitBreaker.ts`.
- `mobile/` — App Android (escáner OCR con ML Kit).
- `tests/` — Runner E2E (`tests/e2e/runner.mjs`) y verificador de líneas por componente.
- `docs/commercial/` — Documentación comercial (B2C, B2B, marketing, inversores). La escribió una IA: sus cifras no están verificadas.

## Comandos

```bash
./run-dev.ps1                          # arranca API (:8000), scheduler y web (:3000)
cd backend && php artisan test         # tests backend (~90 s, necesita Postgres)
cd frontend && npm run typecheck       # tsc --noEmit, debe dar 0 errores
cd frontend && npm run lint
node tests/e2e/runner.mjs              # E2E
node tests/verify_line_counts.mjs      # tamaño de componentes
```

Los tests del backend usan la base de datos PostgreSQL `allaboutskin_test` (ver `backend/phpunit.xml`). No uses SQLite: el código usa SQL específico de Postgres, como `ILIKE`.

## Convenciones

- **Antes de dar algo por terminado:** `npm run typecheck` sin errores y `php artisan test` en verde.
- **Frontend:** `frontend/AGENTS.md` aplica. Next.js 16 tiene cambios incompatibles con versiones anteriores, así que consulta `frontend/node_modules/next/dist/docs/` antes de usar APIs de Next.
- **Componentes pequeños:** máximo 180 líneas por archivo (objetivo: 120). Los paneles admin y empresa ya están divididos en `src/components/admin/**`, `src/components/empresa/**` y `src/hooks/**`; sigue ese patrón.
- **Sin datos falsos:** nunca añadas fallbacks con datos mock o precios inventados. Ante un error, muestra un estado de error real (`ApiError`).
- **Escrituras en varias tablas:** siempre dentro de `DB::transaction(..., 5)`.
- **Parser INCI:** nunca cargues la tabla `ingredients` completa en memoria; usa consultas acotadas (`WHERE IN`, `LIMIT`).
- **Tests de rendimiento:** comprueba el número o la forma de las consultas, no los milisegundos de reloj (esos tests fallan según la máquina).
- **Idioma:** el texto visible y los comentarios están en español; los identificadores del código, en inglés.
- **Commits:** Conventional Commits en español (`fix(scraper): …`). Pide confirmación antes de commitear o hacer push.

## Deuda técnica conocida

- 51 archivos del frontend superan las 180 líneas. Los peores: `components/ar/FaceMaskArEngine.ts` (2.248), `lib/api.ts` (2.111), `app/escaner/page.tsx` (1.728) y `app/api/v1/audit/inci/route.ts` (1.258).
- `configureHttpClient()` está duplicado en los 4 conectores del scraper. Con los reintentos, una petición puede tardar ~30 s, no 8 s.
- La búsqueda aproximada del parser INCI toma 30 ingredientes arbitrarios cuando no hay candidatos por prefijo.
- El circuit breaker es global: 5 fallos de cualquier endpoint cortan todas las llamadas durante 30 s.
- Algunos tests del backend tardan ~10 s cada uno; probablemente hacen llamadas de red reales.
