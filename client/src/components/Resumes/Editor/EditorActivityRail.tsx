import { clsx } from 'clsx';
import { PencilLine, Sparkles, Palette, LogOut } from 'lucide-react';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { useAuth } from '@/src/context/AuthContext';

export type RailMode = 'sections' | 'ai' | 'design';

const RAIL_ITEMS: { mode: RailMode; icon: React.ElementType; label: string }[] = [
  { mode: 'sections', icon: PencilLine, label: 'Sections' },
  { mode: 'ai', icon: Sparkles, label: 'AI Insights' },
  { mode: 'design', icon: Palette, label: 'Design' },
];

interface EditorActivityRailProps {
  railMode: RailMode;
  setRailMode: (mode: RailMode) => void;
}

export function EditorActivityRail({ railMode, setRailMode }: EditorActivityRailProps) {
  const { logout } = useAuth();

  return (
    <div className="hidden lg:flex flex-col w-[52px] shrink-0 bg-white border-r border-gray-200 py-2.5 z-10 items-center gap-1.5">
      {RAIL_ITEMS.map(({ mode, icon: Icon, label }) => {
        const isActive = railMode === mode;
        return (
          <Tooltip key={mode} content={label} position="right">
            <div className="relative w-full flex justify-center">
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[#04659A] rounded-r-full" />
              )}
              <button
                onClick={() => setRailMode(mode)}
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  isActive
                    ? 'bg-blue-50 text-[#04659A]'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            </div>
          </Tooltip>
        );
      })}

      <div className="flex-1" />

      <Tooltip content="Log out" position="right">
        <div className="relative w-full flex justify-center">
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </Tooltip>
    </div>
  );
}
