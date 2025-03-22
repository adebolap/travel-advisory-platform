import { z } from "zod";

export const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 149.50 },
  AUD: { symbol: "A$", rate: 1.53 },
  SGD: { symbol: "S$", rate: 1.34 },
  CAD: { symbol: "C$", rate: 1.35 },
  CNY: { symbol: "¥", rate: 7.19 },
  INR: { symbol: "₹", rate: 82.85 },
  AED: { symbol: "د.إ", rate: 3.67 }
} as const;

export type CurrencyCode = keyof typeof currencies;

export const currencySchema = z.object({
  code: z.enum(Object.keys(currencies) as [CurrencyCode, ...CurrencyCode[]]),
  amount: z.number()
});

export type Currency = z.infer<typeof currencySchema>;

export function formatCurrency(amount: number, code: CurrencyCode = "USD") {
  const currency = currencies[code];
  const converted = Math.round(amount * currency.rate);
  return `${currency.symbol}${converted}`;
}

export function getLocalCurrency(countryCode: string): CurrencyCode {
  // Map of country codes to currency codes
  const countryToCurrency: Record<string, CurrencyCode> = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    JP: "JPY",
    AU: "AUD",
    SG: "SGD",
    CA: "CAD",
    CN: "CNY",
    IN: "INR",
    AE: "AED",
  };
  
  return countryToCurrency[countryCode] || "USD";
}
