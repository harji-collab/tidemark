import React, { useState, useRef, useEffect } from 'react';
import { ProvenanceMeta } from '../../types';
import { Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ProvenancePopoverProps {
  provenance?: ProvenanceMeta;
  label?: string;
  className?: string;
}

export const ProvenancePopover: React.FC<ProvenancePopoverProps> = ({
  provenance,
  label = 'Data provenance',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const meta: ProvenanceMeta = provenance || {
    source: 'National Blue Economy Observatory Ingest Service',
    lastUpdated: '10 minutes ago',
    qualityScore: 95,
    slaStatus: 'fresh',
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${label}: ${meta.source}, updated ${meta.lastUpdated}`}
        className="inline-flex items-center gap-1 text-[11px] text-[#5E7A8A] hover:text-[#1F7280] dark:text-[#799CA9] dark:hover:text-[#2EA2B5] transition-colors focus:outline-none focus:ring-1 focus:ring-[#1F7280] rounded px-1"
      >
        <Database className="w-3 h-3 text-[#1F7280] dark:text-[#2EA2B5]" />
        <span className="underline decoration-dotted underline-offset-2">Provenance</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Data Provenance Details"
          className="absolute z-50 bottom-full mb-1.5 left-0 w-72 p-3 bg-white dark:bg-[#0E2A3C] border border-[#D3E2E1] dark:border-[#1E445C] rounded-[4px] shadow-lg text-xs text-[#0E2230] dark:text-[#EEF8F8] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between border-b border-[#D3E2E1] dark:border-[#1E445C] pb-1.5 mb-2">
            <span className="font-semibold text-[#0E2230] dark:text-[#EEF8F8] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F7280] dark:text-[#2EA2B5]" />
              Dataset Provenance
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider ${
                meta.slaStatus === 'fresh'
                  ? 'bg-[#F0FDF6] text-[#1B7F57] dark:bg-[#0A2B1D] dark:text-[#4ED39A]'
                  : 'bg-[#FEF8EC] text-[#B26A00] dark:bg-[#2E1F06] dark:text-[#F5B93A]'
              }`}
            >
              {meta.slaStatus === 'fresh' ? 'Fresh (SLA OK)' : 'Stale Flag'}
            </span>
          </div>

          <div className="space-y-1.5 leading-relaxed">
            <div>
              <span className="text-[#5E7A8A] dark:text-[#799CA9] block text-[10px]">PRIMARY TELEMETRY SOURCE</span>
              <p className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">{meta.source}</p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#D3E2E1]/60 dark:border-[#1E445C]/60 text-[11px]">
              <span className="text-[#5E7A8A] dark:text-[#799CA9]">Ingest Timestamp:</span>
              <span className="font-medium">{meta.lastUpdated}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5E7A8A] dark:text-[#799CA9]">Validation Score:</span>
              <span className="font-medium inline-flex items-center gap-1 text-[#1B7F57] dark:text-[#4ED39A]">
                <CheckCircle2 className="w-3 h-3" />
                {meta.qualityScore}% Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
