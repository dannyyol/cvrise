"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '@/src/context/AuthContext';
import { DashboardNavItem } from '@/src/components/Dashboard/DashboardNavItem';
import { useNavItems } from '@/src/features/useNavItems';
import { ROUTES } from '@/src/lib/routes';

const useMediaQuery = (query: string) => {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mediaQueryList = window.matchMedia(query);
      const handler = () => onStoreChange();
      mediaQueryList.addEventListener('change', handler);
      return () => mediaQueryList.removeEventListener('change', handler);
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false
  );
};

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'sidebarCollapsed';
const SIDEBAR_COLLAPSED_EVENT = 'sidebar:collapsed';

const useSidebarCollapsed = () => {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const handler = () => onStoreChange();
      window.addEventListener('storage', handler);
      window.addEventListener(SIDEBAR_COLLAPSED_EVENT, handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, handler);
      };
    },
    () => {
      if (typeof window === 'undefined') return true;
      try {
        const saved = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
        return saved ? (JSON.parse(saved) as boolean) : false;
      } catch {
        return false;
      }
    },
    () => true
  );
};

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isCollapsed = useSidebarCollapsed();
  const navItems = useNavItems();

  const closeSidebar = () => setIsSidebarOpen(false);
  const isSidebarCollapsed = isDesktop && isCollapsed;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, JSON.stringify(newState));
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="h-screen bg-slate-50/50 flex flex-col overflow-hidden font-sans">
      <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-30 sticky top-0">
        <Link href="/" className="flex items-center gap-0 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 -mr-0.5">
            <Image src="/images/blue-logo.png" alt="cvrise" width={32} height={32} className="w-8 h-8" priority />
          </div>
          <span className="text-[1.2rem] font-extrabold tracking-[-0.03em] text-[#111111] leading-none truncate">
            CV<span className="text-[#0672AD]">Rise</span>
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={clsx(
            'inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/10 bg-white/70 transition hover:bg-white',
            'flex-col gap-[5px]'
          )}
          aria-label="Toggle menu"
          aria-expanded={isSidebarOpen}
        >
          <span
            className={clsx(
              'h-[1.8px] w-4 rounded-full bg-[#111111] transition-all duration-200',
              isSidebarOpen && 'translate-y-[7px] rotate-45'
            )}
          />
          <span className={clsx('h-[1.8px] w-4 rounded-full bg-[#111111] transition-all duration-200', isSidebarOpen && 'opacity-0')} />
          <span
            className={clsx(
              'h-[1.8px] w-4 rounded-full bg-[#111111] transition-all duration-200',
              isSidebarOpen && '-translate-y-[7px] -rotate-45'
            )}
          />
        </button>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden relative">
        <aside
          className={clsx(
            'bg-white border-r border-slate-200/60 flex flex-col fixed inset-y-0 left-0 z-50 w-72 transition-all duration-300 ease-in-out lg:relative shadow-xl lg:shadow-none',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:translate-x-0',
            isCollapsed ? 'lg:w-20' : 'lg:w-72'
          )}
        >
          <button
            onClick={closeSidebar}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/10 bg-white/70 transition hover:bg-white lg:hidden flex-col gap-[5px]"
            aria-label="Close menu"
          >
            <span className="h-[1.8px] w-4 rounded-full bg-[#111111] translate-y-[7px] rotate-45" />
            <span className="h-[1.8px] w-4 rounded-full bg-[#111111] opacity-0" />
            <span className="h-[1.8px] w-4 rounded-full bg-[#111111] -translate-y-[7px] -rotate-45" />
          </button>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm z-50 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>

          <div className={clsx('p-6 pb-2 transition-all duration-300', isSidebarCollapsed ? 'flex justify-center px-2' : '')}>
            <Link href="/" className={clsx('flex items-center gap-0', isSidebarCollapsed && 'justify-center')}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 -mr-0.5">
                <Image src="/images/blue-logo.png" alt="cvrise" width={40} height={40} className="w-10 h-10" />
              </div>
              <AnimatePresence mode="wait">
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex flex-col whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-[1.2rem] font-extrabold tracking-[-0.03em] text-[#111111] leading-none">
                      CV<span className="text-[#0672AD]">Rise</span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 overflow-x-hidden">
            {!isSidebarCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Menu</div>
            )}
            {navItems.map((item) => (
              <DashboardNavItem
                key={item.label}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isCollapsed={isSidebarCollapsed}
                active={item.exact ? pathname === item.to : pathname.startsWith(item.to)}
                onClick={closeSidebar}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div
              className={clsx(
                'flex items-center gap-3 transition-all duration-300',
                isSidebarCollapsed ? 'justify-center p-2 rounded-full' : 'p-3 rounded-2xl bg-white border border-slate-100 shadow-sm'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>

              <AnimatePresence mode="wait">
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex flex-1 items-center gap-3 overflow-hidden"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                      onClick={() => {
                        closeSidebar();
                        logout();
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Log out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden w-full relative bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}
