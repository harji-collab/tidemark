import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../services/store';
import { Search, MapPin, Ship, Fish, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    harbours,
    vessels,
    stockAssessments,
    enforcementCases,
    licences,
    navigate,
    currentRole,
  } = useAppStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  const matchedHarbours = harbours.filter(
    (h) => h.name.toLowerCase().includes(q) || h.district.toLowerCase().includes(q)
  );

  const matchedVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.registrationNo.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q)
  );

  const matchedSpecies = stockAssessments.filter(
    (s) =>
      s.species.toLowerCase().includes(q) ||
      s.scientificName.toLowerCase().includes(q)
  );

  const matchedCases = enforcementCases.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.vesselRegNo.toLowerCase().includes(q)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global observatory search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0E2A3C] border border-[#D3E2E1] dark:border-[#1E445C] rounded-[4px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-3 border-b border-[#D3E2E1] dark:border-[#1E445C]">
          <Search className="w-4 h-4 text-[#5E7A8A] dark:text-[#799CA9]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vessels, harbours, species, cases, licences... (e.g. Kasimedu, Sardine, 4491)"
            className="w-full px-3 py-3 bg-transparent text-sm text-[#0E2230] dark:text-[#EEF8F8] placeholder:text-[#5E7A8A] dark:placeholder:text-[#799CA9] focus:outline-none"
          />
          <kbd className="text-[10px] bg-[#E5EFEF] dark:bg-[#14354B] px-1.5 py-0.5 rounded text-[#5E7A8A] dark:text-[#799CA9]">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {q.length === 0 ? (
            <p className="p-3 text-center text-[#5E7A8A] dark:text-[#799CA9]">
              Type a harbour name, vessel registration, species, or case code.
            </p>
          ) : (
            <>
              {/* Harbours */}
              {matchedHarbours.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#5E7A8A] dark:text-[#799CA9] uppercase px-2 block mb-1">
                    Harbours & Jetties
                  </span>
                  <div className="space-y-1">
                    {matchedHarbours.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          navigate({
                            portal: currentRole === 'official' ? 'officials' : currentRole === 'analyst' ? 'analyst' : 'community',
                            view: currentRole === 'official' ? 'command' : currentRole === 'analyst' ? 'pipeline' : 'today',
                            harbourId: h.id,
                            jurisdiction: h.district,
                          });
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-[#E5EFEF] dark:hover:bg-[#14354B] text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#1F7280] dark:text-[#2EA2B5]" />
                          <span className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">{h.name}</span>
                          <span className="text-[11px] text-[#5E7A8A] dark:text-[#799CA9]">({h.district})</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#1F7280] dark:text-[#2EA2B5]">
                          {h.seaStateVerdict}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vessels */}
              {matchedVessels.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#5E7A8A] dark:text-[#799CA9] uppercase px-2 block mb-1">
                    Vessels & Fleet
                  </span>
                  <div className="space-y-1">
                    {matchedVessels.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          navigate({
                            portal: 'officials',
                            view: 'command',
                            jurisdiction: v.district,
                            entityId: v.id,
                          });
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-[#E5EFEF] dark:hover:bg-[#14354B] text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Ship className="w-3.5 h-3.5 text-[#1F7280] dark:text-[#2EA2B5]" />
                          <span className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">{v.name}</span>
                          <span className="text-[11px] font-mono text-[#5E7A8A] dark:text-[#799CA9]">
                            {v.registrationNo}
                          </span>
                        </div>
                        <span className="text-[10px]">{v.speedKnots} kt</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Species */}
              {matchedSpecies.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#5E7A8A] dark:text-[#799CA9] uppercase px-2 block mb-1">
                    Fish Species & Biomass Stocks
                  </span>
                  <div className="space-y-1">
                    {matchedSpecies.map((s) => (
                      <button
                        key={s.species}
                        type="button"
                        onClick={() => {
                          navigate({
                            portal: currentRole === 'user' ? 'community' : 'officials',
                            view: currentRole === 'user' ? 'prices' : 'stocks',
                          });
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-[#E5EFEF] dark:hover:bg-[#14354B] text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Fish className="w-3.5 h-3.5 text-[#1F7280] dark:text-[#2EA2B5]" />
                          <span className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">{s.species}</span>
                          <span className="italic text-[11px] text-[#5E7A8A] dark:text-[#799CA9]">
                            ({s.scientificName})
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#1B7F57] dark:text-[#4ED39A]">
                          {s.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enforcement Cases */}
              {matchedCases.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#5E7A8A] dark:text-[#799CA9] uppercase px-2 block mb-1">
                    Enforcement Cases
                  </span>
                  <div className="space-y-1">
                    {matchedCases.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          navigate({
                            portal: 'officials',
                            view: 'enforcement',
                            entityId: c.id,
                          });
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-[#E5EFEF] dark:hover:bg-[#14354B] text-left"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-[#B3135F] dark:text-[#FF6FA8]" />
                          <span className="font-medium text-[#0E2230] dark:text-[#EEF8F8] truncate max-w-sm">
                            {c.title}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#B3135F] dark:text-[#FF6FA8]">
                          {c.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedHarbours.length === 0 &&
                matchedVessels.length === 0 &&
                matchedSpecies.length === 0 &&
                matchedCases.length === 0 && (
                  <p className="p-3 text-center text-[#5E7A8A] dark:text-[#799CA9]">
                    No matching records found for "{searchQuery}".
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
