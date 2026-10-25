// Accounts shown when a guest taps "Send gift".
export type GiftAccount = {
  bank: string; // short bank name, shown in the badge
  holder: string;
  number: string;
  logo?: string; // optional logo file; the bank name is shown as text when there is none
};

export const giftAccounts: GiftAccount[] = [
  { bank: "BCA", holder: "Kevin Jordi", number: "7890666641", logo: "/assets/img/bank-bca-wide.webp" },
  { bank: "BCA", holder: "Meliawati Paembonan", number: "8735563919", logo: "/assets/img/bank-bca-wide.webp" },
];

// WhatsApp number for guests who want to arrange a gift another way, in international format without "+" or a leading 0
// (the number 0878-5545-7376 becomes 62878-5545-7376).
export const giftContact = { whatsapp: "6287855457376" };
