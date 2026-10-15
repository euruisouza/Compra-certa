import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-40 flex items-center gap-2.5 rounded-xl bg-[#075E37] px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-emerald-600/30 animate-in fade-in slide-in-from-bottom-2"
    >
      <WifiOff className="w-4 h-4 text-emerald-300 shrink-0" />
      <span>Você está offline. Suas informações estão salvas neste dispositivo.</span>
    </div>
  );
};
