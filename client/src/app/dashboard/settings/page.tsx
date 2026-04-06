"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Settings, Cpu, CreditCard } from 'lucide-react';
import { AISettings } from '@/src/components/Settings/AISettings';
import { GeneralSettings } from '@/src/components/Settings/GeneralSettings';
import { PaymentSettings } from '@/src/components/Settings/PaymentSettings';
import { PageTitle } from '@/src/components/ui/PageTitle';
import { ROUTES } from '@/src/lib/routes';

type Tab = 'general' | 'ai' | 'billing';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams?.get('tab') as Tab | null) ?? null;
  
  const activeTab: Tab = (['general', 'ai', 'billing'].includes(tab || '') ? tab as Tab : 'ai');

  const setActiveTab = (newTab: Tab) => {
    router.push(`${ROUTES.SETTINGS}?tab=${newTab}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 p-4 md:p-6 font-sans scrollbar-thin scrollbar-thumb-slate-200">
      <div className="mx-auto w-full max-w-7xl space-y-8 2xl:max-w-6xl">
        <div>
          <PageTitle
            title="Settings"
            icon={<Settings className="w-7 h-7" />}
            description="Manage your application preferences and AI configuration."
            titleClassName="text-3xl text-slate-900"
          />
        </div>

        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm w-max min-w-full sm:min-w-0 sm:w-fit">
                
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'ai'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                    <Cpu className="w-4 h-4 shrink-0" />
                    AI Configuration
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeTab === 'billing'
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    Billing & Plans
                </button>
            </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'ai' && <AISettings onNavigateToBilling={() => setActiveTab('billing')} />}
            {activeTab === 'billing' && <PaymentSettings />}
        </div>
      </div>
    </div>
  );
}
