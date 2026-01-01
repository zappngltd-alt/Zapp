// COMPREHENSIVE VERIFIED NIGERIAN BANK USSD CODES
// All codes verified from official bank websites and trusted sources
// Last updated: 2025-11-29

import { SearchableService } from './services-data';

// GTBank Services (*737#) - Verified from gtbank.com
export const gtbankServices: SearchableService[] = [
  {
    provider: "GTBank",
    serviceName: "Check Balance",
    code: "*737*6*1#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Transfer to GTBank Account",
    code: "*737*1*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number (NUBAN)", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "GTBank",
    serviceName: "Transfer to Other Banks",
    code: "*737*2*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number (NUBAN)", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "GTBank",
    serviceName: "Buy Airtime (Self)",
    code: "*737*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" }
      ]
    }
  },
  {
    provider: "GTBank",
    serviceName: "Buy Airtime (Others)",
    code: "*737*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 }
      ]
    }
  },
  {
    provider: "GTBank",
    serviceName: "Buy Data",
    code: "*737*4#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Pay Bills",
    code: "*737*5#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Cardless Withdrawal",
    code: "*737*3*AMOUNT#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" }
      ]
    }
  },
  {
    provider: "GTBank",
    serviceName: "Block ATM Card",
    code: "*737*51*74#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Open Account",
    code: "*737*0#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Quick Credit (Loan)",
    code: "*737*51*7#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
];

// Access Bank Services (*901#) - Verified from accessbankplc.com
export const accessBankServices: SearchableService[] = [
  {
    provider: "Access Bank",
    serviceName: "Check Balance",
    code: "*901*00#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Access Bank",
    serviceName: "Check Balance (Alternative)",
    code: "*901*5#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Access Bank",
    serviceName: "Transfer to Access Bank",
    code: "*901*1*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "Access Bank",
    serviceName: "Transfer to Other Banks",
    code: "*901*2*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "Access Bank",
    serviceName: "Buy Airtime (Self)",
    code: "*901*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" }
      ]
    }
  },
  {
    provider: "Access Bank",
    serviceName: "Buy Airtime (Others)",
    code: "*901*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 }
      ]
    }
  },
  {
    provider: "Access Bank",
    serviceName: "Pay Bills",
    code: "*901*3#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "Access Bank",
    serviceName: "Apply for Loan",
    code: "*901*11#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Access Bank",
    serviceName: "Open Account",
    code: "*901*0#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Access Bank",
    serviceName: "Deactivate USSD",
    code: "*901*911#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
];

// Zenith Bank Services (*966#) - Verified from zenithbank.com
export const zenithBankServices: SearchableService[] = [
  {
    provider: "Zenith Bank",
    serviceName: "Check Balance",
    code: "*966*00#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Zenith Bank",
    serviceName: "Transfer to Zenith Account",
    code: "*966*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "Zenith Bank",
    serviceName: "Transfer to Other Banks",
    code: "*966*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "Zenith Bank",
    serviceName: "Buy Airtime (Self)",
    code: "*966*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" }
      ]
    }
  },
  {
    provider: "Zenith Bank",
    serviceName: "Buy Airtime (Others)",
    code: "*966*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 }
      ]
    }
  },
  {
    provider: "Zenith Bank",
    serviceName: "Pay Bills",
    code: "*966*7*AMOUNT*CUSTOMERID#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "CUSTOMERID", label: "Customer ID", placeholder: "123456789", type: "text" }
      ]
    }
  },
  {
    provider: "Zenith Bank",
    serviceName: "BVN Retrieval",
    code: "*966*BVN#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "BVN", label: "BVN", placeholder: "22222222222", type: "number", maxLength: 11 }
      ]
    }
  },
  {
    provider: "Zenith Bank",
    serviceName: "Block Account",
    code: "*966*911#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Zenith Bank",
    serviceName: "Open Account",
    code: "*966*0#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Zenith Bank",
    serviceName: "Reset PIN",
    code: "*966*60#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
];

// UBA Services (*919#) - Verified from ubagroup.com
export const ubaServices: SearchableService[] = [
  {
    provider: "UBA",
    serviceName: "Check Balance",
    code: "*919*00#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "UBA",
    serviceName: "Transfer to UBA Account",
    code: "*919*3*ACCOUNT*AMOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" }
      ]
    }
  },
  {
    provider: "UBA",
    serviceName: "Transfer to Other Banks",
    code: "*919*4*ACCOUNT*AMOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" }
      ]
    }
  },
  {
    provider: "UBA",
    serviceName: "Buy Airtime (Self)",
    code: "*919*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" }
      ]
    }
  },
  {
    provider: "UBA",
    serviceName: "Buy Airtime (Others)",
    code: "*919*PHONE*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" }
      ]
    }
  },
  {
    provider: "UBA",
    serviceName: "Pay Bills",
    code: "*919*5#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "UBA",
    serviceName: "Apply for Loan (Click Credit)",
    code: "*919*28#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "UBA",
    serviceName: "Check BVN",
    code: "*919*18#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "UBA",
    serviceName: "Cardless Withdrawal",
    code: "*919*30*AMOUNT#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" }
      ]
    }
  },
  {
    provider: "UBA",
    serviceName: "Freeze Online Transactions",
    code: "*919*9#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "UBA",
    serviceName: "Open Account",
    code: "*919*20#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
];

// First Bank Services (*894#) - Verified from firstbanknigeria.com
export const firstBankServices: SearchableService[] = [
  {
    provider: "First Bank",
    serviceName: "Check Balance",
    code: "*894*00#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "First Bank",
    serviceName: "Transfer Money",
    code: "*894*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 }
      ]
    }
  },
  {
    provider: "First Bank",
    serviceName: "Buy Airtime (Self)",
    code: "*894*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" }
      ]
    }
  },
  {
    provider: "First Bank",
    serviceName: "Buy Airtime (Others)",
    code: "*894*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 }
      ]
    }
  },
  {
    provider: "First Bank",
    serviceName: "Open Account",
    code: "*894*0#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "First Bank",
    serviceName: "Deactivate USSD",
    code: "*894*911#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
];
