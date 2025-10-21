import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';

export const OfflineStatus = () => {
  const { offlineStatus, forceSync } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await forceSync();
    setIsSyncing(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 1500);
  };

  if (offlineStatus.isOnline) {
    return (
      <div className="p-1.5 text-text" title="Online">
        <Wifi className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="p-1.5 text-text" title="Offline">
        <WifiOff className="w-4 h-4" />
      </div>

      <button
        onClick={handleSync}
        disabled={isSyncing || isSuccess}
        className={`
          flex items-center justify-center w-8 h-8 rounded-lg
          transition-all duration-300 border
          ${isSuccess 
            ? 'bg-green-500 text-white border-green-600 cursor-default scale-110' 
            : isSyncing
            ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-wait dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800'
            : 'special-theme-button hover:scale-105 active:scale-95'
          }
        `}
        title={isSuccess ? "Синхронизировано" : isSyncing ? "Синхронизация..." : "Синхронизировать"}
      >
        {isSuccess ? (
          <Check className="w-4 h-4" />
        ) : isSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};