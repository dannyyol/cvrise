import type { ReactNode } from 'react';

export default function GuestEditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans bg-white">
      {children}
    </div>
  );
}
