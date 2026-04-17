import { useState, useEffect } from 'react';
import { Check, Cpu, Save, Key, Server, Globe, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form';
import { Switch } from '../ui/Switch';
import { ErrorState } from '../ui/ErrorState';
import { settingsService, SETTINGS_KEY_AI } from '../../services/settingsService';
import type { ProviderConfig } from '../../services/settingsService';
import { aiModelService, type AIModel } from '../../services/aiModelService';
import { Toast, type ToastType } from '../ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

interface AISettingsProps {
  onNavigateToBilling?: () => void;
}

export function AISettings({ onNavigateToBilling }: AISettingsProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-1.5-pro');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });
  const [usePayAsYouGo, setUsePayAsYouGo] = useState(false);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);

  const selectedModel = models.find(m => m.id === selectedModelId);

  const getErrorDetail = (error: unknown): unknown => {
    return (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  };

  const isStringRecord = (value: unknown): value is Record<string, string> => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return Object.values(value as Record<string, unknown>).every((v) => typeof v === 'string');
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      // Load AI models
      const fetchedModels = await aiModelService.getAll();
      setModels(fetchedModels);

      // Load settings
      const settings = await settingsService.getSettings(SETTINGS_KEY_AI);
      if (settings) {
        if (settings.activeModelId) setSelectedModelId(settings.activeModelId);
        if (settings.configs) setConfigs(prev => ({ ...prev, ...settings.configs }));
        if (settings.usageMode) setUsePayAsYouGo(settings.usageMode === 'platform');
      }
      setIsLoading(false);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load AI settings');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loadError) {
    return (
      <ErrorState 
        title="Unable to load AI settings" 
        message={loadError} 
        onRetry={loadData}
      />
    );
  }

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleTestConnection = async () => {
    if (!selectedModel) return;
    
    const config = configs[selectedModel.key_id] || {};
    
    setConnectionStatus('testing');
    setErrors({});
    try {
      await aiModelService.testConnection({
        provider: selectedModel.key_id,
        base_url: config.baseUrl || '',
        api_key: config.apiKey || '',
        model_id: config.modelId || ''
      });
      setConnectionStatus('success');
      setTimeout(() => setConnectionStatus('idle'), 3000);
    } catch (error: unknown) {
      setConnectionStatus('error');
      const detail = getErrorDetail(error);
      const errorMessage = (typeof detail === 'string' ? detail : undefined) || (error instanceof Error ? error.message : 'Connection failed');
      setToast({ message: errorMessage, type: 'error', isVisible: true });
    }
  };

  const handleSave = async () => {
    if (!usePayAsYouGo && !selectedModel) {
      setToast({ message: 'No model selected', type: 'error', isVisible: true });
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      await settingsService.saveAISettings({
        activeModelId: selectedModelId,
        usageMode: usePayAsYouGo ? 'platform' : 'custom',
        configs
      });
      setToast({ message: 'Settings saved successfully', type: 'success', isVisible: true });
    } catch (error: unknown) {
      const detail = getErrorDetail(error);

      if (isStringRecord(detail)) {
        setErrors(detail);
      } else {
        const errorMessage = typeof detail === 'string' ? detail : 'Failed to save settings';
        setToast({ message: errorMessage, type: 'error', isVisible: true });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUsageModeChange = async (enabled: boolean) => {
    setUsePayAsYouGo(enabled);
    setIsUpdatingMode(true);
    
    try {
      // Optimistically update UI, but rollback on failure
      await settingsService.saveAISettings({
        activeModelId: selectedModelId,
        usageMode: enabled ? 'platform' : 'custom',
        configs
      });
      
      setToast({ 
        message: `Switched to ${enabled ? 'Pay As You Go' : 'Bring Your Own Key'} mode`, 
        type: 'success', 
        isVisible: true 
      });
    } catch {
      setUsePayAsYouGo(!enabled); // Rollback
      setToast({ 
        message: 'Failed to update usage mode. Please try again.', 
        type: 'error', 
        isVisible: true 
      });
    } finally {
      setIsUpdatingMode(false);
    }
  };

  const handleConfigChange = (provider: string, field: keyof ProviderConfig, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || { apiKey: '', baseUrl: '', modelId: '' }),
        [field]: value
      }
    }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Toast 
            message={toast.message} 
            type={toast.type} 
            isVisible={toast.isVisible} 
            onClose={handleCloseToast} 
        />
        <div className="lg:col-span-2 space-y-6">
        
        {/* Usage Mode Selection */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                Pay As You Go
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-primary-500 text-xs font-medium border border-blue-200 w-fit">
                  Recommended
                </span>
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-lg">
                Enable to use platform tokens. Disable to use your own API keys.
              </p>
              {usePayAsYouGo && onNavigateToBilling && (
                <button 
                  onClick={onNavigateToBilling}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                >
                  Manage Billing & Plans <span aria-hidden="true">&rarr;</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
               <span className={`text-sm font-medium ${usePayAsYouGo ? 'text-primary-600' : 'text-gray-500'}`}>
                  {usePayAsYouGo ? 'Enabled' : 'Disabled'}
               </span>
               <Switch 
                  checked={usePayAsYouGo}
                  onChange={handleUsageModeChange}
                  disabled={isUpdatingMode}
                />
            </div>
          </div>
        </div>

        {/* AI Model Selection - Compact */}
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${usePayAsYouGo ? 'opacity-50 pointer-events-none select-none grayscale-[0.5]' : ''}`}>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Cpu className="w-5 h-5 text-priamry-600" />
                <h2>Active AI Model</h2>
            </div>
            </div>
            
            <div className="p-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[54px] rounded-lg border border-gray-200 bg-gray-100" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left hover:border-blue-200 hover:bg-blue-50/30 ${
                        selectedModelId === model.id
                          ? 'border-primary-600 bg-primary-50/30 ring-1 ring-primary-600'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${selectedModelId === model.id ? 'bg-primary-600' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{model.name}</div>
                        <div className="text-xs text-gray-500 truncate">{model.provider}</div>
                      </div>
                      {selectedModelId === model.id && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  {selectedModel?.description}
                </p>
              </>
            )}
            </div>
        </div>
        </div>

        {/* Sidebar / API Keys Column */}
        <div className={`lg:col-span-1 lg:row-span-2 space-y-6 transition-all duration-300 ${usePayAsYouGo ? 'opacity-50 pointer-events-none select-none grayscale-[0.5]' : ''}`}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Key className="w-5 h-5 text-amber-500" />
                <h2>Model Settings</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Configure credentials for {selectedModel?.name}.
            </p>
            </div>
            
            <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 rounded-lg bg-gray-100 border border-gray-200" />
                <div className="h-16 rounded-lg bg-gray-100 border border-gray-200" />
                <div className="h-16 rounded-lg bg-gray-100 border border-gray-200" />
              </div>
            ) : (
              selectedModel && (
                <>
                  <Input
                    label="Model ID"
                    placeholder="e.g. gpt-4o"
                    value={configs[selectedModel.key_id]?.modelId || ''}
                    onChange={(e) => handleConfigChange(selectedModel.key_id, 'modelId', e.target.value)}
                    icon={<Cpu className="w-4 h-4 text-gray-400" />}
                    error={errors.modelId}
                  />
                  
                  <Input
                    label="Base URL"
                    placeholder="e.g. https://api.openai.com/v1"
                    value={configs[selectedModel.key_id]?.baseUrl || ''}
                    onChange={(e) => handleConfigChange(selectedModel.key_id, 'baseUrl', e.target.value)}
                    icon={<Server className="w-4 h-4 text-gray-400" />}
                    error={errors.baseUrl}
                  />

                  {selectedModel.key_id !== 'ollama' && (
                    <Input
                      label={`${selectedModel.provider} API Key`}
                      type="password"
                      placeholder="sk-..."
                      value={configs[selectedModel.key_id]?.apiKey || ''}
                      onChange={(e) => handleConfigChange(selectedModel.key_id, 'apiKey', e.target.value)}
                      icon={<Key className="w-4 h-4 text-gray-400" />}
                      error={errors.apiKey}
                    />
                  )}
                </>
              )
            )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-36 bg-gray-100 rounded-full" />
                      <div className="h-3 w-28 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                  <div className="h-9 w-28 bg-gray-100 rounded-lg border border-gray-200" />
                </div>
                <div className="flex justify-end">
                  <div className="h-9 w-44 bg-gray-100 rounded-lg border border-gray-200" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10">
                      <AnimatePresence mode="wait">
                        {connectionStatus === 'idle' && (
                          <motion.div
                            key="idle"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                          >
                            <Globe className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        )}
                        {connectionStatus === 'testing' && (
                          <motion.div
                            key="testing"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative"
                          >
                            <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                          </motion.div>
                        )}
                        {connectionStatus === 'success' && (
                          <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                          >
                            <ShieldCheck className="w-6 h-6 text-green-500" />
                          </motion.div>
                        )}
                        {connectionStatus === 'error' && (
                          <motion.div
                            key="error"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                          >
                            <AlertCircle className="w-6 h-6 text-red-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {connectionStatus === 'idle' && 'Connection Status'}
                        {connectionStatus === 'testing' && 'Verifying credentials...'}
                        {connectionStatus === 'success' && 'Systems Operational'}
                        {connectionStatus === 'error' && 'Connection Failed'}
                      </div>
                      <div className={`text-xs ${
                        connectionStatus === 'success' ? 'text-green-600' : 
                        connectionStatus === 'error' ? 'text-red-500' : 
                        'text-gray-500'
                      }`}>
                        {connectionStatus === 'idle' && 'Not tested yet'}
                        {connectionStatus === 'testing' && 'Checking API access...'}
                        {connectionStatus === 'success' && 'Credentials verified'}
                        {connectionStatus === 'error' && 'Check your API Key & URL'}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'testing' || isSaving}
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    isLoading={isSaving}
                    disabled={connectionStatus === 'testing'}
                    size="sm"
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Configuration
                  </Button>
                </div>
              </>
            )}
            </div>
        </div>
        </div>
    </div>
  );
}
