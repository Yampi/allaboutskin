# GUÍA INTEGRAL DEL USUARIO Y PACIENTE DERMOCOSMÉTICO
## Protocolos de Skin Cycling, Diagnóstico Cutáneo Fisiológico y Auditoría Científica de Fórmulas

**Plataforma**: Allabout.skin — Sistema de Inteligencia Dermocosmética & Biofísica de Formulaciones  
**Destinatarios**: Pacientes, usuarios de dermocosmética, consultores estéticos y farmacéuticos dispensadores  
**Normativa de Referencia**: CosIng (Reglamento CE N° 1223/2009), Directrices de la Academia Americana de Dermatología (AAD) y Ley de Ejercicio de la Medicina (Gaceta Oficial N° 39.823)  
**Versión**: 2026.1 (Commercial Production Release)  
**Clasificación**: Documento Maestro Institucional B2C  

---

## 1. INTRODUCCIÓN Y MISIÓN CIENTÍFICA

El cuidado de la piel contemporáneo enfrenta una epidemia de desinformación propiciada por tendencias virales sin respaldo biofísico. Millones de consumidores saturan su epidermis con combinaciones incompatibles de retinoides, hidroxiácidos exfoliantes y principios oxidativos, lo que desencadena dermatitis por contacto, eritema persistente, hiperpigmentación postinflamatoria (PIH) y una disrupción aguda de la barrera cutánea.

**Allabout.skin** nació con un propósito técnico intransigente: **transformar el consumo de dermocosmética mediante la biofísica de formulaciones, la medicina basada en evidencia y la transparencia algorítmica**.

Esta guía proporciona el marco clínico exhaustivo para navegar el ecosistema Allabout.skin:
- Cómo calibrar su perfil cutáneo individual en seis dimensiones biológicas mediante el asistente diagnóstico (`SkinCyclingWizard`).
- La física y química del **Skin Cycling**: cómo dosificar retinoides y exfoliantes en ciclos intermitentes de 4 o 5 noches para maximizar la síntesis de procolágeno sin comprometer la integridad celular.
- El orden físico riguroso de capas (Layering) determinado por pH, peso molecular y polaridad lipídica.
- El catálogo de incompatibilidades moleculares y colisiones químicas de activos.
- El protocolo circadiano AM/PM, la protección frente al Índice UV y la prevención de la descamación no controlada.

---

## 2. VIAJE DEL USUARIO Y ASISTENTE DIAGNÓSTICO (`SkinCyclingWizard`)

El sistema Allabout.skin rechaza las clasificaciones genéricas de "piel normal o seca". En la pestaña interactiva **Mi Piel** (`/mi-piel`), cada usuario completa un triaje de 6 variables fisiológicas que parametrizan el motor algorítmico (`skinCyclingEngine.ts`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PERFIL DERMATOLÓGICO MULTIDIMENSIONAL                │
├─────────────────────────┬──────────────────────────────────────────────┤
│ 1. Biotipo Cutáneo      │ COMBINATION | OILY | DRY | SENSITIVE | NORMAL│
├─────────────────────────┼──────────────────────────────────────────────┤
│ 2. Fototipo Fitzpatrick │ Tipo I al Tipo VI (Riesgo de Eritema vs PIH) │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 3. Estado de la Barrera │ HEALTHY | COMPROMISED | ACUTELY_DAMAGED      │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 4. Focos Clínicos       │ ACNE | ROSACEA | HYPERPIGMENTATION | AGING   │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 5. Estado Materno       │ Gestación / Lactancia Activa (Boolean)       │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 6. Experiencia Activos  │ BEGINNER | INTERMEDIATE | ADVANCED           │
└─────────────────────────┴──────────────────────────────────────────────┘
```

### 2.1. Las 6 Dimensiones Fisiológicas de Calibración

#### Dimensión 1: Biotipo Cutáneo Fisiológico (`SkinType`)
Determinada por la tasa de excreción sebácea glandular (SER - *Sebum Excretion Rate*) y el factor natural de humectación (NMF):
- **OILY (Grasa)**: Seborrea activa generalizada, dilatación ostiofolicular visible en zona T y mejillas, mayor grosor epidérmico y tendencia al brillo lipídico a las 2 horas post-lavado. Requiere liposolubles como Ácido Salicílico (BHA).
- **COMBINATION (Mixta)**: Hipersecreción sebácea circunscrita a la zona media facial (frente, pirámide nasal y mentón) en coexistencia con alipia o deshidratación en regiones malares y mandibulares.
- **DRY (Seca / Alípica)**: Déficit cuantitativo de lípidos biosintetizados por glándulas sebáceas y queratinocitos. Piel tirante, desvitalizada, propensa a fisuras microcópicas y pérdida transepidérmica de agua (TEWL) acelerada.
- **SENSITIVE (Sensible / Reactiva)**: Umbral neurosensorial disminuido con hiperreactividad vasomotora, manifestación de disestesia cutánea (ardor, prurito, tirantez) ante variaciones térmicas o cosméticos estándar.
- **NORMAL (Eudérmica)**: Equilibrio hidrolipídico fisiológico con barrera íntegra y textura homogénea.

#### Dimensión 2: Fototipo Cutáneo de Fitzpatrick (Tipos I al VI)
Clasifica la respuesta biológica celular frente a la radiación ultravioleta según la densidad y ratio de eumelanina y feomelanina:
- **Fototipo I (`#FBF0E4`)**: Piel blanco-lechosa, efélides abundantes. Siempre se quema con eritema agudo, nunca se broncea. Máximo riesgo de daño actínico y fotoenvejecimiento.
- **Fototipo II (`#F1DAC4`)**: Piel clara, ojos claros. Siempre se quema con facilidad, se broncea mínimamente.
- **Fototipo III (`#E3BA96`)**: Piel blanca a cetrina. Se quema moderadamente, se broncea de forma gradual.
- **Fototipo IV (`#C68B59`)**: Piel morena clara/oliva (común en Latinoamérica y Mediterráneo). Rara vez se quema, se broncea intensamente. **Alerta clínica**: Alto riesgo de Hiperpigmentación Postinflamatoria (PIH) por exfoliantes fuertes.
- **Fototipo V (`#8D5524`)**: Piel morena oscura. Muy rara vez se quema, pigmenta de inmediato. Requiere inhibidores de tirosinasa de baja fricción (Ácido Mandélico, Tranexámico).
- **Fototipo VI (`#4D2C1D`)**: Piel intensamente pigmentada. Nunca experimenta quemadura solar visible, respuesta melanogénica defensiva acelerada ante cualquier microtrauma o irritación química.

#### Dimensión 3: Estado de Integridad de la Barrera Cutánea (`BarrierStatus`)
Evalúa la integridad del manto hidrolipídico y la cohesión de los corneocitos fijados por la matriz trilaminar de ceramidas, colesterol y ácidos grasos:
- **HEALTHY (Íntegra / Óptima)**: Cohesión córnea perfecta. Sin reactividad ni ardor al aplicar humectantes neutros. TEWL < 10 g/m²/h.
- **COMPROMISED (Comprometida)**: Disrupción parcial de la bicapa lipídica. Tirantez tras la limpieza, eritema intermitente y descamación localizada. TEWL entre 15 y 25 g/m²/h.
- **ACUTELY_DAMAGED (Daño Agudo / Quemadura por Activos)**: Ardor urente al contacto con agua templada o cremas neutras, eritema generalizado, descamación exfoliativa patológica. TEWL > 30 g/m²/h. **Dispara de inmediato el Protocolo de Emergencia**.

#### Dimensión 4: Focos Terapéuticos Activos (`SkinCondition`)
Identifica patologías cosméticas concomitantes:
- `ACNE`: Comedogénesis, proliferación de *Cutibacterium acnes*, microquistes y pápulas inflamatorias.
- `ROSACEA`: Disfunción vascular neurogénica, telangiectasias, flushing e hiperreactividad simpática facial.
- `HYPERPIGMENTATION`: Hiperactivación de melanocitos epidérmicos o dérmicos (melasma, léntigos solares, manchas PIH).
- `AGING`: Pérdida de tensores dérmicos, elastosis solar, glicación de colágeno y arrugas estáticas/dinámicas.
- `CLOGGED_PORES`: Tapones queratínicos foliculares y oxidación lipídica del sebo (puntos negros).
- `REDNESS`: Fragilidad capilar transitoria o reactividad difusa.

#### Dimensión 5: Estado Materno Gestacional o Lactancia (`pregnancyOrNursing`)
Bandera de seguridad toxicológica absoluta. Restringe de inmediato ingredientes de absorción sistémica con potencial de teratogenicidad o alteración embrionaria según la FDA y la Unión Europea.

#### Dimensión 6: Nivel de Exposición y Tolerancia previa (`experienceLevel`)
- `BEGINNER`: Nunca ha utilizado hidroxiácidos ni retinoides tópicos. Umbral de irritación no calibrado.
- `INTERMEDIATE`: Utiliza ácidos cosméticos suaves o retinol al 0.2-0.3% sin efectos adversos.
- `ADVANCED`: Tolerancia consolidada a retinoides de alta potencia (Retinaldehído 0.1%, Ácido Glicólico 10%, Tretinoína prescrita).

---

## 3. MASTERCLASS DE SKIN CYCLING: LOS 4 PROTOCOLOS CLÍNICOS

El **Skin Cycling** es una metodología de reprogramación celular desarrollada para administrar la agresión controlada y la regeneración tisular en un ciclo rotativo y predecible. En vez de infligir daño químico acumulativo cada noche, se intercalan noches de activación con noches dedicadas a la síntesis lipídica intracorneocitaria.

Allabout.skin implementa 4 protocolos científicos codificados con precisión bioquímica:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MATRIZ COMPARATIVA DE SKIN CYCLING                       │
├─────────────────────┬──────────────┬──────────────┬─────────────────────────┤
│ Protocolo Clínico   │ Duración     │ Enfoque      │ Indicación Primaria     │
├─────────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ 1. Barrier Reset    │ 4 Noches x3  │ 100% Reparo  │ Barrera Acutelly Damaged│
│ 2. Maternity-Safe   │ 4 ó 5 Noches │ No-Retinoide │ Gestación y Lactancia   │
│ 3. Gentle Cycle     │ 5 Noches     │ Suave/Buffer │ Sensible, Rosácea, Novato│
│ 4. Classic 4-Night  │ 4 Noches     │ Alto Impacto │ Normal, Mixta, Grasa    │
└─────────────────────┴──────────────┴──────────────┴─────────────────────────┘
```

---

### 3.1. PROTOCOLO 1: RESCATE DE EMERGENCIA DE BARRERA (`emergency-barrier-reset`)
*Para barreras con daño agudo, eritema punzante y ardor al agua.*

- **Criterio de Activación**: `barrierStatus === 'ACUTELY_DAMAGED'`.
- **Duración Clínica Obligatoria**: 10 a 14 días ininterrumpidos (2 a 3 ciclos completos de 4 noches).
- **Contraindicación Absoluta**: Se prohíbe el uso de ácido glicólico, láctico, salicílico, mandélico, retinol, retinal, tretinoína, vitamina C pura, tónicos con alcohol y cepillos sónicos.

```
Noche 1: Reparación Lipídica ──> Noche 2: Ceramidas 3:1:1 ──> Noche 3: Humectación NMF ──> Noche 4: Sellado Oclusivo
```

#### Noche 1: Reparación Lipídica Intensiva & Antiinflamación Neurosensorial
- **Objetivo Biofísico**: Inhibir las citoquinas proinflamatorias (IL-1α, TNF-α) y estimular los receptores de queratinocitos.
- **Activos Principales**:
  - *Centella Asiática (Madecassoside 95% puro)*: Estimula la síntesis de colágeno tipo I y suprime el eritema.
  - *D-Pantenol (Pro-Vitamina B5 al 5%)*: Precursor de la coenzima A, incrementa la proliferación de fibroblastos.
  - *Alantoína*: Agente queratolítico fisiológico suave que promueve la epitelización celular.
- **Pasos de Aplicación**:
  1. Limpieza suave con agua termal o syndet lechoso sin tensioactivos sulfatados.
  2. Aplicación tópica de serum/emulsión acuosa con Centella Asiática sobre piel templada.
  3. Cobertura generosa con crema cicatrizante reconstituyente (bálsamo rico en pantenol y zinc).
- **Precaución**: Secar la cara dando toques suaves con papel tisú o toalla de microfibra limpia; no arrastrar ni frotar mecánicamente.

#### Noche 2: Reposición de Ceramidas Esenciales en Ratio Fisiológico
- **Objetivo Biofísico**: Reconstituir la matriz cementante intercelular del estrato córneo.
- **Activos Principales**:
  - *Complejo Equimolar Trilaminar*: Ceramida NP, Ceramida AP, Ceramida EOP en combinación con Colesterol vegetal y Ácidos Grasos Libres en ratio biomimético estricto **3:1:1**.
  - *Fitoesfingosina*: Lípido señalizador con actividad antimicrobiana intrínseca que previene sobreinfecciones secundarias.
- **Pasos de Aplicación**:
  1. Lavado facial con agua a temperatura corporal (30-32°C). Evitar agua caliente vasodilatadora.
  2. Aplicar emulsión o crema reconstituyente de ceramidas masajeando suavemente sin estirar la piel.
- **Precaución**: Exclusión total de perfumes, aceites esenciales (lavanda, eucalipto, árbol de té) y parabenos reactivos.

#### Noche 3: Hidratación Profunda & Factores Naturales de Humectación (NMF)
- **Objetivo Biofísico**: Restaurar el gradiente osmótico transepitelial e hidratar la queratina intracorneocitaria.
- **Activos Principales**:
  - *Ácido Hialurónico Multimolecular (Fracciones de 50 kDa a 1.500 kDa)*: El alto peso crea un film viscoelástico superficial, mientras el bajo peso molecular alcanza el estrato espinoso.
  - *Glicerina Vegetal USP (al 5-10%)*: Molécula trihidroxilada con mayor capacidad de retención de puentes de hidrógeno que el ácido hialurónico solo.
  - *Ectoína al 2%*: Extremolito biocompatible que estabiliza las membranas celulares y proteínas contra la lisis inducida por estrés.
- **Pasos de Aplicación**:
  1. Limpieza no micelar.
  2. **Regla de Oro**: Aplicar el serum de Ácido Hialurónico **estrictamente sobre piel húmeda** (rocío previo de agua termal o filtrada). Si se aplica sobre piel seca en ambientes áridos, puede extraer agua del estrato córneo hacia el exterior.
  3. Sellar inmediatamente con crema barrera emoliente.

#### Noche 4: Sellado Oclusivo Fisiológico
- **Objetivo Biofísico**: Instaurar una barrera física semipermeable que reduzca la evaporación del agua (TEWL) en más del 80% durante las 8 horas de sueño reparador.
- **Activos Principales**:
  - *Escualano Vegetal Puro (Derivado de oliva o caña de azúcar)*: Homólogo hidrogenado del escualeno nativo del sebo humano; 100% no comedogénico y biomimético.
  - *Bisabolol (-α-bisabolol)*: Sesquiterpeno óptico obtenido de la manzanilla con actividad analgésica tópica.
  - *Manteca de Karité Grado Cosmético Refinada*: Aporte de ésteres esteáricos y triterpenos antiinflamatorios.
- **Pasos de Aplicación**:
  1. Limpieza syndet.
  2. Hidratante nutritivo habitual.
  3. Aplicar 2 a 3 gotas de escualano puro en las palmas de las manos, presionar suavemente sobre rostro y cuello.
- **Formulaciones Comerciales Recomendadas para este Protocolo**:
  - *La Roche-Posay Cicaplast Baume B5+* (Pantenol 5% + Madecassoside + Tribioma).
  - *Bioderma Atoderm Intensive Baume* (Patente Skin Barrier Therapy + PEA anti-prurito).
  - *Avène Cicalfate+ Crema Reparadora Protectora* ([C+-Restore] derivado de microflora de agua termal + Sulfato de Cobre/Zinc).
  - *CeraVe Crema Hidratante para Rostro y Cuerpo* (3 ceramidas esenciales + ácido hialurónico con tecnología MVE).

---

### 3.2. PROTOCOLO 2: SKIN CYCLING MATERNO-SEGURO (`maternity-safe-cycling`)
*Para pacientes embarazadas, en fase de lactancia materna o en búsqueda activa de concepción.*

- **Criterio de Activación**: `pregnancyOrNursing === true`.
- **Rigor Toxicológico**: Exclusión total de derivados de la Vitamina A (Retinol, Acetato de Retinilo, Palmitato de Retinilo, Retinaldehído, Tretinoína, Adapaleno, Tazaroteno, Trifaroteno) debido al riesgo documentado de **síndrome de embriopatía por retinoides**. Restricción de Ácido Salicílico a concentraciones no oclusivas menores al 2% (Categoría C en altas dosis por riesgo de salicilismo).

```
Noche 1: Ácido Azelaico / PHA ──> Noche 2: Bakuchiol & Péptidos ──> Noches 3 y 4: Reparación & Barrera
```

#### Noche 1: Exfoliación Química Segura (Ácido Azelaico / Polihidroxiácidos)
- **Activo Estrella**: *Ácido Azelaico al 10% - 15% (Categoría B de la FDA)*.
  - *Farmacología*: Dicarboxílico natural que inhibe competitivamente a la tirosinasa (previniendo y aclarando el melasma gravídico / cloasma) y actúa como bacteriostático frente a *C. acnes* sin inducir resistencia bacteriana.
  - *Alternativa*: *Gluconolactona (PHA) al 4-8%* o *Ácido Láctico al 5%*. Sus moléculas de gran tamaño ofrecen una exfoliación uniforme sin penetración intempestiva.
- **Aplicación**: Sobre piel limpia y seca. Esperar 5 minutos antes de la crema hidratante.

#### Noche 2: Bio-Renovación Celular con Fito-Retinoides (Bakuchiol)
- **Activo Estrella**: *Bakuchiol al 1% - 2% (Extirpado de semillas de Psoralea corylifolia)*.
  - *Mecanismo Fisiológico*: Modula la expresión génica de queratinocitos y fibroblastos estimulando la síntesis de colágeno tipo I, III y IV de manera análoga al retinol, **pero sin ligarse a los receptores nucleares de ácido retinoico (RAR/RXR)**. Carece de toxicidad embriofetal.
  - *Sinergistas*: Péptidos de Cobre (GHK-Cu), Tripéptido-1 y Niacinamida al 4%.
- **Aplicación**: 4 a 5 gotas de serum de bakuchiol antes de la crema de noche.

#### Noches 3 y 4: Descanso Celular Activo, Recuperación y Elasticidad
- **Activos**: Ceramidas, Centella Asiática, Pantenol, Ácido Hialurónico vegetal y Aceite de Rosa Mosqueta virgen (rico en ácidos grasos poliinsaturados omega-3 y omega-6).
- **Propósito**: Consolidar la turgencia cutánea y amortiguar los cambios de sensibilidad vascular inducidos por el aumento de progesterona y estrógenos.
- **Productos Comerciales Seguros**:
  - *The Ordinary Azelaic Acid Suspension 10%*
  - *Paula’s Choice 10% Azelaic Acid Booster*
  - *Medik8 Bakuchiol Peptides Serum*
  - *Bioderma Sensibio Defensive Sérum*

---

### 3.3. PROTOCOLO 3: CICLO SUAVE DE 5 NOCHES (`gentle-5night-cycling`)
*Para biotipos sensibles, pacientes con eritema vascular/rosácea, barrera comprometida o principiantes absolutos.*

- **Duración del Ciclo**: 5 días rotativos (1 Noche Exfoliación + 1 Noche Retinoide + 3 Noches Recuperación Celular).
- **Fundamento Fisiológico**: Las pieles con tendencia a la reactividad presentan una expresión defectuosa de claudinas y ocludinas en las uniones estrechas epidérmicas (*tight junctions*). Al asignar 3 noches completas de recuperación (60% del ciclo), se garantiza la desinflamación completa del estrato lúcido antes de reintroducir una molécula exfoliante.

```
Noche 1: Exfoliación Gran Peso ─> Noche 2: Retinoide Sándwich ─> Noche 3, 4 y 5: Reparación Tridimensional
```

#### Noche 1: Exfoliación Química Suave de Gran Peso Molecular
- **Selección de Ácido según Fototipo**:
  - *Fototipos I al III*: Ácido Láctico al 5% con Ácido Hialurónico o Gluconolactona al 4%.
  - *Fototipos IV al VI o con Rosácea*: **Ácido Mandélico al 5% - 10%**. Su anillo aromático bencénico incrementa su peso molecular (152.15 g/mol vs 76.05 g/mol del glicólico), forzando una absorción lenta y homogénea que no activa los melanocitos ni dispara la hiperpigmentación postinflamatoria.

#### Noche 2: Retinoide Amortiguado con el "Método Sándwich"
Para introducir derivados de vitamina A sin provocar descamación violenta ni dermatitis por retinización:
1. **Capa 1 (Amortiguador Base)**: Aplicar una capa fina de emulsión ligera con ácido hialurónico o niacinamida al 2%. Dejar absorber 5 minutos.
2. **Capa 2 (Activo Vectorizado)**: Aplicar una cantidad exacta del tamaño de un guisante (*pea-sized*) de Retinaldehído al 0.05% o Retinol microencapsulado al 0.2%.
3. **Capa 3 (Escudo Protector)**: Aplicar una capa generosa de crema de ceramidas sobre el retinoide.
- **Razón Farmacéutica**: Esta técnica disminuye el gradiente de concentración máxima puntual (*Cmax*) en la superficie celular, manteniendo constante el área bajo la curva (*AUC*) de absorción biológica.

#### Noches 3, 4 y 5: Terapia Tridimensional de Recuperación
- *Noche 3 (Calma Inmediata)*: Centella Asiática, Ectoína al 2% y Bisabolol. Neutraliza los mediadores de histamina y óxido nítrico endotelial.
- *Noche 4 (Reconstrucción Tisular)*: Tres Ceramidas, Colesterol y Ácidos Grasos en emulsión densa.
- *Noche 5 (Consolidación Bioelástica)*: Pantenol 5%, Avena Coloidal (rica en avenantramidas anti-pruriginosas) y Escualano vegetal.

---

### 3.4. PROTOCOLO 4: PROTOCOLO CLÁSICO OPTIMIZADO DE 4 NOCHES (`dermatological-classic-4night`)
*El estándar de oro para pieles adaptadas, biotipos grasos, mixtos o maduros con tolerancia probada.*

- **Duración del Ciclo**: 4 días rotativos ininterrumpidos (25% Exfoliación, 25% Renovación Retinoide, 50% Reparación).

```
Noche 1: Exfoliación Focalizada ──> Noche 2: Retinoide Eficaz ──> Noche 3: Hidratación ──> Noche 4: Lipídica
```

#### Noche 1: Exfoliación Química Focalizada
- **Elección Farmacológica Personalizada**:
  - *Piel Grasa o con Tendencia Acneica*: **Ácido Salicílico al 2% (BHA)**. Molécula lipofílica de pH 3.2 a 3.8 que atraviesa la glándula sebácea disolviendo el tapón córneo intrafolicular y reduciendo el eritema gracias a su núcleo salicilato.
  - *Piel Normal a Seca / Fotoenvejecimiento*: **Ácido Glicólico al 8% - 10% (AHA)** o Ácido Láctico al 10%. Molécula hidrófila pequeña (76 Da) que rompe los desmosomas entre corneocitos envejecidos, revelando queratinocitos hidratados.
  - *Fototipos Altos (IV-VI) con Manchas*: Ácido Mandélico 10% + Ácido Tranexámico 3%.
- **Modo de Empleo**: Rostro limpio y rigurosamente seco. Esperar 10 a 15 minutos de tiempo de contacto antes de la crema hidratante para no alterar el pH ácido óptimo del exfoliante.

#### Noche 2: Retinoide de Alta Eficacia Celular
- **Activos Recomendados**:
  - *Nivel Intermedio*: Retinaldehído 0.05% o Retinol Puro 0.3% - 0.5%.
  - *Nivel Avanzado*: Retinaldehído 0.1% o Retinoides de prescripción médica (Tretinoína 0.025% - 0.05% supervisada).
  - *Ventaja del Retinaldehído*: Requiere **una sola conversión enzimática** en la piel hacia ácido retinoico activo (frente a las dos conversiones que exige el retinol), mostrando una velocidad de acción 11 veces superior y propiedades antibacterianas directas contra el acné.
- **Modo de Empleo**: Aplicar exclusivamente sobre piel 100% seca. Si la piel contiene humedad residual, el retinoide se difunde de manera anómala hacia los folículos, incrementando la irritación. Proteger previamente el contorno ocular y las aletas nasales con bálsamo oclusivo.

#### Noche 3: Recuperación Celular & Hidratación Hialurónica Multicapa
- **Activos**: Ácido Hialurónico multimolecular, Madecassoside y Niacinamida al 2-4% (estimulante fisiológico de la síntesis endógena de ceramidas e inhibidor de la transferencia de melanosomas).

#### Noche 4: Consolidación Lipídica y Sellado Fisiológico
- **Activos**: Pantenol al 5%, Escualano y Manteca vegetal ligera. Garantiza que la barrera esté reconstituida al 100% antes de reiniciar el ciclo en la Noche 1.

---

## 4. JERARQUÍA BIOFÍSICA DE APLICACIÓN EN 7 PASOS (LAYERING ORDER)

El orden de aplicación cosmética no es una convención arbitraria; está gobernado por las leyes biofísicas de **peso molecular, solubilidad (coeficiente de reparto octanol/agua LogP) y escala de pH**.

La regla invariable de Allabout.skin es: **del producto más acuoso y de menor pH al producto más lipofílico, denso y oclusivo**.

```
[Paso 1: Limpiador Fisiológico pH 5.5]
                   │
[Paso 2: Activos de Bajo pH (pH 3.0 - 4.0)]
                   │
[Paso 3: Serums Acuosos & Humectantes]
                   │
[Paso 4: Emulsiones & Tratamientos Ligeros]
                   │
[Paso 5: Cremas Nutritivas & Barrera]
                   │
[Paso 6: Aceites Faciales Lipofílicos]
                   │
[Paso 7 (AM OBLIGATORIO): Fotoprotector FPS 50+]
```

| Paso | Categoría Biofísica | Rango de pH | Densidad / Fase | Ejemplos de Activos / Productos |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Limpiador Fisiológico** | pH 5.0 - 5.5 | Acuosa con surfactantes syndet | Syndet en gel, leche limpiadora, agua micelar (siempre aclarada). |
| **2** | **Tratamientos de Bajo pH / Ácidos** | pH 3.0 - 4.0 | Líquida acuosa o tónico exfoliante | Ácido Salicílico (BHA), Ácido Glicólico (AHA), Vitamina C Pura (L-Ascórbico). |
| **3** | **Serums Acuosos / Humectantes** | pH 5.0 - 6.5 | Líquido viscoso hidrosoluble | Ácido Hialurónico, Niacinamida 2-5%, Péptidos de Cobre, Ectoína. |
| **4** | **Emulsiones y Lociones Ligeras** | pH 5.5 - 6.5 | O/W (Óleo en agua fluida) | Lociones calmantes, fluidos con Centella Asiática, Retinal en emulsión. |
| **5** | **Cremas Nutritivas y de Barrera** | pH 5.5 - 7.0 | O/W densa o W/O ligera | Cremas con 3 Ceramidas 3:1:1, Pantenol 5%, Avena Coloidal. |
| **6** | **Aceites Faciales Puros (Selladores)** | Anhidro | Lipídica 100% | Escualano vegetal puro, Aceite de Rosa Mosqueta virgen, Jojoba. |
| **7** | **Fotoprotector Solar (Solo Rutina AM)** | pH 6.0 - 7.5 | Emulsión o fluido con filtros UV | Filtros solares orgánicos o minerales (Óxido de Zinc, Tinosorb S/M, Mexoryl). |

### Biofísica del Layering: ¿Por qué es crítico este orden?
1. **Gradiente de pH**: Si se aplica una crema de pH 6.5 antes de un ácido exfoliante (pH 3.5), el tampón de la crema eleva de inmediato el pH ambiental cutáneo, neutralizando la capacidad del ácido para desasociar corneodesmosomas y volviéndolo ineficaz.
2. **Permeabilidad Lipídica**: Las moléculas hidrofílicas (como el Ácido Hialurónico) son incapaces de atravesar una película lipídica oclusiva (como el escualano o las ceramidas densas). Si se aplica un serum sobre una crema oclusiva, el producto se evapora en la superficie sin penetrar jamás en la epidermis.

---

## 5. MATRIZ DE INCOMPATIBILIDAD Y CONFLICTOS QUÍMICOS

En el motor relacional de Allabout.skin (`FormulaAuditEngine.php` e `ingredient_conflicts`), cada ingrediente es cotejado contra una matriz cruzada para prevenir colisiones moleculares clasificadas en 4 categorías clínicas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIPOLOGÍA DE INCOMPATIBILIDADES                      │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. PH_INCOMPATIBILITY    │ Choque de pH ácido vs alcalino / hidrólisis │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 2. CHEMICAL_DEGRADATION  │ Oxidación, inactivación o radicales libres  │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 3. IRRITATION_OVERLOAD   │ Disrupción córnea acumulada por activos     │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 4. CHELATION             │ Neutralización molecular de péptidos        │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### 5.1. Matriz Detallada de Conflictos Moleculares

| Activo A | Activo B | Tipo de Conflicto | Severidad | Racional Clínico | Estrategia de Mitigación |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Ácido Glicólico / BHA (pH < 3.5)** | **Niacinamida (Vitamina B3)** | `PH_INCOMPATIBILITY` | Media | A pH inferior a 3.5 y temperatura cutánea, una fracción de la Niacinamida puede hidrolizarse en ácido nicotínico, provocando vasodilatación periférica violenta (*flushing*), picor y eritema temporal. | Separar por 20 minutos o aplicar Niacinamida en la rutina AM y Ácidos en la rutina PM. |
| **Retinol / Retinal puro** | **Peróxido de Benzoilo** | `CHEMICAL_DEGRADATION` | **Alta** | El Peróxido de Benzoilo es un oxidante enérgico que degrada por peroxidación la molécula lipófila insaturada del retinol, anulando por completo su actividad biológica estimulante de colágeno. | Utilizar Peróxido de Benzoilo en la mañana (lavado o puntual) y Retinoide en la noche. |
| **Vitamina C Pura (Ácido L-Ascórbico)** | **Péptidos de Cobre (GHK-Cu)** | `CHELATION` / `CHEMICAL_DEGRADATION` | **Alta** | Los iones de cobre libre (Cu²⁺) catalizan la oxidación rápida del ácido ascórbico a ácido dehidroascórbico inactivo, al tiempo que el ácido altera la conformación terciaria quelante del péptido. | Aplicar Vitamina C en la mañana y Péptidos de Cobre en la noche de recuperación. |
| **Ácido Salicílico 2% (BHA)** | **Tretinoína / Retinoides Fuertes** | `IRRITATION_OVERLOAD` | **Crítica** | Ambos activos estimulan el desprendimiento acelerado de corneocitos y aceleran la renovación folicular. Su coaplicación nocturna agota el cemento lipídico, disparando la TEWL e induciendo eccema por retinización severo. | **Skin Cycling**: BHA estrictamente en la Noche 1 (Exfoliación) y Retinoide en la Noche 2. Jamás juntos. |
| **Ácido Glicólico 10% (AHA)** | **Vitamina C Pura 15% (L-Ascórbico)** | `IRRITATION_OVERLOAD` | Media / Alta | Sobrecarga de acidez extrema sobre el estrato córneo que descompensa el manto hidrolipídico en pieles normales o reactivas. | Vitamina C en la mañana (antioxidante foto-protector) y AHA en la Noche 1 del ciclo. |
| **Retinol / Retinal** | **AHA / BHA Simultáneos** | `IRRITATION_OVERLOAD` | **Crítica** | Compromiso de barrera garantizado, descamación exfoliativa patológica y reactivación de dermatitis subyacente. | Alternar noches mediante el protocolo de Skin Cycling de 4 noches. |
| **Péptidos Matriciales (Matrixyl)** | **Ácidos Directos (AHA/BHA pH < 3.8)** | `CHELATION` | Media | Los enlaces amida de las cadenas peptídicas sufren hidrólisis parcial a pH fuertemente ácido, reduciendo la efectividad del tratamiento antiedad. | Aplicar péptidos en las noches de recuperación hidratante (Noches 3 y 4). |

---

## 6. PROTOCOLO CIRCADIANO AM/PM, ÍNDICE UV Y FOTOPROTECCIÓN

La fisiología cutánea opera bajo ritmos circadianos estrictos gobernados por la expresión de genes reloj (*CLOCK, BMAL1*):
- **Ciclo Diurno (AM - Modo Protección)**: Se engruesa temporalmente el estrato córneo, el flujo sanguíneo disminuye ligeramente y la producción sebácea alcanza su pico al mediodía para defender a las células de la radiación UV, polución ambiental (PM 2.5) y especies reactivas de oxígeno (ROS).
- **Ciclo Nocturno (PM - Modo Regeneración)**: Aumenta la perfusión microvascular dérmica, se acelera la mitosis de células madre basales, la síntesis de colágeno y la permeabilidad celular (haciendo que los activos penetren con mayor profundidad pero aumentando la vulnerabilidad a la deshidratación nocturna).

```
AM (Protección Celular):  Limpieza Suave ─> Antioxidante (Vit C/E) ─> Hidratación ─> SPF 50+ Obligatorio
PM (Renovación & Reparo): Doble Limpieza ─> Activo según Skin Cycling (Exfoliante/Retinol/Barrera) ─> Crema
```

### 6.1. Protocolo Matutino Universal (AM)
1. **Limpieza Fisiológica**: Preferentemente con agua templada o syndet muy suave. Evitar despojar a la piel de los lípidos biosintetizados durante la noche.
2. **Escudo Antioxidante**: Aplicar suero de Vitamina C estabilizada (Tetraisopalmitato de Ascorbilo o Ácido Etil Ascórbico al 10%) o Niacinamida al 3-5% + Ectoína. Neutraliza radicales libres inducidos por el sol y la luz azul.
3. **Hidratación Adaptativa**: Emulsión ligera no oclusiva con ácido hialurónico y pantenol.
4. **FOTOPROTECCIÓN SOLAR FPS 50+ (EL PASO INNEGOCIABLE)**:
   - Toda persona que practique Skin Cycling tiene su estrato córneo en constante renovación celular, haciéndola **vulnerable a quemaduras actínicas y manchas si no usa fotoprotección**.
   - **Dosis Terapéutica**: 2 mg por centímetro cuadrado de piel facial (equivalente a la **Regla de los Dos Dedos**: dos líneas generosas de protector sobre los dedos índice y corazón para rostro y cuello).

### 6.2. Protocolo de Exposición según el Índice Ultravioleta (UV Index)

Allabout.skin incorpora recomendaciones basadas en la escala internacional de radiación UV de la Organización Mundial de la Salud (OMS):

```
┌───────────────┬──────────────────────────┬───────────────────────────────────┐
│ Índice UV     │ Nivel de Riesgo Actínico │ Protocolo de Protección Exigido   │
├───────────────┼──────────────────────────┼───────────────────────────────────┤
│ **UVI 0 - 2** │ Bajo (Madrugadas/Noche)  │ Hidratante básico de día.         │
│ **UVI 3 - 5** │ Moderado                 │ FPS 30-50+, reaplicación al mediodía.│
│ **UVI 6 - 7** │ Alto                     │ FPS 50+ amplio espectro cada 3h.  │
│ **UVI 8 - 10**│ Muy Alto                 │ FPS 50+, sombrero, reaplicar c/2h.│
│ **UVI 11+**   │ Extremo (Zonas tropicales│ Evitar sol directo de 10am a 4pm, │
│               │ y gran altitud)          │ FPS 50+ cada 2h sin excepción.    │
└───────────────┴──────────────────────────┴───────────────────────────────────┘
```

---

## 7. MONITOREO DE PURGA (*PURGING*), TOLERANCIA Y FECHA DE CADUCIDAD (PAO)

### 7.1. Purga Cutánea (*Purging*) vs. Reacción Alérgica / Dermatitis

Uno de los mayores errores clínicos en el usuario novato es abandonar el Skin Cycling por confundir el proceso de purga con una reacción alérgica adversa:

```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│ Parámetro Diferencial     │ Purga Fisiológica         │ Reacción Alérgica / Brote │
│                           │ (*Skin Purging*)          │ (*Breakout / Contact*)    │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Causa Biológica**       │ Aceleración del recambio  │ Oclusión comedogénica o   │
│                           │ celular que saca a la luz │ hipersensibilidad inmune  │
│                           │ microcomedones preexistentes tipo IV a un ingrediente.│
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Zonas Anatómicas**      │ Exclusivamente en las     │ Aparece en zonas donde el │
│                           │ áreas donde el paciente   │ paciente JAMÁS ha tenido  │
│                           │ suele tener granitos.     │ acné (ej. pómulos, cuello)│
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Tipo de Lesión**        │ Pápulas y comedones       │ Pápulas pruríticas rojas, │
│                           │ pequeños que cicatrizan   │ microampollas, eritema    │
│                           │ y desaparecen con rapidez.│ con picazón intolerable.  │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Duración Temporal**     │ 4 a 6 semanas (un ciclo   │ Empeora progresivamente   │
│                           │ epidérmico completo).     │ mientras se siga usando.  │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ **Conducta Recomendada**  │ Mantener el Skin Cycling; │ Suspender de inmediato;   │
│                           │ hidratar con ceramidas.   │ activar Barrier Reset.    │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### 7.2. Control de Vencimiento de Productos: El Símbolo PAO
En el dashboard personal de Allabout.skin, el usuario puede registrar la apertura de cada producto. El sistema calcula su agotamiento según el símbolo oficial **PAO (*Period After Opening*)**:
- **Símbolo del Tarro Abierto con Número**:
  - `6M`: 6 meses de vida útil tras romper el precinto de fábrica. Frecuente en Vitamina C pura y protectores solares orgánicos.
  - `12M`: 12 meses de estabilidad microbiológica y físico-química garantizada. Estándar para cremas hidratantes y tónicos.
- **Riesgo Clínico de Usar Cosméticos Vencidos**:
  - *Protectores Solares*: La emulsión se desestabiliza; los filtros UV se aglomeran creando microzonas de quemadura solar invisible.
  - *Retinoides*: Se oxidan a metabolitos inactivos que pierden potencia antiedad e incrementan la irritación de superficie.

---

## 8. ADHERENCIA Y SEGUIMIENTO DEL CALENDARIO CUTÁNEO

La constancia es la única variable que predice el éxito en la salud dermatológica. El calendario interactivo de Allabout.skin proporciona:
1. **Racha de Adherencia (Streak Counter)**: Contabiliza los ciclos consecutivos completados sin saltarse la fotoprotección matutina ni aplicar activos conflictivos.
2. **Notificaciones Preventivas de Reposición**: Antes de que el frasco de retinol o protector solar alcance su vida útil calculada o se agote por dosis diaria recomendada, la plataforma sugiere la reposición en farmacias y comercios aliados cercanos con stock verificado a precio oficial.

---

## 9. AVISO MÉDICO Y PROTOCOLO ANTE URGENCIAS DERMATOLÓGICAS

*De estricta conformidad con la Ley de Ejercicio de la Medicina de la República Bolivariana de Venezuela (Gaceta Oficial N° 39.823) y el Código de Deontología Médica:*

> **Aviso de Salud Pública**: La información provista por Allabout.skin es una herramienta de orientación dermocosmética y biofísica de formulaciones. **En ningún caso constituye, sustituye ni reemplaza la consulta, diagnóstico clínico, récipe o tratamiento de un médico dermatólogo colegiado.**

### ¿Cuándo Acudir de Inmediato a Urgencias Médicas?
Suspenda de forma inmediata cualquier rutina cosmética y acuda a un centro de salud si presenta:
1. **Signos de Anafilaxia Sistémica**: Edema angioneurótico (hinchazón de labios, lengua, párpados o glotis), sensación de opresión faríngea o dificultad para respirar.
2. **Eritema Agudo con Ampollas**: Descamación en sábana, quemadura química o dolor urente intenso que no cede con compresas de agua fría.
3. **Sobreinfección Bacteriana**: Secreción amarillenta o purulenta, calor local excesivo o fiebre asociada a lesiones faciales.

---
*Fin de la Guía Oficial del Usuario y Paciente Dermocosmético — Allabout.skin.*
