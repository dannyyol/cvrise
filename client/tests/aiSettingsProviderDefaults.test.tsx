import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

import { AISettings } from '../src/components/Settings/AISettings';

const mockGetAll = vi.fn();
const mockGetProviderDefaults = vi.fn();
const mockGetSettings = vi.fn();
const mockGetPaygStatus = vi.fn();

vi.mock('../src/services/aiModelService', () => {
  return {
    aiModelService: {
      getAll: (...args: unknown[]) => mockGetAll(...args),
      getProviderDefaults: (...args: unknown[]) => mockGetProviderDefaults(...args),
      testConnection: vi.fn(),
    },
  };
});

vi.mock('../src/services/settingsService', () => {
  return {
    SETTINGS_KEY_AI: 'ai_config',
    settingsService: {
      getSettings: (...args: unknown[]) => mockGetSettings(...args),
      getPaygStatus: (...args: unknown[]) => mockGetPaygStatus(...args),
      togglePayg: vi.fn(),
      saveAISettings: vi.fn(),
      saveSettings: vi.fn(),
    },
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function getInputByLabel(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText);
  const wrapper = label.closest('div');
  if (!wrapper) throw new Error(`No wrapper found for label: ${labelText}`);
  const input = wrapper.querySelector('input');
  if (!input) throw new Error(`No input found for label: ${labelText}`);
  return input as HTMLInputElement;
}

function seedDefaultModelList() {
  mockGetAll.mockResolvedValue([
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: '',
      provider: 'OpenAI',
      key_id: 'openai',
    },
  ]);
}

describe('AISettings provider defaults', () => {
  it('uses backend provider defaults when available', async () => {
    seedDefaultModelList();
    mockGetSettings.mockResolvedValue(null);
    mockGetPaygStatus.mockResolvedValue(false);
    mockGetProviderDefaults.mockResolvedValue({
      baseUrls: { openai: 'https://openrouter.ai/api/v1' },
      modelIds: { openai: 'gpt-4o-mini' },
    });

    render(<AISettings />);

    await screen.findByText('Model ID');

    await waitFor(() => {
      expect(getInputByLabel('Base URL')).toHaveValue('https://openrouter.ai/api/v1');
      expect(getInputByLabel('Model ID')).toHaveValue('gpt-4o-mini');
    });
  });

  it('falls back to built-in defaults when backend defaults cannot be loaded', async () => {
    seedDefaultModelList();
    mockGetSettings.mockResolvedValue(null);
    mockGetPaygStatus.mockResolvedValue(false);
    mockGetProviderDefaults.mockRejectedValue(new Error('network'));

    render(<AISettings />);

    await screen.findByText('Model ID');

    await waitFor(() => {
      expect(getInputByLabel('Base URL')).toHaveValue('');
      expect(getInputByLabel('Model ID')).toHaveValue('');
    });
  });
});
