import { api } from '@/src/lib/apiClient';

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  modelId: string;
}

export interface AIConfig {
  activeModelId: string;
  usageMode?: 'platform' | 'custom';
  configs: Record<string, ProviderConfig>;
}

export const SETTINGS_KEY_AI = 'ai_config';

export const settingsService = {
  getSettings: async (key: string): Promise<any> => {
    try {
      const response = await api.get<{ key: string; value: any }>(`/settings/${key}`);
      return response.value;
    } catch (error) {
      // If setting doesn't exist (404), return null
      return null;
    }
  },

  saveSettings: async (key: string, value: any): Promise<any> => {
    return api.post('/settings', { key, value });
  },

  saveAISettings: async (config: AIConfig): Promise<any> => {
    return api.post('/settings/ai', config);
  },
};
