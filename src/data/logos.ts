/**
 * Logo Configuration for Zapp React Native
 * 
 * Contains brand colors and abbreviations for all service providers.
 * Used by BrandLogo component to create gradient-based logo badges.
 */

export interface LogoConfig {
  fallbackAbbr: string;
  colors: string[]; // Gradient colors for LinearGradient
}

// Bank Logos
export const bankLogos: Record<string, LogoConfig> = {
  'OPay': {
    fallbackAbbr: 'OP',
    colors: ['#10b981', '#059669', '#047857']
  },
  'PalmPay': {
    fallbackAbbr: 'PP',
    colors: ['#1d4ed8', '#2563eb', '#4338ca']
  },
  'Kuda Bank': {
    fallbackAbbr: 'KD',
    colors: ['#9333ea', '#a855f7', '#c026d3']
  },
  'Moniepoint': {
    fallbackAbbr: 'MP',
    colors: ['#2563eb', '#3b82f6', '#06b6d4']
  },
  'GTBank': {
    fallbackAbbr: 'GT',
    colors: ['#ea580c', '#f97316']
  },
  'Access Bank': {
    fallbackAbbr: 'AB',
    colors: ['#f97316', '#fb923c']
  },
  'Zenith Bank': {
    fallbackAbbr: 'ZB',
    colors: ['#dc2626', '#ef4444']
  },
  'UBA': {
    fallbackAbbr: 'UBA',
    colors: ['#b91c1c', '#dc2626']
  },
  'First Bank': {
    fallbackAbbr: 'FB',
    colors: ['#1e3a8a', '#1e40af']
  },
  'Stanbic IBTC': {
    fallbackAbbr: 'SB',
    colors: ['#2563eb', '#3b82f6']
  },
  'Fidelity Bank': {
    fallbackAbbr: 'FD',
    colors: ['#9333ea', '#a855f7']
  },
  'Ecobank': {
    fallbackAbbr: 'EC',
    colors: ['#1d4ed8', '#2563eb']
  },
  'Union Bank': {
    fallbackAbbr: 'UB',
    colors: ['#1e40af', '#1d4ed8']
  },
  'Wema Bank': {
    fallbackAbbr: 'WB',
    colors: ['#7e22ce', '#9333ea']
  },
  'VFD Microfinance Bank': {
    fallbackAbbr: 'VFD',
    colors: ['#c2410c', '#ea580c']
  },
  'Polaris Bank': {
    fallbackAbbr: 'PB',
    colors: ['#991b1b', '#b91c1c']
  },
};

// Telecom Logos
export const telecomLogos: Record<string, LogoConfig> = {
  'MTN': {
    fallbackAbbr: 'MTN',
    colors: ['#eab308', '#facc15', '#f59e0b']
  },
  'MTN Nigeria': {
    fallbackAbbr: 'MTN',
    colors: ['#eab308', '#facc15', '#f59e0b']
  },
  'Airtel': {
    fallbackAbbr: 'ART',
    colors: ['#dc2626', '#ef4444', '#f43f5e']
  },
  'Airtel Nigeria': {
    fallbackAbbr: 'ART',
    colors: ['#dc2626', '#ef4444', '#f43f5e']
  },
  'Glo': {
    fallbackAbbr: 'GLO',
    colors: ['#16a34a', '#22c55e', '#10b981']
  },
  'Glo Nigeria': {
    fallbackAbbr: 'GLO',
    colors: ['#16a34a', '#22c55e', '#10b981']
  },
  '9mobile': {
    fallbackAbbr: '9M',
    colors: ['#047857', '#059669', '#10b981']
  },
};

// Utility Service Logos
export const utilityLogos: Record<string, LogoConfig> = {
  'EKEDC': {
    fallbackAbbr: 'EKEDC',
    colors: ['#ca8a04', '#eab308']
  },
  'IKEDC': {
    fallbackAbbr: 'IKEDC',
    colors: ['#2563eb', '#3b82f6']
  },
  'AEDC': {
    fallbackAbbr: 'AEDC',
    colors: ['#ea580c', '#f97316']
  },
  'IBEDC': {
    fallbackAbbr: 'IBEDC',
    colors: ['#16a34a', '#22c55e']
  },
  'DStv': {
    fallbackAbbr: 'DSTV',
    colors: ['#1d4ed8', '#2563eb']
  },
  'GOtv': {
    fallbackAbbr: 'GOtv',
    colors: ['#dc2626', '#ef4444']
  },
  'StarTimes': {
    fallbackAbbr: 'Star',
    colors: ['#1e40af', '#2563eb']
  },
  'LSWC': {
    fallbackAbbr: 'LSWC',
    colors: ['#0ea5e9', '#3b82f6']
  },
};

// Momo Logos
export const momoLogos: Record<string, LogoConfig> = {
  'MTN MoMo': {
    fallbackAbbr: 'MoMo',
    colors: ['#eab308', '#facc15', '#f59e0b']
  },
  'Airtel SmartCash': {
    fallbackAbbr: 'SC',
    colors: ['#dc2626', '#ef4444', '#f43f5e']
  },
};

/**
 * Get logo configuration for any service
 */
export function getLogo(
  serviceName: string,
  category: 'bank' | 'telecom' | 'utility' | 'emergency' | 'custom' | 'momo' | 'general'
): LogoConfig {
  let logos: Record<string, LogoConfig>;
  
  switch (category) {
    case 'bank':
      logos = bankLogos;
      break;
    case 'telecom':
      logos = telecomLogos;
      break;
    case 'utility':
    case 'general':
      logos = utilityLogos;
      break;
    case 'momo':
      logos = momoLogos;
      break;
    case 'custom':
      return { 
        fallbackAbbr: serviceName.slice(0, 3).toUpperCase(), 
        colors: ['#10b981', '#3b82f6'] // Special gradient for custom
      };
    default:
      return { 
        fallbackAbbr: serviceName.slice(0, 3).toUpperCase(), 
        colors: ['#6b7280', '#9ca3af'] 
      };
  }
  
  return logos[serviceName] || { 
    fallbackAbbr: serviceName.slice(0, 3).toUpperCase(), 
    colors: ['#6b7280', '#9ca3af'] 
  };
}
