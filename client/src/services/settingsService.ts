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

function getSettings(key: typeof SETTINGS_KEY_AI): Promise<AIConfig | null>;
function getSettings<T = unknown>(key: string): Promise<T | null>;
async function getSettings(key: string): Promise<unknown> {
  try {
    const response = await api.get<{ key: string; value: unknown }>(`/settings/${key}`);
    return response.value as unknown;
  } catch {
    return null;
  }
}

export const settingsService = {
  getSettings,
  saveSettings: async <T>(key: string, value: T): Promise<{ key: string; value: T }> => {
    return api.post<{ key: string; value: T }, { key: string; value: T }>('/settings', { key, value });
  },

  saveAISettings: async (config: AIConfig): Promise<void> => {
    await api.post<AIConfig, unknown>('/settings/ai', config);
  },
};
