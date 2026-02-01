export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
    Thailand: { code: 'THB', symbol: '฿', name: '바트' },
    Vietnam: { code: 'VND', symbol: '₫', name: '동' },
} as const;

export function getCurrency(country: string): CurrencyInfo {
    return CURRENCIES[country] || CURRENCIES.Thailand;
}

export function formatPrice(amount: number, country: string): string {
    const currency = getCurrency(country);
    return `${amount.toLocaleString()} ${currency.code}`;
}
