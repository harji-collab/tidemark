import React from 'react';
import { AlertCircle, Clock, RefreshCw, FolderOpen } from 'lucide-react';

interface StateViewProps {
  type: 'loading' | 'empty' | 'stale' | 'error';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const StateView: React.FC<StateViewProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  if (type === 'loading') {
    return (
      <div className={`p-8 flex flex-col items-center justify-center text-center space-y-3 ${className}`}>
        <div className="w-6 h-6 border-2 border-[#1F7280] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9]">
          {message || 'Retrieving hydrographic telemetry and landing feeds...'}
        </p>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className={`p-8 border border-dashed border-[#D3E2E1] dark:border-[#1E445C] rounded-[2px] text-center space-y-3 ${className}`}>
        <div className="inline-flex p-2.5 rounded-full bg-[#E5EFEF] dark:bg-[#14354B] text-[#1F7280] dark:text-[#2EA2B5]">
          <FolderOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-[#0E2230] dark:text-[#EEF8F8]">{title || 'No records found'}</h4>
          <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9] max-w-sm mx-auto">
            {message || 'No items match your active filters or jurisdiction selection.'}
          </p>
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-3 py-1.5 bg-[#1F7280] hover:bg-[#17566A] text-white text-xs font-medium rounded-[2px] transition-colors focus:ring-2 focus:ring-[#1F7280]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  if (type === 'stale') {
    return (
      <div className={`p-3 bg-[#FEF8EC] dark:bg-[#2E1F06] border-l-4 border-[#B26A00] dark:border-[#F5B93A] text-xs text-[#B26A00] dark:text-[#F5B93A] flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            <strong>Stale Data:</strong> {message || 'This telemetry record is older than the agreed 30-minute SLA.'}
          </span>
        </div>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="underline font-semibold hover:opacity-80 ml-3 shrink-0"
          >
            {actionLabel || 'Refresh now'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 bg-[#FDF2F7] dark:bg-[#2B0E1E] border-l-4 border-[#B3135F] dark:border-[#FF6FA8] text-xs text-[#B3135F] dark:text-[#FF6FA8] space-y-2 ${className}`}>
      <div className="flex items-center gap-2 font-medium">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{title || 'Feed Connection Interruption'}</span>
      </div>
      <p className="text-xs opacity-90">
        {message || 'The coastal telemetry pipeline failed to return a validated signature. Verify satellite connector status.'}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#B3135F] text-white dark:bg-[#FF6FA8] dark:text-[#2B0E1E] font-medium rounded-[2px] transition-opacity hover:opacity-90 mt-1"
        >
          <RefreshCw className="w-3 h-3" />
          {actionLabel || 'Retry ingest'}
        </button>
      )}
    </div>
  );
};
