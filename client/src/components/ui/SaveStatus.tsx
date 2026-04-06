import { Loader2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

const formatLastSaved = (date: Date) => {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Saved at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  return `Saved on ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString(
    [],
    { hour: 'numeric', minute: '2-digit', hour12: true },
  )}`;
};

export const SaveStatus = ({ isSaving, lastSaved }: SaveStatusProps) => {
  return (
    <div
      className={clsx(
        'text-xs font-medium py-1.5 px-3 rounded-full border shadow-sm flex items-center gap-2 transition-all duration-300',
        isSaving ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-gray-200 text-gray-500',
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Saving...
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          {formatLastSaved(lastSaved)}
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          Saved
        </>
      )}
    </div>
  );
};

