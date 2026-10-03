# Allabout.skin — Guía de Arquitectura para Evaluación por IAs

Este documento sintetiza la arquitectura, modelo de dominio, flujos de datos y diseño técnico del proyecto **Allabout.skin** para permitir una evaluación rápida, exhaustiva y contextualizada por modelos de Inteligencia Artificial y auditores de software.

---

## 1. Visión del Proyecto y Propósito
**Allabout.skin** es una plataforma integral de dermocosmética científica y e-commerce geolocalizado. Resuelve tres problemas críticos:
1. **Auditoría Científica de Fórmulas INCI:** Analiza la lista de ingredientes de cosméticos en busca de incompatibilidades químicas (pH, quelación, degradación de retinoides, sobrecarga de exfoliación), concentraciones efectivas y respaldo en estudios biomédicos indexados (PubMed).
2. **Catálogo y Scraper Multi-Plataforma Multi-País:** Rastreador inteligente capaz de auditar tiendas en línea (Shopify, VTEX, WooCommerce, Schema.org) en múltiples países (Venezuela, Chile, México, Colombia, España, Estados Unidos, Panamá), extrayendo precios, disponibilidad en anaqueles y normalizando pares cambiarios.
3. **Multi-Divisa Automática & Tasa Oficial:** Resuelve la disparidad de monedas locales (CLP, VES, MXN, COP, EUR, USD) vinculando cada tienda con su país de origen, calculando el precio tanto en moneda local como en USD ($) mediante tasas oficiales y de mercado en tiempo real.

---

## 2. Stack Tecnológico

### Backend (API REST & Motores de Inferencia)
- **Framework:** Laravel 12 (PHP 8.2+)
- **Base de Datos:** PostgreSQL 16 (Relacional con búsquedas `ILIKE`, índices EAN/GTIN y soporte geográfico)
- **Autenticación y RBAC:** Laravel Sanctum + Middleware de Roles (`admin`, `super_admin`, `business_owner`, `user`)
- **Scraping & Crawling:** HTTP Client resiliente con reintentos, bypass de detección, apollo state parser, JSON-LD extractor y rate limiting
- **Sincronización Cambiaria:** `ExchangeRateService` con doble capa: BCV oficial (VES <-> USD vía totoya.app) + Multi-moneda internacional (CLP, MXN, EUR, COP, USD vía API abierta con fallback offline)

### Frontend (Next.js WebApp)
- **Framework:** Next.js 16 (App Router, Server Components + Client Components, React 19)
- **Lenguaje:** TypeScript 5.5+
- **Estilos:** Tailwind CSS con tokens editoriales (`#FAF8F5`, `#2D4A3E`, tipografías serif clásicas y sans-serif modernas)
- **Iconografía:** Lucide React
- **Capas Especiales:** Escáner OCR de etiquetas cosméticas, Simulador AR de aplicación de mascarillas faciales (Three.js/Canvas) y comparador molecular de fórmulas.

---

## 3. Modelo de Dominio y Base de Datos (DDD)

### A. Núcleo Científico & Catálogo
- `Product` (`products`): Cosmético registrado con categoría (`CLEANSER`, `SERUM`, `MOISTURIZER`, `SPF`, `RETINOID`), envase, PAO (Period After Opening) y barcode EAN.
- `Brand` (`brands`): Laboratorio o marca fabricante con país de origen y verificación clínica.
- `Ingredient` (`ingredients`): Ficha INCI, CAS number, función dermocosmética, potencial comedogénico e irritante, fuente científica oficial (`source_name`, `source_url`), licencia de datos (`source_license`) y nivel de evidencia (`evidence_level` A-D).
- `IngredientConflict` (`ingredient_conflicts`): Reglas de incompatibilidad química (`PH_INCOMPATIBILITY`, `CHEMICAL_DEGRADATION`, `IRRITATION_OVERLOAD`, `CHELATION`).
- `ProductIngredient` (`product_ingredients`): Tabla pivot con orden de concentración porcentual y declaración de activo terapéutico.

### B. E-Commerce, Tiendas y Precios Multi-Divisa
- `AffiliateStore` (`affiliate_stores`): Establecimiento o farmacia aliada. Atributos: `country_code` (ISO 2: `VE`, `CL`, `MX`, `ES`, `US`, etc.), `country_name`, `country_flag`, `crawler_platform` (`SHOPIFY`, `VTEX`, `WOOCOMMERCE`, `SCHEMA_ORG`), `crawler_enabled`.
- `StoreBranch` (`store_branches`): Sucursal física geolocalizada con latitud, longitud, dirección y radio de geocerca para compras presenciales.
- `ProductStoreOffer` (`product_store_offers`):
  - `price`: Precio normalizado en Dólares Americanos ($ USD).
  - `price_local`: Monto en la moneda nativa de la tienda (ej. 14.500 CLP, 250 MXN, 35 EUR).
  - `currency_local`: Código ISO de divisa local (`CLP`, `VES`, `MXN`, `COP`, `EUR`, `USD`).
  - `price_ves`: Monto calculado en Bolívares (VES) bajo tasa oficial BCV.
  - Accessors: `formatted_price_usd`, `formatted_price_local`, `store_country_flag`, `store_country_name`.
- `ProductPriceHistory` (`product_price_histories`): Registro cronológico para analítica de inflación y descuentos reales.

### C. Usuario & Rutina Clínica
- `User` & `UserSkinProfile`: Biotipo cutáneo (`OILY`, `DRY`, `COMBINATION`, `SENSITIVE`), fototipo Fitzpatrick (1 a 6), estado de barrera cutánea.
- `UserRoutineItem` & `RoutineAdherenceLog`: Rutinas AM/PM y Skin Cycling (Noche Exfoliación -> Noche Retinoide -> Noche Recuperación).

---

## 4. Pipeline de Rastreo y Conectores
El pipeline de scraping procesa catálogos de cualquier e-commerce de la siguiente manera:
1. **Detección de Plataforma (`StorePlatformDetectorService`):** Identifica Shopify (`/search/suggest.json`, `cdn.shopify.com`), VTEX (GraphQL, `vtex_commertial_offer`), o WooCommerce (`wp-json/wc/store/v1`).
2. **Detección de País (`StoreCountryDetectorService`):** Analiza TLD del dominio (`.cl`, `.ve`, `.com.mx`), prefijos telefónicos (`+56`, `+58`, `+52`), palabras clave de logística (`Chilexpress`, `Pago Móvil`, `OXXO`) y schema.org `addressCountry`.
3. **Conectores Especializados:**
   - `ShopifyConnector`: Lee endpoints predictivos y maneja monedas con cero decimales (como el Peso Chileno `CLP`, evitando dividir erróneamente por 100).
   - `WooCommerceConnector`: Extrae precios y divisas nativas desde Store API.
   - `GenericWebPageScraper`: Extrae JSON-LD, microformatos y metaetiquetas OpenGraph/Product.
4. **Sincronización (`OfferSyncService`):**
   - Vincula por código EAN o similitud fonética/textual con productos existentes.
   - Almacena simultáneamente el precio internacional ($ USD) y la divisa local formateada.

---

## 5. Endpoints REST Clave
- `GET /api/v1/catalog/products`: Catálogo paginado con ofertas, tiendas asociadas, banderas de país y precios duales. Soporta filtros: `q`, `category`, `brand`, `ingredient`, `country` (código ISO).
- `GET /api/v1/catalog/ingredients/{slug}`: Ficha toxicológica y química del ingrediente con estudios PubMed.
- `POST /api/v1/audit/inci`: Auditoría instantánea de fórmula con detección de conflictos cruzados.
- `GET /api/v1/stores/nearby`: Búsqueda geolocalizada por radio en metros.
- `GET /api/v1/stores/branches/{slug}/products`: Productos en inventario para compras en tienda física.
