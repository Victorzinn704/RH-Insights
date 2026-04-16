import { Timestamp } from "firebase/firestore";

export type Role = 'Gerente' | 'Senior' | 'Pleno' | 'Junior' | 'Estagiário';
export type Status = 'Disponível' | 'Tratamento de Saúde' | 'Férias' | 'Viagem a Trabalho' | 'Na Empresa' | 'Home Office' | 'Fora de Expediente' | 'Atestado';
export type ExpenseType = 'API' | 'Cloud' | 'Licença' | 'Água' | 'Luz' | 'Internet' | 'Outros';
export type Currency = 'USD' | 'EUR' | 'BRL';
export type PlanType = 'free' | 'pro';

export interface Employee {
  id?: string;
  name: string;
  role: Role;
  position: string;
  section: string;
  salary: number;
  status: Status;
  performance: number;
  complaints: number;
  medicalCertificatesCount: number;
  area: string;
  uid: string;
}

export interface Expense {
  id?: string;
  type: ExpenseType;
  amount: number;
  currency: Currency;
  date: Timestamp;
  description: string;
  uid: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  quantity: number;
  category: string;
  unitPrice: number;
  uid: string;
}

export interface RevenueRecord {
  id?: string;
  type: 'in' | 'out';
  amount: number;
  category: string;
  date: Timestamp;
  description: string;
  uid: string;
}

export interface Subscription {
  plan: PlanType;
  status: 'active' | 'canceled';
  currentPeriodEnd: Timestamp | null;
  uid: string;
}

export interface CompanyPortfolio {
  id?: string;
  companyName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  mission: string;
  vision: string;
  values: string[];
  milestones: { year: string; title: string; description: string }[];
  uid: string;
}
