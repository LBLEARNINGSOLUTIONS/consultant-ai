import { describe, it, expect } from 'vitest';
import { formatCurrency, formatHours, formatPercent } from '../formatters';

describe('formatCurrency', () => {
  it('formats USD amounts correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1000, 'USD')).toBe('$1,000');
  });

  it('formats other currencies correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000');
    expect(formatCurrency(1000, 'GBP')).toBe('£1,000');
    expect(formatCurrency(1000, 'CAD')).toBe('C$1,000');
    expect(formatCurrency(1000, 'AUD')).toBe('A$1,000');
  });

  it('defaults to $ for unknown currencies', () => {
    expect(formatCurrency(1000, 'XYZ')).toBe('$1,000');
  });

  it('handles decimal amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles large numbers with locale formatting', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000');
  });
});

describe('formatHours', () => {
  it('formats singular hour', () => {
    expect(formatHours(1)).toBe('1 hr');
  });

  it('formats plural hours', () => {
    expect(formatHours(2)).toBe('2 hrs');
    expect(formatHours(10)).toBe('10 hrs');
  });

  it('handles zero hours', () => {
    expect(formatHours(0)).toBe('0 hrs');
  });

  it('handles decimal hours', () => {
    expect(formatHours(1.5)).toBe('1.5 hrs');
  });
});

describe('formatPercent', () => {
  it('formats percentages correctly', () => {
    expect(formatPercent(50)).toBe('50%');
    expect(formatPercent(100)).toBe('100%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('handles decimal percentages', () => {
    expect(formatPercent(33.33)).toBe('33.33%');
  });
});
