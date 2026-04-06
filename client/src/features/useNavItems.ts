import { LayoutDashboard, FileText, Layout, Award, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCVStore } from '@/src/store/useCVStore';
import { ROUTES } from '@/src/lib/routes';

export type NavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

export const useNavItems = (): NavItem[] => {
  const currentResumeId = useCVStore((s) => s.currentResumeId);
  return [
    { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: ROUTES.RESUMES, icon: FileText, label: 'My Resumes' },
    {
      to: ROUTES.EDITOR,
      icon: Layout,
      label: 'Editor',
    },
    { to: ROUTES.TEMPLATES, icon: Award, label: 'Customise Design' },
    { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
  ];
};
