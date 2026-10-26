/**
 * tests/e2e/helpers/fixtures.mjs
 * Authoritative test fixtures for E2E opaque-box validation
 */

export const INCI_FIXTURES = {
  standardFormula: 'Aqua, Niacinamide, Zinc PCA, Glycerin, Phenoxyethanol, Ethylhexylglycerin',
  retinolFormula: 'Aqua, Caprylic/Capric Triglyceride, Glycerin, Retinol, Polysorbate 20, BHT',
  exfoliatingFormula: 'Aqua, Glycolic Acid, Sodium Hydroxide, Aloe Barbadensis Leaf Water, Panax Ginseng Root Extract',
  salicylicFormula: 'Aqua, Hamamelis Virginiana Water, Cocamidopropyl Dimethylamine, Salicylic Acid, Dimethyl Isosorbide',
  maternitySafeFormula: 'Aqua, Azelaic Acid, Glycerin, Propanediol, Bakuchiol, Centella Asiatica Extract',
  barrierRescueFormula: 'Aqua, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Squalane, Panthenol',
  extremeLongFormula: Array.from({ length: 60 }, (_, i) => `Ingredient_${i + 1}`).join(', '),
  conflictingFormulaPair1: {
    productA: 'Aqua, Salicylic Acid, Alcohol Denat',
    productB: 'Aqua, Retinol, Caprylic/Capric Triglyceride',
    expectedConflictType: 'IRRITATION_OVERLOAD',
  },
  conflictingFormulaPair2: {
    productA: 'Aqua, Glycolic Acid, Sodium Hydroxide',
    productB: 'Aqua, Niacinamide, Glycerin',
    expectedConflictType: 'PH_INCOMPATIBILITY',
  },
  conflictingFormulaPair3: {
    productA: 'Aqua, Benzoyl Peroxide, Carbomer',
    productB: 'Aqua, Retinol, Polysorbate 20',
    expectedConflictType: 'CHEMICAL_DEGRADATION',
  },
};

export const STORE_FIXTURES = {
  validStore: {
    name: 'Farmacia Dermatológica San Rafael',
    description: 'Especialistas en dermocosmética y fórmulas magistrales con atención personalizada.',
    phone: '+58 212 555 1234',
    whatsapp: '+584141234567',
    instagram: '@farmacia_sanrafael',
    website: 'https://farmaciasanrafael.com',
    status: 'ACTIVE',
    verification_status: 'VERIFIED',
    subscription_tier: 'PREMIUM',
  },
  validBranch: {
    name: 'Sede Principal Las Mercedes',
    city: 'Caracas',
    state: 'Distrito Capital',
    country: 'Venezuela',
    address: 'Av. Principal de Las Mercedes, Edif. Torre Centro, Local 1',
    latitude: 10.4806,
    longitude: -66.8601,
    phone: '+58 212 555 1235',
    whatsapp: '+584141234567',
    is_active: true,
  },
  secondBranch: {
    name: 'Sede Chacao',
    city: 'Caracas',
    state: 'Distrito Capital',
    country: 'Venezuela',
    address: 'Calle Elice, Centro Lido, Nivel PB',
    latitude: 10.4922,
    longitude: -66.8528,
    phone: '+58 212 555 9876',
    whatsapp: '+584149876543',
    is_active: true,
  },
};

export const USER_FIXTURES = {
  standardUser: {
    id: 101,
    name: 'Valentina Mendoza',
    email: 'valentina.mendoza@example.com',
    role: 'standard_user',
    token: 'jwt-auth-token-user-101',
    is_active: true,
  },
  businessOwner: {
    id: 102,
    name: 'Dr. Alejandro Morales',
    email: 'dr.morales@farmaciasanrafael.com',
    role: 'business_owner',
    token: 'jwt-auth-token-business-102',
    is_active: true,
  },
  adminUser: {
    id: 103,
    name: 'Superintendente Admin',
    email: 'admin.ops@allabout.skin',
    role: 'admin',
    token: 'jwt-auth-token-admin-103',
    is_active: true,
  },
  superAdmin: {
    id: 104,
    name: 'Director General',
    email: 'superadmin@allabout.skin',
    role: 'super_admin',
    token: 'jwt-auth-token-superadmin-104',
    is_active: true,
  },
};

export const DLG_EXEC_TOKENS = {
  canvasBackground: '#FAF8F5',
  cardBackground: '#FFFFFF',
  brandAccent: '#4A6B5B',
  borderDefault: '#E2E8F0', // slate-200
  textPrimary: '#0F172A', // slate-900
  textMuted: '#64748B', // slate-500
  maxBorderRadiusPx: 12, // rounded-lg / rounded-md
  maxShadowOpacity: 0.08,
};

export const SCRAPER_FIXTURES = {
  vtexCatalogResponse: [
    {
      productId: '1001',
      productName: 'The Ordinary Niacinamide 10% + Zinc 1%',
      brand: 'The Ordinary',
      items: [
        {
          itemId: '1001-1',
          name: '30ml',
          sellers: [
            {
              sellerId: '1',
              commertialOffer: {
                Price: 12.50,
                ListPrice: 15.00,
                AvailableQuantity: 45,
              },
            },
          ],
        },
      ],
    },
  ],
  shopifySuggestResponse: {
    resources: {
      results: {
        products: [
          {
            id: 2001,
            title: 'CeraVe Hydrating Facial Cleanser 236ml',
            vendor: 'CeraVe',
            price: '14.99',
            available: true,
            url: '/products/cerave-hydrating-cleanser',
          },
        ],
      },
    },
  },
  wooCommerceStoreResponse: [
    {
      id: 3001,
      name: 'La Roche-Posay Anthelios UVMune 400 SPF 50+',
      prices: {
        price: '2400',
        regular_price: '2600',
        currency_code: 'USD',
        currency_minor_unit: 2,
      },
      is_in_stock: true,
    },
  ],
  schemaOrgLdJson: {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Bioderma Sensibio H2O Micellar Water 500ml',
    brand: {
      '@type': 'Brand',
      name: 'Bioderma',
    },
    offers: {
      '@type': 'Offer',
      price: '18.75',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
};
