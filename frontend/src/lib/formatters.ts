/**
 * Formateadores monetarios y geográficos universales para Allabout.skin
 * Cumple con directivas DLG-EXEC: sobriedad, consistencia y precisión visual.
 */

const CURRENCY_LOCALES: Record<string, string> = {
  VES: 'es-VE',
  CLP: 'es-CL',
  COP: 'es-CO',
  MXN: 'es-MX',
  EUR: 'es-ES',
  PEN: 'es-PE',
  ARS: 'es-AR',
  DOP: 'es-DO',
  HNL: 'es-HN',
  BRL: 'pt-BR',
  GBP: 'en-GB',
  USD: 'en-US',
};

const ZERO_DECIMAL_CURRENCIES = new Set(['CLP', 'COP', 'PYG', 'JPY']);

/**
 * Formatea un monto en dólares estadounidenses (USD) con formato estándar.
 * Ej: 20 -> "$20.00 USD"
 */
export function formatUsd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '$0.00 USD';
  }
  const val = Number(amount);
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

/**
 * Formatea el precio en divisa local según los estándares de cada país.
 * Ej:
 *  - VES: "Bs. 17.181,20"
 *  - CLP: "$18.500 CLP"
 *  - COP: "$85.000 COP"
 *  - EUR: "20,00 €"
 *  - DOP: "RD$ 200.00 DOP"
 *  - USD: "$20.00 USD"
 */
export function formatLocalPrice(
  amount: number | null | undefined,
  currency: string = 'USD',
  countryCode?: string
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'N/D';
  }

  const curr = (currency || 'USD').toUpperCase().trim();
  const val = Number(amount);
  const locale = CURRENCY_LOCALES[curr] || 'en-US';
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(curr);

  const formattedNum = val.toLocaleString(locale, {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  });

  switch (curr) {
    case 'VES':
      return `Bs. ${formattedNum}`;
    case 'CLP':
      return `$${formattedNum} CLP`;
    case 'COP':
      return `$${formattedNum} COP`;
    case 'MXN':
      return `$${formattedNum} MXN`;
    case 'EUR':
      return `${formattedNum} €`;
    case 'DOP':
      return `RD$ ${formattedNum} DOP`;
    case 'PEN':
      return `S/ ${formattedNum}`;
    case 'ARS':
      return `$${formattedNum} ARS`;
    case 'BRL':
      return `R$ ${formattedNum}`;
    case 'GBP':
      return `£${formattedNum}`;
    default:
      return `$${formattedNum} ${curr}`;
  }
}

/**
 * Retorna la bandera emoji correspondiente al país ISO (2 letras).
 */
export function getCountryFlag(countryCode?: string): string {
  const code = (countryCode || 'GLOBAL').toUpperCase().trim();
  const flags: Record<string, string> = {
    VE: '🇻🇪',
    CL: '🇨🇱',
    CO: '🇨🇴',
    MX: '🇲🇽',
    ES: '🇪🇸',
    DO: '🇩🇴',
    PA: '🇵🇦',
    US: '🇺🇸',
    AR: '🇦🇷',
    PE: '🇵🇪',
    EC: '🇪🇨',
    HN: '🇭🇳',
    SV: '🇸🇻',
    IN: '🇮🇳',
    CH: '🇨🇭',
    GLOBAL: '🌐',
  };
  return flags[code] || '🌐';
}
