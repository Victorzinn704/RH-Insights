import { describe, it, expect } from 'vitest';
import { convertAmount, formatCurrency, ROLE_HIERARCHY, COLORS, OperationType } from '../currency';

describe('convertAmount', () => {
  const rates = { USD: 5.0, EUR: 5.4, BRL: 1.0 };

  it('returns same amount when converting BRL to BRL', () => {
    expect(convertAmount(100, 'BRL', 'BRL', rates)).toBe(100);
  });

  it('converts USD to BRL correctly', () => {
    expect(convertAmount(10, 'USD', 'BRL', rates)).toBe(50);
  });

  it('converts BRL to USD correctly', () => {
    expect(convertAmount(50, 'BRL', 'USD', rates)).toBe(10);
  });

  it('converts EUR to USD correctly', () => {
    // 10 EUR = 54 BRL, 54 BRL / 5.0 = 10.8 USD
    expect(convertAmount(10, 'EUR', 'USD', rates)).toBeCloseTo(10.8, 5);
  });

  it('handles zero amount', () => {
    expect(convertAmount(0, 'USD', 'BRL', rates)).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('formats BRL with pt-BR locale', () => {
    const result = formatCurrency(1234.56, 'BRL');
    expect(result).toContain('R$');
  });

  it('formats USD with en-US locale', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toContain('$');
  });

  it('formats EUR with de-DE locale', () => {
    const result = formatCurrency(1234.56, 'EUR');
    expect(result).toContain('€');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'BRL')).toContain('R$');
  });
});

describe('ROLE_HIERARCHY', () => {
  it('has Gerente as highest priority (0)', () => {
    expect(ROLE_HIERARCHY['Gerente']).toBe(0);
  });

  it('has Estagiário as lowest priority (4)', () => {
    expect(ROLE_HIERARCHY['Estagiário']).toBe(4);
  });

  it('has all 5 roles defined', () => {
    expect(Object.keys(ROLE_HIERARCHY).length).toBe(5);
  });
});

describe('COLORS', () => {
  it('has at least 6 colors', () => {
    expect(COLORS.length).toBeGreaterThanOrEqual(6);
  });

  it('all colors are valid hex strings', () => {
    COLORS.forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('OperationType', () => {
  it('has all expected operations', () => {
    expect(OperationType.CREATE).toBe('create');
    expect(OperationType.UPDATE).toBe('update');
    expect(OperationType.DELETE).toBe('delete');
    expect(OperationType.LIST).toBe('list');
    expect(OperationType.GET).toBe('get');
    expect(OperationType.WRITE).toBe('write');
  });
});
