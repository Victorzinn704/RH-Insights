import { Currency, Role } from "../types";
import toast from "react-hot-toast";

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ROLE_HIERARCHY: Record<Role, number> = {
  'Gerente': 0,
  'Senior': 1,
  'Pleno': 2,
  'Junior': 3,
  'Estagiário': 4
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function convertAmount(amount: number, from: Currency, to: Currency, rates: { USD: number; EUR: number; BRL: number }) {
  const amountInBRL = amount * rates[from];
  return amountInBRL / rates[to];
}

export function formatCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : currency === 'USD' ? 'en-US' : 'de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Firestore Error [${operationType}] at ${path}:`, message);
  toast.error(`Erro na operação (${operationType}): ${message}`);
}
