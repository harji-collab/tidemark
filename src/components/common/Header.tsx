import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { District, JurisdictionScope } from '../../types';
import { Search, Bell, Globe, User, LogOut, Compass, Shield, Link2, Check } from 'lucide-react';
import { Language, t } from '../../services/i18n';

export const Header: React.FC = () => {
  const {
    currentRole,
    currentNavTarget,
    currentUser,
    language,
    setLanguage,
    textSize,
    setTextSize,
    selectedJurisdiction,
    setJurisdiction,
    signOut,
    navigate,
    copyDeepLink,
    setSearchOpen,
    advisories,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyDeepLink();
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const districts: District[] = [
    'Chennai',
    'Cuddalore',
    'Nagapattinam',
    'Ramanathapuram',
    'Thoothukudi',
    'Kanniyakumari',
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6]/95 dark:bg-[#0E2A3C]/95 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ portal: 'gateway' })}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="Return to Tidemark Observatory Gateway"
          >
            <div className="w-8 h-8 rounded-[2px] bg-[#0E2230] dark:bg-[#1E445C] border border-[#BFE6DF]/40 text-[#BFE6DF] flex items-center justify-center shadow-sm select-none group-hover:border-[#BFE6DF] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" strokeWidth="1" opacity="0.6" />
                <path d="M12 3v18M3 12h18" strokeWidth="0.8" strokeDasharray="2 2" />
                <circle cx="12" cy="7" r="1.5" />
                <path d="M12 8.5v10.5M8 14c2.2 2.5 5.8 2.5 8 0" strokeWidth="1.8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[#0E2230] dark:text-[#EEF8F8] group-hover:text-[#1F7280] dark:group-hover:text-[#2EA2B5] transition-colors">
                  {t('app.name', language)}
                </span>
                {currentRole && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-[2px] bg-[#E5EFEF] text-[#1F7280] dark:bg-[#14354B] dark:text-[#2EA2B5] tracking-wider border border-current/20">
                    {currentRole === 'user' ? 'Community' : currentRole === 'official' ? 'Officials' : 'Analyst'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#5E7A8A] dark:text-[#799CA9] hidden sm:block leading-none">
                {t('app.subtitle', language)}
              </p>
            </div>
          </button>

          {/* Jurisdiction Scope (Shown for Officials and Analyst) */}
          {(currentRole === 'official' || currentRole === 'analyst') && (
            <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-[#D3E2E1] dark:border-[#1E445C]">
              <span className="text-[11px] text-[#5E7A8A] dark:text-[#799CA9] uppercase font-medium">Scope:</span>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as JurisdictionScope)}
                aria-label="Jurisdiction scope selector"
                className="text-xs font-semibold bg-white dark:bg-[#071C2B] text-[#0E2230] dark:text-[#EEF8F8] border border-[#D3E2E1] dark:border-[#1E445C] rounded-[2px] px-2 py-1 focus:ring-1 focus:ring-[#1F7280]"
              >
                <option value="all">All Tamil Nadu Coast (Statewide)</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* In-Session Deep Link Copy Button */}
          {currentRole && (
            <button
              type="button"
              onClick={handleCopyLink}
              title={`In-session deep link: #${currentNavTarget.portal}?view=${currentNavTarget.view || ''}`}
              aria-label="Copy in-session deep link"
              className="flex items-center gap-1 px-2 py-1 text-xs text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230] dark:hover:text-[#EEF8F8] bg-white/70 dark:bg-[#071C2B]/70 border border-[#D3E2E1] dark:border-[#1E445C] rounded-[2px] transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1B7F57] dark:text-[#4ED39A]" />
                  <span className="hidden md:inline text-[11px] text-[#1B7F57] dark:text-[#4ED39A] font-medium">Link Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Deep Link</span>
                </>
              )}
            </button>
          )}

          {/* Global Search Button (Cmd/Ctrl+K) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search across observatory (Press Command or Control K)"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230] dark:hover:text-[#EEF8F8] bg-white/70 dark:bg-[#071C2B]/70 border border-[#D3E2E1] dark:border-[#1E445C] rounded-[2px] transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden lg:inline text-[10px] bg-[#E5EFEF] dark:bg-[#14354B] px-1 py-0.2 rounded font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center border border-[#D3E2E1] dark:border-[#1E445C] rounded-[2px] overflow-hidden text-xs bg-white dark:bg-[#071C2B]">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 transition-colors ${
                language === 'en'
                  ? 'bg-[#1F7280] text-white font-medium'
                  : 'text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              style={{ fontFamily: '"Noto Sans Tamil", sans-serif' }}
              className={`px-2 py-1 transition-colors ${
                language === 'ta'
                  ? 'bg-[#1F7280] text-white font-medium'
                  : 'text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230]'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}
              className={`px-2 py-1 transition-colors ${
                language === 'hi'
                  ? 'bg-[#1F7280] text-white font-medium'
                  : 'text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230]'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Text Size Toggle */}
          <button
            type="button"
            onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
            aria-label="Toggle text size"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-[2px] border border-[#D3E2E1] dark:border-[#1E445C] bg-white dark:bg-[#071C2B] text-xs font-semibold text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230]"
          >
            {textSize === 'normal' ? 'A' : 'A+'}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Toggle alerts and advisories"
              className="relative p-1.5 rounded-[2px] text-[#5E7A8A] dark:text-[#799CA9] hover:text-[#0E2230] dark:hover:text-[#EEF8F8] border border-[#D3E2E1] dark:border-[#1E445C] bg-white dark:bg-[#071C2B]"
            >
              <Bell className="w-4 h-4" />
              {advisories.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B3135F] dark:bg-[#FF6FA8]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-[#0E2A3C] border border-[#D3E2E1] dark:border-[#1E445C] rounded-[4px] shadow-xl p-3 z-50 text-xs text-[#0E2230] dark:text-[#EEF8F8]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D3E2E1] dark:border-[#1E445C]">
                  <span className="font-semibold">Active Coastal Advisories ({advisories.length})</span>
                  <span className="text-[10px] text-[#5E7A8A] dark:text-[#799CA9]">Tamil Nadu Marine Dept</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {advisories.map((adv) => (
                    <div key={adv.id} className="p-2 rounded-[2px] bg-[#F2F7F6] dark:bg-[#071C2B] border-l-2 border-[#B26A00]">
                      <p className="font-medium text-[11px]">{adv.title}</p>
                      <p className="text-[10px] text-[#5E7A8A] dark:text-[#799CA9] mt-0.5">{adv.plainSentence}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Sign In / Out */}
          {currentRole ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#D3E2E1] dark:border-[#1E445C]">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold leading-tight text-[#0E2230] dark:text-[#EEF8F8] truncate max-w-[120px]">
                  {currentUser?.isPublicViewer ? 'Public Viewer (Guest)' : currentUser?.name || 'Authorized User'}
                </p>
                <p className="text-[10px] text-[#5E7A8A] dark:text-[#799CA9] leading-tight">
                  {currentUser?.isPublicViewer ? 'Read-only mode' : currentUser?.emailOrPhone || 'Active'}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out of portal"
                className="p-1.5 rounded-[2px] text-[#B3135F] dark:text-[#FF6FA8] hover:bg-[#FDF2F7] dark:hover:bg-[#2B0E1E] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-[#5E7A8A] dark:text-[#799CA9] hidden sm:inline">
              Select Depth to Enter
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
