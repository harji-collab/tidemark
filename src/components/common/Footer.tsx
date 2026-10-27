import React from 'react';
import { useAppStore } from '../../services/store';
import { t } from '../../services/i18n';
import { Database, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useAppStore();

  return (
    <footer className="w-full border-t border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] py-3 px-4 text-xs text-[#5E7A8A] dark:text-[#799CA9] transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#FEF8EC] dark:bg-[#2E1F06] text-[#B26A00] dark:text-[#F5B93A] font-semibold text-[11px] border border-[#B26A00]/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Synthetic demo data
          </span>
          <span className="text-[11px]">
            Tidemark, National Blue Economy Observatory — Tamil Nadu Pilot Jurisdiction
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>INCOIS / CMFRI / NFDB telemetry schemas</span>
          <span className="text-[#3B5A6B] dark:text-[#ADC6CF]">Status: Operational</span>
        </div>
      </div>
    </footer>
  );
};
