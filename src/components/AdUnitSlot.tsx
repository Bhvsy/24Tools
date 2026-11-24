import React from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';

interface AdUnitSlotProps {
  slotId: string;
  label: string;
  format: 'leaderboard' | 'in-feed' | 'footer-banner';
  publisherId: string;
  visible: boolean;
  onOpenStudio: () => void;
}

export const AdUnitSlot: React.FC<AdUnitSlotProps> = ({
  slotId,
  label,
  format,
  publisherId,
  visible,
  onOpenStudio,
}) => {
  if (!visible) return null;

  const heightClass =
    format === 'leaderboard' ? 'min-h-[84px]' : format === 'in-feed' ? 'min-h-[96px]' : 'min-h-[80px]';

  return (
    <div
      className={`w-full ${heightClass} px-5 py-3.5 bg-slate-100/75 dark:bg-slate-900/70 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
      data-ad-client={publisherId}
      data-ad-slot={slotId}
    >
      <div className="space-y-0.5">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          <span>Sponsored Placement · {label}</span>
          <span className="mx-1.5">·</span>
          <span>Client: {publisherId}</span>
          <span className="mx-1.5">·</span>
          <span>Slot: {slotId}</span>
        </div>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
          High-CTR Responsive AdSense / Carbon Ad Unit container — Core Web Vitals CLS-locked (0.00 layout shift).
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenStudio}
        className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
      >
        <DollarSign className="w-3.5 h-3.5" />
        Configure Ad Slot
      </button>
    </div>
  );
};
