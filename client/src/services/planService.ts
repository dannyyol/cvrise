import { api } from '../lib/apiClient';

export interface TokenPlan {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  is_popular: boolean;
  features: string | null;
  created_at: string;
}

export interface UserBalance {
  id: string;
  balance: number;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  plan_id: string | null;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface PaymentInitiationResponse {
  checkout_url: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const planService = {
  getPlans: async (): Promise<TokenPlan[]> => {
    return api.get<TokenPlan[]>('/settings/plans/');
  },
  
  getBalance: async (): Promise<UserBalance> => {
    return api.get<UserBalance>('/settings/plans/balance');
  },

  getTransactions: async (page = 1): Promise<PaginatedResponse<TokenTransaction>> => {
    return api.get<PaginatedResponse<TokenTransaction>>(`/settings/plans/transactions?page=${page}`);
  },

  purchasePlan: async (planId: string): Promise<PaymentInitiationResponse> => {
    return api.put<{ plan_id: string }, PaymentInitiationResponse>('/settings/plans/select-plan', { plan_id: planId });
  }
};
