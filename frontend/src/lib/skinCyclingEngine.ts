import { SkinDiagnosisInput, SkinCyclingProtocol, ProtocolNight } from '@/types/skinCycling';

export function generateCustomProtocol(input: SkinDiagnosisInput): SkinCyclingProtocol {
  const { skinType, fitzpatrick, barrierStatus, conditions, pregnancyOrNursing, experienceLevel } = input;

  const hasRosacea = conditions.includes('ROSACEA');
  const hasAcne = conditions.includes('ACNE');
  const hasHyperpigmentation = conditions.includes('HYPERPIGMENTATION');
  const isHighFitzpatrick = fitzpatrick >= 4;
  const isSensitive = skinType === 'SENSITIVE' || hasRosacea;

  // CASO 1: BARRERA AGUDAMENTE DAÑADA
  if (barrierStatus === 'ACUTELY_DAMAGED') {
    return {
      id: 'emergency-barrier-reset',
      cycleLength: 4,
      protocolName: 'Protocolo de Rescate de Barrera Cutánea',
      summary: 'Tu barrera lipídica presenta signos agudos de irritación o quemadura por activos. Se suspenden temporalmente todos los ácidos y retinoides hasta su completa reepitelización.',
      barrierScore: 'CRÍTICO',
      nights: [
        {
          nightNumber: 1,
          category: 'RECOVERY',
          title: 'Reparación Lipídica Intensiva',
          subtitle: 'Calmante y antiinflamatorio',
          badgeColor: 'emerald',
          recommendedActives: ['Centella Asiática (Madecassoside)', 'Pantenol (B5 al 5%)', 'Alantoína'],
          suggestedSteps: ['Limpiador syndet lechoso sin sulfatos', 'Serum de centella o beta-glucano', 'Crema cicatrizante con pantenol/zinc'],
          clinicalRationale: 'Reduce la inflamación neurogénica y restaura el manto hidrolipídico.',
          precautions: ['Evitar frotar con toallas', 'No usar agua caliente']
        },
        {
          nightNumber: 2,
          category: 'RECOVERY',
          title: 'Reposición de Ceramidas Esenciales',
          subtitle: 'Refuerzo de la matriz intercelular',
          badgeColor: 'emerald',
          recommendedActives: ['Ceramidas NP/AP/EOP', 'Colesterol', 'Ácidos Grasos Libres 3:1:1'],
          suggestedSteps: ['Limpieza suave con agua templada', 'Tónico hidratante sin fragancia', 'Emulsión rica en ceramidas'],
          clinicalRationale: 'Rellena el cemento intercorneocitario para detener la pérdida transepidérmica de agua (TEWL).',
          precautions: ['Cero fragancias, aceites esenciales o alcohol desnaturalizado']
        },
        {
          nightNumber: 3,
          category: 'RECOVERY',
          title: 'Hidratación Profunda & NMF',
          subtitle: 'Factores naturales de humectación',
          badgeColor: 'emerald',
          recommendedActives: ['Ácido Hialurónico multimolecular', 'Glicerina vegetal', 'Ectoína'],
          suggestedSteps: ['Limpiador en crema', 'Serum humectante sobre piel húmeda', 'Crema nutritiva barrera'],
          clinicalRationale: 'Aporta agua biológicamente disponible a las capas superiores del estrato córneo.',
          precautions: ['Aplicar el hialurónico siempre sobre piel húmeda']
        },
        {
          nightNumber: 4,
          category: 'RECOVERY',
          title: 'Sellado Oclusivo Fisiológico',
          subtitle: 'Protección nocturna de sellado',
          badgeColor: 'emerald',
          recommendedActives: ['Escualano puro', 'Bisabolol', 'Manteca de Karité refinada'],
          suggestedSteps: ['Limpieza ultrasuave', 'Hidratante reparador', '2 gotas de escualano como sellador'],
          clinicalRationale: 'Crea una película semipermeable que previene la evaporación de agua sin asfixiar el folículo.',
          precautions: ['Si tienes tendencia acneica, usa escualano vegetal en vez de vaselina densa']
        }
      ],
      clinicalAdvice: [
        'Mantén este protocolo de rescate durante 10 a 14 días.',
        'No reintroduzcas ácidos exfoliantes ni retinoides hasta que cese cualquier ardor al aplicar crema hidratante.',
        'El uso diario de protector solar FPS 50+ mineral es estrictamente indispensable por las mañanas.'
      ],
      suitableExfoliants: ['Ninguno durante fase de recuperación'],
      suitableRetinoidsOrAlternatives: ['Ninguno durante fase de recuperación'],
      suitableMoisturizers: ['La Roche-Posay Cicaplast B5+', 'Bioderma Atoderm Intensive Baume', 'Avene Cicalfate+', 'CeraVe Crema Hidratante']
    };
  }

  // CASO 2: EMBARAZO O LACTANCIA
  if (pregnancyOrNursing) {
    const cycleLength = isSensitive || barrierStatus === 'COMPROMISED' ? 5 : 4;
    return {
      id: 'maternity-safe-cycling',
      cycleLength,
      protocolName: 'Skin Cycling Materno-Seguro (Pregnancy & Nursing Safe)',
      summary: 'Protocolo dermatológico 100% libre de derivados de vitamina A (retinoides) y altas concentraciones de salicílico. Emplea fitoretinoles biocompatibles y ácidos suaves para luminosidad segura.',
      barrierScore: 'ÓPTIMO',
      nights: [
        {
          nightNumber: 1,
          category: 'EXFOLIATION',
          title: 'Exfoliación con Ácido Azelaico / Mandélico',
          subtitle: 'Clínicamente seguro en embarazo',
          badgeColor: 'teal',
          recommendedActives: ['Ácido Azelaico 10-15%', 'Ácido Láctico 5%', 'Gluconolactona (PHA)'],
          suggestedSteps: ['Limpiador en gel suave', 'Serum/Tratamiento con Azelaico o PHA', 'Hidratante ligero biocompatible'],
          clinicalRationale: 'El Ácido Azelaico es categoría B de seguridad, ideal para controlar brotes hormonales y melasma gestacional sin riesgo sistémico.',
          precautions: ['Evitar Ácido Salicílico en concentraciones mayores al 2% o peelings químicos profundos']
        },
        {
          nightNumber: 2,
          category: 'RETINOID',
          title: 'Alternativa Fito-Retinoide (Bakuchiol)',
          subtitle: 'Bio-renovación celular no teratogénica',
          badgeColor: 'purple',
          recommendedActives: ['Bakuchiol 1-2%', 'Péptidos de Cobre', 'Niacinamida 4%'],
          suggestedSteps: ['Limpieza facial', 'Serum de Bakuchiol sobre piel seca', 'Crema hidratante nutritiva'],
          clinicalRationale: 'El Bakuchiol activa las vías de síntesis de colágeno similares al retinol sin unirse a los receptores nucleares de ácido retinoico, haciéndolo seguro en gestación.',
          precautions: ['Los retinoides tópicos (tretinoína, retinol, retinal) están contraindicados']
        },
        {
          nightNumber: 3,
          category: 'RECOVERY',
          title: 'Recuperación & Fortalecimiento de Barrera',
          subtitle: 'Hidratación y calma',
          badgeColor: 'emerald',
          recommendedActives: ['Ceramidas', 'Centella Asiática', 'Ácido Hialurónico'],
          suggestedSteps: ['Limpiador hidratante', 'Serum humectante', 'Crema reparadora'],
          clinicalRationale: 'Mantiene la elasticidad y previene la reactividad cutánea propia de los cambios hormonales.',
          precautions: ['Mantener la rutina libre de perfumes sintéticos irritantes']
        },
        {
          nightNumber: 4,
          category: 'RECOVERY',
          title: 'Nutrición Profunda & Antioxidantes',
          subtitle: 'Protección contra el estrés oxidativo',
          badgeColor: 'emerald',
          recommendedActives: ['Pantenol', 'Escualano', 'Vitamina E'],
          suggestedSteps: ['Limpieza facial', 'Crema barrera rica', 'Oclusivo suave opcional'],
          clinicalRationale: 'Optimiza la síntesis de filagrina y lípidos cutáneos.',
          precautions: ['Uso ininterrumpido de protector solar de amplio espectro por las mañanas']
        }
      ],
      clinicalAdvice: [
        'Especialmente formulado para prevenir el cloasma / melasma gestacional.',
        'La fotoprotección matutina con filtros minerales (Óxido de Zinc / Dióxido de Titanio) es la mejor defensa frente a la pigmentación hormonal.',
        'Consulta siempre a tu obstetra o dermatólogo sobre nuevos activos.'
      ],
      suitableExfoliants: ['The Ordinary Azelaic Acid Suspension 10%', 'Paula’s Choice 10% Azelaic Acid Booster', 'Geek & Gorgeous Calm Down (PHA)'],
      suitableRetinoidsOrAlternatives: ['Medik8 Bakuchiol Peptides', 'The Inkey List Bakuchiol Moisturizer', 'Biossance Squalane + Phyto-Retinol Serum'],
      suitableMoisturizers: ['La Roche-Posay Toleriane Dermallergo', 'Bioderma Sensibio Defensive', 'CeraVe Facial Moisturising Lotion PM']
    };
  }

  // CASO 3: PIEL SENSIBLE / ROSÁCEA / BARRERA COMPROMETIDA O PRINCIPIANTE (CICLO DE 5 NOCHES)
  if (isSensitive || barrierStatus === 'COMPROMISED' || experienceLevel === 'BEGINNER') {
    const exfoliantText = isHighFitzpatrick || hasRosacea
      ? 'Ácido Mandélico 5-10% o Gluconolactona (PHA)'
      : 'Ácido Láctico 5% o PHA';

    const retinoidText = experienceLevel === 'BEGINNER'
      ? 'Retinaldehído encapsulado 0.05% o Retinol 0.2% con método sándwich'
      : 'Retinaldehído 0.05% o Retinol de liberación prolongada';

    return {
      id: 'gentle-5night-cycling',
      cycleLength: 5,
      protocolName: 'Protocolo de Skin Cycling Suave (Ciclo de 5 Noches)',
      summary: 'Diseñado específicamente con un ciclo extendido de 3 noches de recuperación para tolerar activos potentes sin desencadenar eritema, descamación ni reactividad vascular.',
      barrierScore: 'MODERADO',
      nights: [
        {
          nightNumber: 1,
          category: 'EXFOLIATION',
          title: 'Exfoliación Química Suave de Gran Peso Molecular',
          subtitle: 'Renovación sin irritación epidérmica',
          badgeColor: 'teal',
          recommendedActives: [exfoliantText, 'Ácido Azelaico 10%', 'Pantenol'],
          suggestedSteps: ['Limpieza syndet', 'Aplicar exfoliante sobre piel seca', 'Hidratante emoliente 10 min después'],
          clinicalRationale: 'Los ácidos de alto peso molecular penetran de manera homogénea y lenta, minimizando el riesgo de eritema y manchas post-inflamatorias.',
          precautions: ['No frotar la piel', 'Evitar contorno de ojos y comisuras labiales']
        },
        {
          nightNumber: 2,
          category: 'RETINOID',
          title: 'Retinoide Gradual (Tolerancia Progresiva)',
          subtitle: 'Estimulación de colágeno controlada',
          badgeColor: 'indigo',
          recommendedActives: [retinoidText, 'Niacinamida 2-4%'],
          suggestedSteps: [
            'Paso 1: Capa fina de hidratante ligero (amortiguador)',
            'Paso 2: Retinoide del tamaño de un guisante',
            'Paso 3: Segunda capa de crema hidratante (Método Sándwich)'
          ],
          clinicalRationale: 'El método sándwich disminuye el pico de absorción irritativo manteniendo la actividad en los receptores nucleares celulares.',
          precautions: ['Aplicar con la piel 100% seca para evitar absorción excesiva']
        },
        {
          nightNumber: 3,
          category: 'RECOVERY',
          title: 'Recuperación 1: Calma & Antiinflamación',
          subtitle: 'Descanso celular activo',
          badgeColor: 'emerald',
          recommendedActives: ['Centella Asiática (Cica)', 'Ectoína', 'Bisabolol'],
          suggestedSteps: ['Limpieza con agua templada', 'Serum calmante concentrado', 'Crema reconfortante'],
          clinicalRationale: 'Neutraliza los mediadores de inflamación antes de que se produzca eritema visible.',
          precautions: ['Ningún exfoliante ni cepillo de limpieza']
        },
        {
          nightNumber: 4,
          category: 'RECOVERY',
          title: 'Recuperación 2: Reparación de Barrera',
          subtitle: 'Aporte de lípidos fisiológicos',
          badgeColor: 'emerald',
          recommendedActives: ['Complejo de 3 Ceramidas', 'Colesterol', 'Ácido Hialurónico'],
          suggestedSteps: ['Limpiador hidratante suave', 'Serum humectante', 'Crema de barrera rica'],
          clinicalRationale: 'Restaura la cohesión intercelular del estrato córneo.',
          precautions: ['Asegurar hidratación constante']
        },
        {
          nightNumber: 5,
          category: 'RECOVERY',
          title: 'Recuperación 3: Consolidación & Oclusión',
          subtitle: 'Garantía de reposo antes del nuevo ciclo',
          badgeColor: 'emerald',
          recommendedActives: ['Escualano vegetal', 'Pantenol 5%', 'Avena Coloidal'],
          suggestedSteps: ['Limpieza suave', 'Crema humectante', 'Toque de escualano en zonas secas'],
          clinicalRationale: 'Esta noche extra de recuperación asegura que el ciclo se reinicie con la barrera en un estado de resiliencia óptimo.',
          precautions: ['Si sientes la piel tirante, repite otra noche de recuperación']
        }
      ],
      clinicalAdvice: [
        'Si experimentas descamación o picor, aumenta las noches de recuperación a 4 noches.',
        'El protector solar FPS 50+ de amplio espectro debe aplicarse cada mañana sin excepción.',
        'Introduce un activo a la vez si eres completamente nuevo/a en el uso de ácidos.'
      ],
      suitableExfoliants: [
        'The Ordinary Mandelic Acid 10% + HA',
        'Geek & Gorgeous Calm Down 4% PHA + BHA',
        'Isntree Chestnut PHA 5% Clear Toner'
      ],
      suitableRetinoidsOrAlternatives: [
        'Geek & Gorgeous A-Game 5 (Retinal 0.05%)',
        'Medik8 Crystal Retinal 1 o 3',
        'CeraVe Resurfacing Retinol Serum'
      ],
      suitableMoisturizers: [
        'La Roche-Posay Cicaplast B5+ Gel/Crema',
        'Avene Tolérance Control Crema Calmante',
        'Purito Dermide Cica Barrier Sleeping Pack'
      ]
    };
  }

  // CASO 4: PROTOCOLO CLÁSICO / AVANZADO (CICLO DE 4 NOCHES PERSONALIZADO)
  const isAcneOily = hasAcne || skinType === 'OILY' || skinType === 'COMBINATION';
  const exfoliantActives = isAcneOily
    ? ['Ácido Salicílico 2% (BHA)', 'Ácido Glicólico 7% (AHA)', 'Zinc PCA']
    : isHighFitzpatrick
      ? ['Ácido Mandélico 10%', 'Ácido Láctico 10%', 'Ácido Tranexámico']
      : ['Ácido Glicólico 8-10%', 'Ácido Láctico 10%', 'Ácido Salicílico 1%'];

  const retinoidActives = experienceLevel === 'ADVANCED'
    ? ['Retinaldehído 0.1%', 'Tretinoína 0.025-0.05% (bajo prescripción)', 'Retinol puro 1%']
    : ['Retinaldehído 0.05-0.1%', 'Retinol puro 0.3-0.5%', 'Granactive Retinoid 2%'];

  return {
    id: 'dermatological-classic-4night',
    cycleLength: 4,
    protocolName: 'Protocolo Científico de Skin Cycling (4 Noches Optimizado)',
    summary: `Estrategia de ciclado nocturno optimizada para tu biotipo ${skinType.toLowerCase()} con fototipo ${fitzpatrick}. Maximiza la síntesis de colágeno y la renovación celular mientras protege la integridad epidérmica.`,
    barrierScore: 'ÓPTIMO',
    nights: [
      {
        nightNumber: 1,
        category: 'EXFOLIATION',
        title: 'Noche 1: Exfoliación Química Focalizada',
        subtitle: isAcneOily ? 'Limpieza de poros profunda & queratolítico' : 'Renovación epidérmica y brillo celular',
        badgeColor: 'teal',
        recommendedActives: exfoliantActives,
        suggestedSteps: [
          'Limpiador facial en gel o espuma suave',
          'Aplicar exfoliante químico líquido sobre piel limpia y completamente seca',
          'Esperar 10-15 minutos para permitir la acción a pH óptimo',
          'Crema hidratante libre de otros activos irritantes'
        ],
        clinicalRationale: isAcneOily 
          ? 'El BHA lipofílico penetra el sebo folicular disolviendo el tapón córneo de comedones y bacterias.' 
          : 'Los hidroxiácidos disuelven las uniones desmosómicas entre corneocitos, promoviendo una textura lisa y uniforme.',
        precautions: ['No combinar con vitamina C pura ni con otros ácidos en la misma noche', 'Evitar contorno de ojos']
      },
      {
        nightNumber: 2,
        category: 'RETINOID',
        title: 'Noche 2: Retinoide de Alta Eficacia',
        subtitle: 'Renovación celular profunda & síntesis de procolágeno',
        badgeColor: 'indigo',
        recommendedActives: retinoidActives,
        suggestedSteps: [
          'Limpiador suave no astringente',
          'Asegurar secado completo durante 10 minutos (piel sin humedad)',
          'Aplicar dosis del tamaño de un guisante en rostro y cuello',
          'Sellar con crema hidratante reparadora'
        ],
        clinicalRationale: 'Estimula la transcripción genética en queratinocitos y fibroblastos, incrementando el recambio celular basal y la matriz extracelular.',
        precautions: ['No aplicar sobre piel húmeda para evitar absorción errática', 'Usar protección estricta en párpados con vaselina previa']
      },
      {
        nightNumber: 3,
        category: 'RECOVERY',
        title: 'Noche 3: Recuperación de Barrera Cutánea',
        subtitle: 'Hidratación profunda y reposición lipídica',
        badgeColor: 'emerald',
        recommendedActives: ['Ceramidas NP/AP/EOP', 'Centella Asiática (Madecassoside)', 'Ácido Hialurónico'],
        suggestedSteps: [
          'Limpiador hidratante syndet',
          'Serum humectante con hialurónico o niacinamida 2-5% sobre piel húmeda',
          'Crema de barrera rica en ceramidas y colesterol'
        ],
        clinicalRationale: 'Permite que las células de Langerhans y la barrera cutánea se reestabilicen sin sobrecarga de exfoliantes.',
        precautions: ['Cero ácidos o retinoides en esta noche']
      },
      {
        nightNumber: 4,
        category: 'RECOVERY',
        title: 'Noche 4: Consolidación & Sellado Lipídico',
        subtitle: 'Restauración del estrato córneo antes de reiniciar el ciclo',
        badgeColor: 'emerald',
        recommendedActives: ['Pantenol (Pro-vitamina B5)', 'Escualano Puro', 'Avena Coloidal'],
        suggestedSteps: [
          'Limpieza suave',
          'Hidratación nutritiva multicapa',
          'Oclusivo ligero según biotipo para sellar la hidratación'
        ],
        clinicalRationale: 'Garantiza que la piel mantenga una función barrera intacta antes de recibir el ácido exfoliante de la Noche 1.',
        precautions: ['Revisar que la piel no presente enrojecimiento persistente antes de volver a la Noche 1']
      }
    ],
    clinicalAdvice: [
      'Usa siempre protector solar FPS 50+ con protección UVA/UVB/Luz Azul cada mañana.',
      'Si presentas brotes de purga (purging) controlados en las primeras 4 semanas, mantén el ciclo constante sin sobre-exfoliar.',
      'Si sientes la piel tirante o enrojecida, puedes intercalar una noche extra de recuperación entre la noche 2 y 3.'
    ],
    suitableExfoliants: isAcneOily
      ? ['Paula’s Choice 2% BHA Liquid Exfoliant', 'The Ordinary Salicylic Acid 2% Anhydrous', 'COSRX BHA Blackhead Power Liquid']
      : ['The Ordinary Lactic Acid 10% + HA', 'Sunday Riley Good Genes Glycolic', 'Geek & Gorgeous Smooth Out (AHA 12%)'],
    suitableRetinoidsOrAlternatives: [
      'Geek & Gorgeous A-Game 10 (Retinal 0.1%)',
      'Medik8 Crystal Retinal 6 / 10',
      'The Ordinary Granactive Retinoid 2% Emulsion',
      'La Roche-Posay Retinol B3 Serum'
    ],
    suitableMoisturizers: isAcneOily
      ? ['La Roche-Posay Effaclar H Iso-Biome', 'Neutrogena Hydro Boost Water Gel', 'Bioderma Sebium Hydra']
      : ['CeraVe Moisturizing Cream', 'Illiyoon Ceramide Ato Concentrate Cream', 'Avene Cicalfate+ Restorative Cream']
  };
}
