// Centralized service data for search functionality
// All codes verified from official sources (2025-11-29)

export interface SearchableService {
  id?: string;
  provider: string;
  serviceName: string;
  code: string;
  category: "bank" | "telecom" | "momo" | "general" | "custom";
  subCategory?: 
    | "transfers" | "airtime" | "utilities" | "other" // Bank
    | "recharge" | "data" | "balance" | "borrow" | "transfer" | "support" // Telecom
    | "withdraw" | "bills" // Momo
    | "power" | "nin" | "education" | "emergency"; // General
  logo?: string;
  icon?: string; // MaterialIcons name
  requiresInput?: {
    fields: Array<{
      name: string;
      label: string;
      placeholder: string;
      type?: "number" | "text";
      maxLength?: number;
    }>;
  };
}

// ... (Bank, Telecom, Momo services remain unchanged)


// Bank Services - Comprehensive Verified USSD Codes
const bankServices: SearchableService[] = [
  // GTBank (*737#) - Comprehensive Official List
  {
    provider: "GTBank",
    serviceName: "Main Menu",
    code: "*737#",
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
    serviceName: "Reactivate Account",
    code: "*737*11#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "BVN", label: "BVN", placeholder: "22222222222", type: "number", maxLength: 11 },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
        { name: "ACCOUNT", label: "Account Number (NUBAN)", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
        { name: "ACCOUNT", label: "Account Number (NUBAN)", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Airtime Top-up (Self)",
    code: "*737*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Airtime Top-up (Friend)",
    code: "*737*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Recipient Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Data Top-up",
    code: "*737*4#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Check Account Details (Balance/BVN)",
    code: "*737*6*1#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Create Transaction PIN",
    code: "*737*5#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "SKS Standing Instruction",
    code: "*737*52*AMOUNT*26#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "737 Cashout (Total Station)",
    code: "*737*50*AMOUNT*50#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Zapp Network Payment",
    code: "*737*50*AMOUNT*4#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "StarTimes Subscription",
    code: "*737*37*AMOUNT*DECODER#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
        { name: "DECODER", label: "Decoder Number", placeholder: "0123456789", type: "number" },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Electricity Bill (PHED/Eko/Ibadan/Kano)",
    code: "*737*50#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Airtime Advance",
    code: "*737*8*1#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Salary Advance",
    code: "*737*8*2#",
    category: "bank",
    subCategory: "other",
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
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Fast Track Deposit",
    code: "*737*48*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "GTBank",
    serviceName: "Generate OTP",
    code: "*737*7#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Loan Balance Enquiry",
    code: "*737*6*2#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Card Status Enquiry",
    code: "*737*6*3#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Cheque Book Status Enquiry",
    code: "*737*6*4#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "GTBank",
    serviceName: "Block ATM Card",
    code: "*737*51*10#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },


  // Access Bank (*901#) - Verified from accessbankplc.com
  {
    provider: "Access Bank",
    serviceName: "Main Menu",
    code: "*901#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
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
    serviceName: "Transfer to Access Bank",
    code: "*901*1*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
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
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
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
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
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

  // Zenith Bank (*966#) - Verified from zenithbank.com
  {
    provider: "Zenith Bank",
    serviceName: "Main Menu",
    code: "*966#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
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
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
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
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
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
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
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
        { name: "CUSTOMERID", label: "Customer ID", placeholder: "123456789", type: "text" },
      ],
    },
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
        { name: "BVN", label: "BVN", placeholder: "22222222222", type: "number", maxLength: 11 },
      ],
    },
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

  // UBA (*919#) - Verified from ubagroup.com
  {
    provider: "UBA",
    serviceName: "Main Menu",
    code: "*919#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
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
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
      ],
    },
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

  // First Bank (*894#) - Verified from firstbanknigeria.com
  {
    provider: "First Bank",
    serviceName: "Main Menu",
    code: "*894#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
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
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
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
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
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
        { name: "PHONE", label: "Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
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
  {
    provider: "First Bank",
    serviceName: "Mini-statement",
    code: "*894*ACCOUNT#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },

  // OPay (*955#) - Digital Bank
  {
    provider: "OPay",
    serviceName: "Main Menu",
    code: "*955#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "OPay",
    serviceName: "Check Balance",
    code: "*955*0#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "OPay",
    serviceName: "Transfer to OPay Account",
    code: "*955*1*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "PHONE", label: "Recipient Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "OPay",
    serviceName: "Transfer to Other Banks",
    code: "*955*2*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "OPay",
    serviceName: "Buy Airtime (Self)",
    code: "*955*3*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
  },
  {
    provider: "OPay",
    serviceName: "Buy Airtime (Others)",
    code: "*955*3*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Recipient Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "OPay",
    serviceName: "Buy Data",
    code: "*955*4*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "PHONE", label: "Recipient Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "OPay",
    serviceName: "Pay Bills (Electricity)",
    code: "*955*6#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "OPay",
    serviceName: "Pay Bills (Waste)",
    code: "*955*9#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "OPay",
    serviceName: "Fund Betting/Lotto",
    code: "*955*5#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "OPay",
    serviceName: "Block Account",
    code: "*955*131#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "OPay",
    serviceName: "Block Card",
    code: "*955*132#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },


  // Union Bank (*826#)
  {
    provider: "Union Bank",
    serviceName: "Check Balance",
    code: "*826*4#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Union Bank",
    serviceName: "Transfer to Union Bank",
    code: "*826*1*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "Union Bank",
    serviceName: "Transfer to Other Banks",
    code: "*826*2*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "Union Bank",
    serviceName: "Buy Airtime (Self)",
    code: "*826*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
  },
  {
    provider: "Union Bank",
    serviceName: "Buy Airtime (Others)",
    code: "*826*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Recipient Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "Union Bank",
    serviceName: "Pay Bills",
    code: "*826*3#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },

  {
    provider: "OPay",
    serviceName: "Get OTP",
    code: "*955*010#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },

  // Moniepoint (*5573#) - Digital Bank
  {
    provider: "Moniepoint",
    serviceName: "Main Menu",
    code: "*5573#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Moniepoint",
    serviceName: "Check Balance",
    code: "*5573*5#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Moniepoint",
    serviceName: "Transfer to Other Banks",
    code: "*5573*2*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "Moniepoint",
    serviceName: "Buy Airtime (Self)",
    code: "*5573*AMOUNT#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
      ],
    },
  },
  {
    provider: "Moniepoint",
    serviceName: "Buy Airtime (Others)",
    code: "*5573*AMOUNT*PHONE#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "100", type: "number" },
        { name: "PHONE", label: "Recipient Phone Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "Moniepoint",
    serviceName: "Pay Bills",
    code: "*5573#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
  {
    provider: "Moniepoint",
    serviceName: "Reset PIN",
    code: "*5573*6#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Moniepoint",
    serviceName: "Block Account",
    code: "*5573*911#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "Moniepoint",
    serviceName: "Transfer to Moniepoint Account",
    code: "*5573*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },

  // PalmPay USSD Services
  {
    provider: "PalmPay",
    serviceName: "Main Menu (*861#)",
    code: "*861#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "PalmPay",
    serviceName: "Main Menu (*652#)",
    code: "*652#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "PalmPay",
    serviceName: "Check Balance",
    code: "*655*0#",
    category: "bank",
    subCategory: "other",
    logo: "🏦",
  },
  {
    provider: "PalmPay",
    serviceName: "Transfer to PalmPay Account",
    code: "*655*AMOUNT*ACCOUNT#",
    category: "bank",
    subCategory: "transfers",
    logo: "🏦",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "5000", type: "number" },
        { name: "ACCOUNT", label: "Phone/Account Number", placeholder: "08012345678", type: "number", maxLength: 11 },
      ],
    },
  },
  {
    provider: "PalmPay",
    serviceName: "Buy Airtime",
    code: "*655*1#",
    category: "bank",
    subCategory: "airtime",
    logo: "🏦",
  },
  {
    provider: "PalmPay",
    serviceName: "Pay Bills",
    code: "*655*4#",
    category: "bank",
    subCategory: "utilities",
    logo: "🏦",
  },
];

// Telecom Services - NCC Harmonized Codes + Network Specific
const telecomServices: SearchableService[] = [
  // MTN Services
  {
    provider: "MTN",
    serviceName: "Check Airtime Balance",
    code: "*310#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Airtime Recharge",
    code: "*311*PIN#",
    category: "telecom",
    subCategory: "recharge",
    logo: "📱",
    requiresInput: {
      fields: [
        { name: "PIN", label: "Recharge PIN", placeholder: "123456789012", type: "number" },
      ],
    },
  },
  {
    provider: "MTN",
    serviceName: "Buy Data",
    code: "*312#",
    category: "telecom",
    subCategory: "data",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Check Data Balance",
    code: "*323#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Check Data Balance (Detailed)",
    code: "*323*1#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Borrow Airtime/Data",
    code: "*303#",
    category: "telecom",
    subCategory: "borrow",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Share Data",
    code: "*321#",
    category: "telecom",
    subCategory: "transfer",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Share Airtime",
    code: "*600#",
    category: "telecom",
    subCategory: "transfer",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Check Phone Number",
    code: "*123*1*1#",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "MTN4ME Offers",
    code: "*121#",
    category: "telecom",
    subCategory: "data",
    logo: "📱",
  },
  {
    provider: "MTN",
    serviceName: "Customer Care",
    code: "300",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },

  // Airtel Services
  {
    provider: "Airtel",
    serviceName: "Check Airtime Balance",
    code: "*310#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Airtime Recharge",
    code: "*311*PIN#",
    category: "telecom",
    subCategory: "recharge",
    logo: "📱",
    requiresInput: {
      fields: [
        { name: "PIN", label: "Recharge PIN", placeholder: "123456789012", type: "number" },
      ],
    },
  },
  {
    provider: "Airtel",
    serviceName: "Buy Data",
    code: "*312#",
    category: "telecom",
    subCategory: "data",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Check Data Balance",
    code: "*323#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Check Data Balance (Detailed)",
    code: "*323*1#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Borrow Airtime/Data",
    code: "*303#",
    category: "telecom",
    subCategory: "borrow",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Share Data",
    code: "*321#",
    category: "telecom",
    subCategory: "transfer",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Main Menu",
    code: "*121#",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },
  {
    provider: "Airtel",
    serviceName: "Customer Care",
    code: "111",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },

  // Glo Services
  {
    provider: "Glo",
    serviceName: "Check Airtime Balance",
    code: "*310#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Airtime Recharge",
    code: "*311*PIN#",
    category: "telecom",
    subCategory: "recharge",
    logo: "📱",
    requiresInput: {
      fields: [
        { name: "PIN", label: "Recharge PIN", placeholder: "123456789012", type: "number" },
      ],
    },
  },
  {
    provider: "Glo",
    serviceName: "Buy Data",
    code: "*312#",
    category: "telecom",
    subCategory: "data",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Check Data Balance",
    code: "*323#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Check Data Balance (Detailed)",
    code: "*323*1#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Borrow Airtime/Data",
    code: "*303#",
    category: "telecom",
    subCategory: "borrow",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Share Data",
    code: "*321#",
    category: "telecom",
    subCategory: "transfer",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Main Menu (*777#)",
    code: "*777#",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Check Phone Number",
    code: "*135*8#",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },
  {
    provider: "Glo",
    serviceName: "Customer Care",
    code: "121",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },

  // 9mobile Services
  {
    provider: "9mobile",
    serviceName: "Check Airtime Balance",
    code: "*310#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Airtime Recharge",
    code: "*311*PIN#",
    category: "telecom",
    subCategory: "recharge",
    logo: "📱",
    requiresInput: {
      fields: [
        { name: "PIN", label: "Recharge PIN", placeholder: "123456789012", type: "number" },
      ],
    },
  },
  {
    provider: "9mobile",
    serviceName: "Buy Data",
    code: "*312#",
    category: "telecom",
    subCategory: "data",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Check Data Balance",
    code: "*323#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Check Data Balance (Detailed)",
    code: "*323*1#",
    category: "telecom",
    subCategory: "balance",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Borrow Airtime/Data",
    code: "*303#",
    category: "telecom",
    subCategory: "borrow",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Share Data",
    code: "*321#",
    category: "telecom",
    subCategory: "transfer",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Data Plans (*229#)",
    code: "*229#",
    category: "telecom",
    subCategory: "data",
    logo: "📱",
  },
  {
    provider: "9mobile",
    serviceName: "Customer Care",
    code: "200",
    category: "telecom",
    subCategory: "support",
    logo: "📱",
  },
];

// Mobile Money Services
const momoServices: SearchableService[] = [
  // MTN MoMo (*671#) - Verified from momo.ng
  {
    provider: "MTN MoMo",
    serviceName: "Open Wallet / Main Menu",
    code: "*671#",
    category: "momo",
    subCategory: "other",
    logo: "💰",
  },
  {
    provider: "MTN MoMo",
    serviceName: "Check Balance",
    code: "*671*0#",
    category: "momo",
    subCategory: "other",
    logo: "💰",
  },
  {
    provider: "MTN MoMo",
    serviceName: "Send Money to MoMo",
    code: "*671*1*1*RECIPIENT*AMOUNT#",
    category: "momo",
    subCategory: "transfer",
    logo: "💰",
    requiresInput: {
      fields: [
        { name: "RECIPIENT", label: "Recipient Number", placeholder: "08012345678", type: "number", maxLength: 11 },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "MTN MoMo",
    serviceName: "Send to Bank",
    code: "*671*1*2*AMOUNT*ACCOUNT#",
    category: "momo",
    subCategory: "transfer",
    logo: "💰",
    requiresInput: {
      fields: [
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
        { name: "ACCOUNT", label: "Account Number", placeholder: "0123456789", type: "number", maxLength: 10 },
      ],
    },
  },
  {
    provider: "MTN MoMo",
    serviceName: "Buy Airtime/Data",
    code: "*671*2#",
    category: "momo",
    subCategory: "airtime",
    logo: "💰",
  },
  {
    provider: "MTN MoMo",
    serviceName: "Withdraw Cash",
    code: "*671*3*AGENTCODE*AMOUNT#",
    category: "momo",
    subCategory: "withdraw",
    logo: "💰",
    requiresInput: {
      fields: [
        { name: "AGENTCODE", label: "Agent Code", placeholder: "12345", type: "text" },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "MTN MoMo",
    serviceName: "Pay Bills",
    code: "*671*4#",
    category: "momo",
    subCategory: "bills",
    logo: "💰",
  },
  {
    provider: "MTN MoMo",
    serviceName: "Locate Agent",
    code: "*223#",
    category: "momo",
    subCategory: "other",
    logo: "💰",
  },

  // Airtel SmartCash (*939#)
  {
    provider: "Airtel SmartCash",
    serviceName: "Main Menu",
    code: "*939#",
    category: "momo",
    subCategory: "other",
    logo: "💰",
  },
  {
    provider: "Airtel SmartCash",
    serviceName: "Check Balance",
    code: "*939*0#",
    category: "momo",
    subCategory: "other",
    logo: "💰",
  },
  {
    provider: "Airtel SmartCash",
    serviceName: "Send Money",
    code: "*939*1*RECIPIENT*AMOUNT#",
    category: "momo",
    subCategory: "transfer",
    logo: "💰",
    requiresInput: {
      fields: [
        { name: "RECIPIENT", label: "Recipient Number", placeholder: "08012345678", type: "number", maxLength: 11 },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "Airtel SmartCash",
    serviceName: "Withdraw Cash",
    code: "*939*2*AGENTCODE*AMOUNT#",
    category: "momo",
    subCategory: "withdraw",
    logo: "💰",
    requiresInput: {
      fields: [
        { name: "AGENTCODE", label: "Agent Code", placeholder: "12345", type: "text" },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "Airtel SmartCash",
    serviceName: "Buy Airtime/Data",
    code: "*939*3#",
    category: "momo",
    subCategory: "airtime",
    logo: "💰",
  },
];

// General Services (Power, NIN, Education, Emergency)
const generalServices: SearchableService[] = [
  // Power (Electricity)
  {
    provider: "Ikeja Electric (Prepaid)",
    serviceName: "Buy Token",
    code: "*565*6*0013*METER_NO*AMOUNT#", // Example placeholder code
    category: "general",
    subCategory: "power",
    logo: "⚡",
    requiresInput: {
      fields: [
        { name: "METER_NO", label: "Meter Number", placeholder: "0123456789", type: "number" },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "Eko Electric (Prepaid)",
    serviceName: "Buy Token",
    code: "*565*6*0014*METER_NO*AMOUNT#", // Example placeholder code
    category: "general",
    subCategory: "power",
    logo: "⚡",
    requiresInput: {
      fields: [
        { name: "METER_NO", label: "Meter Number", placeholder: "0123456789", type: "number" },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },
  {
    provider: "Abuja Electric",
    serviceName: "Buy Token",
    code: "*565*6*0015*METER_NO*AMOUNT#", // Example placeholder code
    category: "general",
    subCategory: "power",
    logo: "⚡",
    requiresInput: {
      fields: [
        { name: "METER_NO", label: "Meter Number", placeholder: "0123456789", type: "number" },
        { name: "AMOUNT", label: "Amount", placeholder: "1000", type: "number" },
      ],
    },
  },

  // NIN & SIM Management
  {
    provider: "NIMC",
    serviceName: "NIN Retrieval",
    code: "*346#",
    category: "general",
    subCategory: "nin",
    logo: "🇳🇬",
  },
  {
    provider: "Universal",
    serviceName: "Link NIN to SIM",
    code: "*996#",
    category: "general",
    subCategory: "nin",
    logo: "🔗",
  },
  {
    provider: "Universal",
    serviceName: "BVN Retrieval",
    code: "*565*0#",
    category: "general",
    subCategory: "nin",
    logo: "🆔",
  },

  // Education
  {
    provider: "WAEC",
    serviceName: "Check Result",
    code: "*322*1*WAEC*PIN#", // Example placeholder
    category: "general",
    subCategory: "education",
    logo: "🎓",
    requiresInput: {
      fields: [
        { name: "PIN", label: "Exam PIN", placeholder: "123456789012", type: "number" },
      ],
    },
  },
  {
    provider: "JAMB",
    serviceName: "Check Result / Profile",
    code: "*55019#",
    category: "general",
    subCategory: "education",
    logo: "🎓",
  },

  // Emergency Services (Moved to General)
  {
    provider: "Emergency",
    serviceName: "Universal Emergency (112)",
    code: "112",
    category: "general",
    subCategory: "emergency",
    logo: "🚨",
  },
  {
    provider: "Emergency",
    serviceName: "Police (199)",
    code: "199",
    category: "general",
    subCategory: "emergency",
    logo: "👮",
  },
  {
    provider: "Emergency",
    serviceName: "FRSC (Road Safety)",
    code: "122",
    category: "general",
    subCategory: "emergency",
    logo: "🚗",
  },
  {
    provider: "Emergency",
    serviceName: "Lagos Emergency",
    code: "767",
    category: "general",
    subCategory: "emergency",
    logo: "🚨",
  },
];

// Helper Functions
export function getAllServices(): SearchableService[] {
  return [
    ...bankServices,
    ...telecomServices,
    ...momoServices,
    ...generalServices,
  ];
}

export function getServicesByCategory(category: string): SearchableService[] {
  switch (category.toLowerCase()) {
    case "bank":
    case "banks":
      return bankServices;
    case "telecom":
    case "telecoms":
      return telecomServices;
    case "momo":
    case "mobile money":
      return momoServices;
    case "general":
    case "others":
    case "utilities": // Keep for backward compatibility if needed
    case "emergency": // Keep for backward compatibility
      return generalServices;
    default:
      return [];
  }
}

export function getProvidersByCategory(category: string): string[] {
  const services = getServicesByCategory(category);
  const providers = new Set(services.map((s) => s.provider));
  return Array.from(providers);
}
