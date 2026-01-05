// Shared formatting utilities

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString()}`;
}

export function formatHours(hours: number): string {
  return `${hours} hr${hours !== 1 ? 's' : ''}`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
