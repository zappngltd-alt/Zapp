// Minimal local dataset for the RN demo app.
// The original project references the main repo's verified-ussd-codes file
// which lives outside this `rn` folder. That import can cause the web
// bundler to fail to transpile files outside the project root. To ensure
// the Expo web app renders during development we provide a small fallback
// dataset here. Replace or expand this with the full dataset if desired.

export const verifiedBanks = [
  {
    name: "Sample Bank",
    shortCode: "*123#",
    services: [
      { label: "Check Balance", code: "*123*1#" },
      { label: "Airtime", code: "*123*2#" },
    ],
  },
];

export const verifiedTelecoms = [
  {
    name: "Sample Telecom",
    shortCode: "*456#",
    services: [{ label: "Buy Data", code: "*456*1#" }],
  },
];

export const verifiedMobileMoney = [
  {
    name: "Sample MM",
    shortCode: "*789#",
    services: [{ label: "Send Money", code: "*789*1#" }],
  },
];

export const verifiedUtilities = [];
export const governmentServices = [];
export const emergencyContacts = [];

export const providersByCategory = {
  Banks: verifiedBanks,
  Telecoms: verifiedTelecoms,
  "Mobile Money": verifiedMobileMoney,
  Utilities: verifiedUtilities,
  Government: governmentServices,
  Emergency: emergencyContacts,
};

export default providersByCategory;
