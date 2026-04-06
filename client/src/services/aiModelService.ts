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

export const aiModelService = {
  getAll: async (): Promise<AIModel[]> => {
    return api.get<AIModel[]>('/ai-models');
  },
  
  testConnection: async (data: TestConnectionRequest): Promise<{ status: string; message: string }> => {
    return api.post('/ai-models/test-connection', data);
  },
};
