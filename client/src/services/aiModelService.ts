import { api } from '../lib/apiClient';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  key_id: string;
}

export interface TestConnectionRequest {
  provider: string;
  base_url: string;
  api_key?: string;
  model_id?: string;
}

export interface ProviderDefaultsResponse {
  baseUrls: Record<string, string>;
  modelIds: Record<string, string>;
}

export const aiModelService = {
  getAll: async (): Promise<AIModel[]> => {
    return api.get<AIModel[]>('/ai-models');
  },

  getProviderDefaults: async (): Promise<ProviderDefaultsResponse> => {
    return api.get<ProviderDefaultsResponse>('/ai-models/provider-defaults');
  },
  
  testConnection: async (data: TestConnectionRequest): Promise<{ status: string; message: string }> => {
    return api.post('/ai-models/test-connection', data);
  },
};
