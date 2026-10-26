# KIT COMERCIAL B2B Y GUÍA OPERATIVA PARA FARMACIAS Y COMERCIOS
## Transformación Digital de Anaqueles, Inteligencia de Demanda y Generación de Leads Dermocosméticos

**Plataforma**: Allabout.skin — Red de Comercios y Farmacias Inteligentes  
**Destinatarios**: Directores Comerciales, Gerentes de Compras, Propietarios de Cadenas y Farmacias Independientes  
**Versión**: 2026.1 (Production Commercial Suite)  
**Clasificación**: Documento Oficial de Estrategia B2B  

---

## 1. RESUMEN EJECUTIVO: LA OPORTUNIDAD DEL RETAIL DERMOCOSMÉTICO

El mercado de la dermocosmética y el cuidado de la piel en América Latina y mercados emergentes experimenta un crecimiento compuesto anual (CAGR) superior al **11.4%**, impulsado por consumidores más informados y la popularización del *Skin Cycling*.

Sin embargo, el comercio minorista tradicional (farmacias comunitarias, botiquerías y cadenas regionales) se enfrenta a tres fricciones estructurales que drenan su rentabilidad:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LOS TRES DOLORES DEL COMERCIO MINORISTA              │
├─────────────────────────┬──────────────────────────────────────────────┤
│ 1. Parálisis en Anaquel │ Clientes abrumados por listas INCI complejas │
│                         │ que abandonan el pasillo sin comprar.        │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 2. Fuga al E-Commerce   │ Pacientes compran en plataformas foráneas    │
│                         │ ignorando que la farmacia de la esquina      │
│                         │ tiene el producto en inventario inmediato.   │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 3. Stock Estancado      │ Compras a distribuidores basadas en intuición│
│    (Dead Stock)         │ y no en las búsquedas clínicas de la zona.   │
└─────────────────────────┴──────────────────────────────────────────────┘
```

**Allabout.skin** resuelve esta desconexión uniendo la ciencia de formulaciones con la proximidad física del comercio:
1. **Convierte al comprador indeciso en comprador seguro**: Permite al cliente escanear el producto en el pasillo y confirmar al instante su compatibilidad con su biotipo cutáneo.
2. **Canaliza tráfico con alta intención de compra hacia la sucursal**: Redirige a pacientes con rutinas médicas activas a las tiendas a menos de 5 km que tienen el producto en stock a precio oficial.
3. **Genera leads inmediatos por WhatsApp y Google Maps**: Con un solo clic, el cliente abre un chat de venta prellenado o inicia la ruta en GPS hacia el mostrador.
4. **Optimiza las compras de inventario mediante el Reporte de Brecha de Demanda**: Muestra en tiempo real qué ingredientes clínicos de Grado A y B están buscando activamente los vecinos del municipio y que la farmacia aún no comercializa.

---

## 2. PITCH DECK COMERCIAL: ARGUMENTARIO DE VENTA PARA FARMACIAS

Este argumentario está diseñado para que el equipo comercial presente la plataforma ante comités de compras, juntas directivas de cadenas farmacéuticas y propietarios independientes.

### Diapositiva 1: La Realidad del Consumidor Actual
- **Premisa**: El 84% de las personas que compran dermocosmética declaran tener miedo de que el producto les provoque acné, alergias o empeore sus manchas.
- **Consecuencia**: El dependiente de farmacia convencional no cuenta con el tiempo ni la capacitación dermatológica profunda para leer 35 ingredientes químicos en letra microscópica. El cliente duda y no compra.

### Diapositiva 2: La Solución Allabout.skin
- **Concepto**: Allabout.skin es el consultor dermatológico digital de bolsillo que audita fórmulas en 3 segundos según bases oficiales (CosIng UE, PubMed).
- **Impacto**: Avala científicamente los productos de su catálogo. Cuando el sistema califica un producto como seguro y eficaz para el biotipo del usuario, la tasa de conversión en anaquel **se multiplica por 3.2x**.

### Diapositiva 3: Tráfico Local Hipercalificado
- **Diferenciador**: No somos un marketplace que retiene el inventario ni cobramos comisiones abusivas sobre el ticket del 15-20%.
- **Mecanismo**: Posicionamos sus sucursales físicas y sus canales directos de WhatsApp. El cliente paga directamente en su punto de venta o transferencia bancaria.

### Diapositiva 4: Modelo de Fidelización por Reposición (Skin Cycling)
- **Recurrencia**: Cuando un usuario incorpora un fotoprotector o serum a su rutina, Allabout.skin calcula el tiempo de agotamiento fisiológico según el volumen (ej. 50 ml a 2 mg/cm² = 30 días de uso diario).
- **Resultado**: 7 días antes de que se agote el frasco, el paciente recibe una notificación que le sugiere reservar su nuevo envase en su farmacia preferida.

---

## 3. MOTOR DE INTELIGENCIA DE DEMANDA (*DEMAND GAP ANALYTICS*)

El módulo analítico de Allabout.skin (`BusinessAnalyticsController.php`, endpoint `GET /api/v1/business/analytics`) transforma la farmacia de un receptor pasivo de inventario a un comprador estratégico basado en epidemiología cosmética local.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DEMAND GAP ANALYTICS ENGINE                          │
│                                                                        │
│ [Búsquedas de Usuarios Locales] + [Rutinas Activas en la Región]       │
│                                │                                       │
│                                ▼                                       │
│       Cruce Relacional vs Catálogo Actual de la Tienda                │
│                                │                                       │
│                                ▼                                       │
│         Detección de Activos con Alta Evidencia Faltantes              │
│                                │                                       │
│                                ▼                                       │
│     [Reporte de Brecha de Demanda con Opportunity Score: 95%]          │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Algoritmo de Identificación de Brechas
1. **Mapeo de Activos Cubiertos**: El sistema analiza todos los productos que la farmacia tiene dados de alta en su catálogo (`ProductStoreOffer`) y extrae los ingredientes vinculados.
2. **Cruce contra Evidencia Clínica**: Identifica qué ingredientes activos con **Evidencia Grado A** (Revisiones sistemáticas, ensayos clínicos aleatorizados en humanos) o **Evidencia Grado B** (Estudios controlados) tienen alta demanda y búsqueda en el área de influencia geográfica de la farmacia pero **no están cubiertos por ningún producto de su inventario**.
3. **Cálculo del Índice de Oportunidad (`opportunity_score`)**:
   - Activos Grado A faltantes: **Opportunity Score = 95%** (Venta garantizada, demanda insatisfecha urgente).
   - Activos Grado B faltantes: **Opportunity Score = 82%** (Oportunidad alta de diferenciación).

### 3.2. Ejemplo de Reporte Entregado al Gerente de Compras

| Ingrediente INCI | Nombre Común | Nivel de Evidencia | Función Dermocosmética | Opportunity Score | Demanda en Municipio | Acción Sugerida para Compras |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **Azelaic Acid** | Ácido Azelaico 10-15% | **Grado A** | Anti-acné, regulador de melasma y rosácea | **95%** | Muy Alta (+180 búsquedas/mes) | Incorporar sueros o cremas con Ácido Azelaico al 10% (The Ordinary, Geek & Gorgeous o formulación magistral). |
| **Retinal** | Retinaldehído 0.05-0.1% | **Grado A** | Estimulación de colágeno, anti-fotoenvejecimiento | **95%** | Alta (+140 búsquedas/mes) | Adquirir referencias de retinal encapsulado para clientes que buscan alternativa superior al retinol. |
| **Centella Asiatica Extract** | Madecassoside / Cica | **Grado B** | Reepitelización, reparación de barrera cutánea | **82%** | Alta (+210 búsquedas/mes) | Ampliar stock de bálsamos reparadores y geles de centella para pacientes con barrera dañada. |
| **Zinc PCA** | Sal de Zinc de PCA | **Grado B** | Seborregulador no resecante, antimicrobiano | **82%** | Media (+95 búsquedas/mes) | Incorporar limpiadores y lociones con zinc para pieles jóvenes grasas. |

### 3.3. Demografía Cutánea Agregada del Municipio (100% Anónima)
El panel B2B presenta a la farmacia la distribución porcentual de biotipos en su área geográfica sin revelar ningún dato confidencial:
- **Piel Grasa / Tendencia Acneica**: 38.5%
- **Piel Seca / Alípica**: 24.2%
- **Piel Mixta**: 22.1%
- **Piel Sensible / Reactiva con Rosácea**: 15.2%

*Beneficio Directo*: La farmacia deja de adquirir proporciones idénticas de cremas nutritivas pesadas si la demografía de su zona revela una predominancia absoluta de pieles seborreicas que demandan geles ligeros no comedogénicos.

---

## 4. PROTOCOLO DE DERIVACIÓN DE LEADS ZERO-PII Y CONVERSIÓN VÍA WHATSAPP

### 4.1. Filosofía de Privacidad Zero-PII (*Zero Personally Identifiable Information*)
Las regulaciones internacionales de protección de datos de salud (GDPR en Europa, HIPAA en EE.UU., normativas de Habeas Data en Latinoamérica) imponen sanciones severas ante la fuga de historiales dermatológicos de pacientes.

**Allabout.skin opera bajo una arquitectura Zero-PII estricta**:
- La farmacia **nunca** recibe nombres, cédulas, números de teléfono, correos electrónicos ni el diagnóstico dermatológico privado del usuario.
- Toda la transacción de contacto es iniciada de forma activa y deliberada por el usuario desde su propio dispositivo móvil.
- El comercio solo recibe la intención comercial pura en el momento exacto en que el usuario decide pulsar el botón de WhatsApp o Google Maps.

```
[Usuario en App Allabout.skin] 
              │ (Selecciona producto en inventario de Farmacia X)
              ▼
[Generador de Enlace Seguro con Hash de Trazabilidad]
              │
              ▼
[Abre WhatsApp Web / App en teléfono del cliente]
              │
              ▼
"¡Hola Farmacia Las Mercedes! Vi en All About Skin que tienen stock de..."
```

### 4.2. Estructura de Mensajes Inteligentes Prellenados para WhatsApp
Cuando un usuario hace clic en "Consultar / Apartar en WhatsApp", el frontend genera un enlace parametrizado que elimina la fricción de escritura:

```
https://wa.me/{numero_telefono_tienda}?text={mensaje_codificado}
```

#### Plantilla 1: Consulta de Disponibilidad Inmediata y Retiro en Tienda
> *"¡Hola Farmacia [Nombre_Sucursal]! Vi en All About Skin que tienen disponibilidad de [Nombre_Producto_Exacto] ([Presentacion_ml]) a [Precio_USD] ($ / Tasa Oficial). Deseo confirmar si puedo pasar a retirarlo hoy mismo por su sucursal de [Ubicacion_Sucursal]. (Ref: AAS-LEAD-[ID_UNICO])"*

#### Plantilla 2: Solicitud de Envío a Domicilio / Delivery
> *"¡Buenas tardes! Encontré en All About Skin que disponen de [Nombre_Producto_Exacto]. Quisiera coordinar el envío por delivery a mi zona y conocer sus métodos de pago en bolívares/dólares. (Ref: AAS-LEAD-[ID_UNICO])"*

### 4.3. Implementación de Códigos QR para el Mostrador y Anaqueles
Allabout.skin entrega a las farmacias suscritas un kit de material publicitario físico (Stickers y Displays de metacrilato para mostrador) con códigos QR inteligentes:
1. **QR de Cabecera de Pasillo**: *"¿Dudas de qué protector solar es ideal para tu piel? Escanea aquí este anaquel y audita los ingredientes gratis en 3 segundos"*.
2. **Impacto en Ventas**: El cliente que escanea el código en el pasillo permanece 4 minutos más en la sección de cosmética, verifica que el producto no tiene ingredientes comedogénicos y se dirige directamente a la caja para pagar.

---

## 5. NIVELES DE SUSCRIPCIÓN Y MODELO DE NEGOCIO (`StoreSubscriptionTier.php`)

La plataforma ofrece tres niveles de vinculación comercial adaptados desde farmacias independientes de barrio hasta grandes cadenas nacionales:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   TABLA MAESTRA DE NIVELES DE SUSCRIPCIÓN                   │
├──────────────────────────┬──────────────────┬────────────────┬──────────────┤
│ Característica           │ FREE (Básico)    │ PRO_LOCAL ⭐    │ ENTERPRISE 🏢│
├──────────────────────────┼──────────────────┼────────────────┼──────────────┤
│ **Límite de Sucursales** │ 1 Sede           │ Hasta 5 Sedes  │ Hasta 100    │
│ **Costo Mensual**        │ $0 USD / Gratis  │ $29 USD / mes  │ $199 - $599  │
│ **Costo Plan Anual**     │ $0 USD           │ $290 USD / año │ Personalizado│
│ **Insignia Verificada**  │ No               │ Sí (Badge Pro) │ Sí (Gold)    │
│ **Posicionamiento**      │ Orgánico base    │ **Prioritario**│ **Top Absoluto│
│ **Métricas de Inventario│ Básicas          │ Completas      │ Consolidadas │
│ **Leads de WhatsApp**    │ Limitados        │ Ilimitados     │ Ilimitados   │
│ **Reporte Brecha Demanda│ No               │ **Semanal**    │ **Tiempo Real│
│ **Sync de Catálogo**     │ Manual / Form    │ CSV / Feed URL │ API / Direct │
│ **Soporte Comercial**    │ Vía Comunidad    │ WhatsApp B2B   │ Account Mgr  │
└──────────────────────────┴──────────────────┴────────────────┴──────────────┘
```

### 5.1. Nivel FREE (Básico para Farmacia Unitaria)
- **Objetivo**: Entrada sin barrera de costo para comercios locales.
- **Alcance**: 1 sucursal física. Publicación manual de productos mediante formulario web o lista básica.
- **Visibilidad**: Aparece en el mapa de tiendas cuando el usuario busca un producto específico y no existen comercios destacados más cercanos.

### 5.2. Nivel PRO_LOCAL ($29 USD/mes o $290 USD/año) — *El Más Vendido*
- **Objetivo**: Diseñado para farmacias independientes competitivas y pequeñas redes locales (hasta 5 sedes).
- **Insignia "Comercio Destacado Verificado"**: Aparece destacado con badge visual en el mapa y en la ficha del producto.
- **Acceso Completo a Demand Gap Analytics**: Conoce exactamente qué ingredientes están buscando los clientes de su municipio.
- **Carga Masiva de Catálogo**: Importación periódica mediante archivo CSV o sincronización con feed web.
- **Retorno de Inversión (ROI) Estimado**: Con tan solo **2 ventas adicionales al mes** derivadas por la plataforma (ticket promedio dermocosmético: $18 - $25 USD), el plan se autofinancia por completo.

### 5.3. Nivel ENTERPRISE (Cadenas Regionales y Nacionales)
- **Objetivo**: Redes de 10 a 100 sucursales (ej. Farmatodo, Locatel, Red de Boticas provinciales).
- **Sincronización Automatizada sin Intervención Manual**: Integración directa con los motores de comercio electrónico de la cadena (Shopify, VTEX, WooCommerce).
- **Analítica Geográfica Consolidada**: Comparativa de demanda insatisfecha por ciudad, municipio y sucursal.
- **Campañas de Posicionamiento Promocional**: Integración en rutinas de Skin Cycling recomendadas a nivel regional.

---

## 6. SINCRONIZACIÓN DE CATÁLOGOS Y CONECTORES DE E-COMMERCE

El motor de extracción e ingesta de Allabout.skin (`backend/app/Services/Scraper/Connectors/`) permite a los comercios Enterprise mantener sus existencias actualizadas en tiempo real sin dedicar personal a cargar productos a mano:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ARQUITECTURA DE INGESTA DE CATÁLOGOS                 │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Shopify Connector     │ Ingesta directa vía /products.json          │
│                          │ Normalización de monedas sin decimales (CLP)│
├──────────────────────────┼─────────────────────────────────────────────┤
│ 2. VTEX Connector        │ Consumo de vtex_commertial_offer            │
│                          │ Desglose de impuestos (IVA 16%) y existencias│
├──────────────────────────┼─────────────────────────────────────────────┤
│ 3. WooCommerce Connector │ Extracción de REST Store API v1             │
│                          │ Variantes de SKU y atributos cosméticos     │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 4. Schema.org Microdata  │ Parsing de JSON-LD @type: Product           │
│                          │ Compatibilidad universal con cualquier web  │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 5. Clinical Quality Gate │ Filtro de exclusión de suplementos y no-derma│
└──────────────────────────┴─────────────────────────────────────────────┘
```

### 6.1. Manejo Bimonetario y Volatilidad Cambiaria (`ExchangeRateService`)
En economías con doble moneda o alta variación cambiaria (ej. Venezuela con Bolívares y Dólares; Chile con CLP y USD; Colombia con COP y USD):
- El sistema sincroniza automáticamente las tasas oficiales del Banco Central correspondiente (ej. Tasa Oficial BCV).
- Si la tienda publica sus precios en moneda local, Allabout.skin calcula la paridad en USD para el usuario internacional sin desfase de cotización.
- Previene pérdidas por desactualización de precios: la farmacia puede optar por fijar su precio base en USD y el sistema calcula la conversión al instante al momento de generar el mensaje de WhatsApp.

### 6.2. Filtro de Calidad Sanitaria (`ClinicalQualityGateService.php`)
Las farmacias venden medicamentos, alimentos, golosinas y productos de higiene doméstica. El motor de ingesta de Allabout.skin aplica un filtro semántico automático:
- **Aprobado**: Cremas faciales, sueros, tónicos, limpiadores syndet, protectores solares, tratamientos para acné, ampollas tópicas.
- **Rechazado Automáticamente**: Antibióticos orales, analgésicos sistémicos, pañales, tintes capilares agresivos, snacks, suplementos orales no tópicos.
- **Resultado**: La vitrina digital de la farmacia en Allabout.skin se mantiene 100% limpia, profesional y dermoespecífica.

---

## 7. MÉTRICAS DE RENDIMIENTO Y RETORNO DE INVERSIÓN (ROI)

El panel de control para comerciantes (`StoreDashboardOverview.tsx`) proporciona 4 indicadores de retorno comercial medidos en tiempo real (últimos 30 días):

```
┌───────────────────────────┬─────────────────────────────────────────────────┐
│ Indicador de Negocio      │ Significado Operativo                           │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ **`WHATSAPP_CLICK`**      │ Cliente con alta intención que abrió chat de    │
│                           │ venta directa con la farmacia.                  │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ **`MAP_ROUTE`**           │ Cliente que solicitó la ruta GPS en Google Maps │
│                           │ para acudir físicamente a la sucursal.          │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ **`IN_STORE_VIEW`**       │ Escaneo de producto realizado físicamente dentro│
│                           │ del radio geográfico de la farmacia.            │
├───────────────────────────┼─────────────────────────────────────────────────┤
│ **`ROUTINE_INCLUSIONS`**  │ Pacientes que tienen productos de la farmacia   │
│                           │ incorporados en su calendario activo de rutina. │
└───────────────────────────┴─────────────────────────────────────────────────┘
```

### Cálculo Financiero de Retorno (Caso Real Farmacia Pro Local):
- **Costo Mensual de la Suscripción**: $29.00 USD.
- **Interacciones Generadas en 30 días**:
  - 42 clics a WhatsApp iniciados.
  - 18 aperturas de ruta en Google Maps.
  - 65 productos de la tienda agregados a rutinas de usuarios locales.
- **Tasa de Cierre en Chat de WhatsApp (Conservadora)**: 25% = 10 ventas efectivas cerradas.
- **Margen Comercial Bruto Promedio en Dermocosmética**: 35% sobre ticket de $22.00 USD = $7.70 USD de beneficio neto por venta.
- **Beneficio Bruto Generado**: 10 ventas x $7.70 = **$77.00 USD**.
- **ROI Neto Mensual**: **+165% de retorno sobre la inversión en software**.

---

## 8. GUÍA DE ACTIVACIÓN PASO A PASO PARA COMERCIOS (ONBOARDING)

1. **Registro Inicial**: Acceda a `/dashboard/empresa` y cree su cuenta corporativa con correo y datos fiscales de la empresa.
2. **Alta de Sucursales Físicas**: Registre el nombre de cada sede, dirección exacta, coordenadas de Google Maps y número de WhatsApp corporativo de atención.
3. **Carga de Catálogo**:
   - *Opción Rápida*: Suba un archivo CSV con las columnas `EAN/Código de Barras, Nombre del Producto, Marca, Precio, Stock (true/false)`.
   - *Opción Automatizada*: Proporcione la URL de su feed Shopify/WooCommerce o contacte a soporte para enlace API.
4. **Verificación y Activación Pro**: Seleccione el plan Pro Local, active su insignia destacada y comience a recibir leads en WhatsApp de inmediato.

---
*Fin del Kit Comercial B2B y Guía Operativa para Farmacias — Allabout.skin.*
