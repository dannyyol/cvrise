import { useState } from 'react';
import { Button } from '../ui/Button';
import { Globe, Languages, Save } from 'lucide-react';

export function GeneralSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2>General Preferences</h2>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interface Language
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文 (Chinese)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <Languages className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Choose the language for the application interface. Resume content language is set independently.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button 
                onClick={handleSave} 
                isLoading={isSaving}
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
            >
                Save Preferences
            </Button>
        </div>
      </div>
    </div>
  );
}
