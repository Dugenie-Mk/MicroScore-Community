export interface KpiCard {
  label: string;
  value: string;
  hint: string;
  trend: number;
  icon: 'users' | 'cash' | 'document' | 'check';
  accent: 'brand' | 'sky' | 'amber' | 'violet';
}

export type LoanStatus = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'EN_COURS';

export interface LoanRequest {
  id: string;
  clientName: string;
  amount: number;
  score: number;
  status: LoanStatus;
  date: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'loan' | 'repayment' | 'account' | 'score';
}

export interface NotificationItem {
  id: string;
  message: string;
  time: string;
  level: 'info' | 'success' | 'warning';
}

export interface CreditScore {
  value: number;
  category: string;
  updatedAt: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface TrendSeries {
  name: string;
  color: 'brand' | 'sky';
  values: number[];
}

export interface MonthlyTarget {
  percent: number;
  target: string;
  achieved: string;
  comment: string;
}

export interface RiskBand {
  label: string;
  count: number;
  percent: number;
  tone: 'brand' | 'amber' | 'red';
}
