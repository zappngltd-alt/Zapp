export interface FintechProduct {
  id: string;
  name: string;
  price: number;
  validity?: string;
  category: "data" | "airtime" | "electricity" | "tv";
  providerId: string;
}

export interface FintechProvider {
  id: string;
  name: string;
  logo: string;
  category: "data" | "airtime" | "electricity" | "tv";
}

export const FINTECH_PROVIDERS: FintechProvider[] = [
  // Telcos
  { id: "mtn", name: "MTN", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg", category: "data" },
  { id: "airtel", name: "Airtel", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Airtel_logo.svg", category: "data" },
  { id: "glo", name: "Glo", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Globacom_Logo.svg", category: "data" },
  { id: "9mobile", name: "9mobile", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/9mobile_Logo.svg", category: "data" },
  
  { id: "mtn_airtime", name: "MTN", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg", category: "airtime" },
  { id: "airtel_airtime", name: "Airtel", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Airtel_logo.svg", category: "airtime" },
  { id: "glo_airtime", name: "Glo", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Globacom_Logo.svg", category: "airtime" },
  { id: "9mobile_airtime", name: "9mobile", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/9mobile_Logo.svg", category: "airtime" },

  // Electricity
  { id: "ikeja", name: "Ikeja Electric", logo: "⚡", category: "electricity" },
  { id: "eko", name: "Eko Electric", logo: "⚡", category: "electricity" },
  { id: "abuja", name: "Abuja Electric", logo: "⚡", category: "electricity" },
  { id: "ibadan", name: "Ibadan Electric", logo: "⚡", category: "electricity" },
  { id: "jos", name: "Jos Electric", logo: "⚡", category: "electricity" },
  { id: "kano", name: "Kano Electric", logo: "⚡", category: "electricity" },
  { id: "enugu", name: "Enugu Electric", logo: "⚡", category: "electricity" },
  { id: "port_harcourt", name: "PHED Electric", logo: "⚡", category: "electricity" },

  // TV
  { id: "dstv", name: "DStv", logo: "📺", category: "tv" },
  { id: "gotv", name: "GOtv", logo: "📺", category: "tv" },
  { id: "startimes", name: "StarTimes", logo: "📺", category: "tv" },
];

export const DATA_PLANS: FintechProduct[] = [
  // MTN SME (Popular)
  { id: "mtn-sme-1gb", name: "1GB SME", price: 260, validity: "30 Days", category: "data", providerId: "mtn" },
  { id: "mtn-sme-2gb", name: "2GB SME", price: 520, validity: "30 Days", category: "data", providerId: "mtn" },
  { id: "mtn-sme-3gb", name: "3GB SME", price: 780, validity: "30 Days", category: "data", providerId: "mtn" },
  { id: "mtn-sme-5gb", name: "5GB SME", price: 1300, validity: "30 Days", category: "data", providerId: "mtn" },
  { id: "mtn-sme-10gb", name: "10GB SME", price: 2600, validity: "30 Days", category: "data", providerId: "mtn" },

  // MTN Gifting/Corporate
  { id: "mtn-cg-1gb", name: "1GB Corporate", price: 300, validity: "30 Days", category: "data", providerId: "mtn" },
  { id: "mtn-daily-200mb", name: "200MB Daily", price: 200, validity: "1 Day", category: "data", providerId: "mtn" },
  { id: "mtn-weekly-1gb", name: "1GB Weekly", price: 500, validity: "7 Days", category: "data", providerId: "mtn" },

  // Airtel
  { id: "airtel-cg-1gb", name: "1GB Corporate", price: 280, validity: "30 Days", category: "data", providerId: "airtel" },
  { id: "airtel-cg-2gb", name: "2GB Corporate", price: 560, validity: "30 Days", category: "data", providerId: "airtel" },
  { id: "airtel-daily-100mb", name: "100MB Daily", price: 100, validity: "1 Day", category: "data", providerId: "airtel" },
  { id: "airtel-weekly-750mb", name: "750MB Weekly", price: 500, validity: "7 Days", category: "data", providerId: "airtel" },
  { id: "airtel-cg-5gb", name: "5GB Corporate", price: 1400, validity: "30 Days", category: "data", providerId: "airtel" },

  // Glo
  { id: "glo-cg-1gb", name: "1GB Corporate", price: 250, validity: "30 Days", category: "data", providerId: "glo" },
  { id: "glo-cg-2gb", name: "2GB Corporate", price: 500, validity: "30 Days", category: "data", providerId: "glo" },

  // 9mobile
  { id: "9mob-cg-1gb", name: "1GB Corporate", price: 200, validity: "30 Days", category: "data", providerId: "9mobile" },

  // TV - DStv
  { id: "dstv-padi", name: "DStv Padi", price: 2950, category: "tv", providerId: "dstv" },
  { id: "dstv-yanga", name: "DStv Yanga", price: 4200, category: "tv", providerId: "dstv" },
  { id: "dstv-confam", name: "DStv Confam", price: 6200, category: "tv", providerId: "dstv" },
  { id: "dstv-compact", name: "DStv Compact", price: 12500, category: "tv", providerId: "dstv" },

  // TV - GOtv
  { id: "gotv-smallie", name: "GOtv Smallie", price: 1300, category: "tv", providerId: "gotv" },
  { id: "gotv-jinja", name: "GOtv Jinja", price: 2700, category: "tv", providerId: "gotv" },
  { id: "gotv-jolli", name: "GOtv Jolli", price: 3950, category: "tv", providerId: "gotv" },
  { id: "gotv-max", name: "GOtv Max", price: 5700, category: "tv", providerId: "gotv" },
];
