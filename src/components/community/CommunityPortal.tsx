import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Species, Harbour } from '../../types';
import { TheChart } from '../chart/TheChart';
import { SignalBadge } from '../common/SignalBadge';
import { ProvenancePopover } from '../common/ProvenancePopover';
import { StateView } from '../common/StateView';
import {
  Waves,
  MapPin,
  FileCheck,
  TrendingUp,
  AlertOctagon,
  Inbox,
  Send,
  Upload,
  CheckCircle2,
  Clock,
  Compass,
  WifiOff,
  RefreshCw,
  Camera,
  PlusCircle,
} from 'lucide-react';
import { t } from '../../services/i18n';
import { MARKET_PRICES } from '../../services/mockData';
import { formatInr } from '../../utils/observatory';

export const CommunityPortal: React.FC = () => {
  const {
    activeCommunityTab,
    setCommunityTab,
    language,
    harbours,
    selectedHarbourId,
    setSelectedHarbourId,
    offlineCatchQueue,
    addCatchEntry,
    syncOfflineQueue,
    licences,
    incidentReports,
    submitIncidentReport,
    advisories,
    currentUser,
    navigate,
  } = useAppStore();

  const selectedHarbour =
    harbours.find((h) => h.id === selectedHarbourId) || harbours[0];

  // 30-second catch log form state
  const [catchSpecies, setCatchSpecies] = useState<Species>('Oil sardine');
  const [catchWeight, setCatchWeight] = useState<number | ''>(320);
  const [catchLandingSite, setCatchLandingSite] = useState(selectedHarbour.name);
  const [catchSuccess, setCatchSuccess] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Incident report form state
  const [incidentCategory, setIncidentCategory] = useState<'illegal_fishing' | 'pollution' | 'stranded_marine_life'>('illegal_fishing');
  const [incidentLocation, setIncidentLocation] = useState('Kasimedu North Breakwater');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);

  // Market prices selected harbour
  const [priceHarbour, setPriceHarbour] = useState<'Kasimedu' | 'Cuddalore' | 'Nagapattinam' | 'Thoothukudi'>('Kasimedu');

  const speciesList: Species[] = [
    'Oil sardine',
    'Indian mackerel',
    'Yellowfin tuna',
    'Seer fish (King seer)',
    'Anchovy',
    'Silver pomfret',
    'Farmed vannamei shrimp',
  ];

  const handleCatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catchWeight || Number(catchWeight) <= 0) return;
    addCatchEntry(
      {
        species: catchSpecies,
        weightKg: Number(catchWeight),
        harbourId: selectedHarbour.id,
        notes: `Landing at ${catchLandingSite}`,
      },
      isSimulatedOffline
    );
    setCatchSuccess(true);
    setTimeout(() => setCatchSuccess(false), 3000);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;
    submitIncidentReport({
      category: incidentCategory,
      locationName: incidentLocation,
      coordinates: selectedHarbour.coordinates,
      description: incidentDesc,
      reporterPhone: currentUser?.emailOrPhone || '+91 94441 23890',
      reporterRole: 'user',
    });
    setIncidentSubmitted(true);
    setIncidentDesc('');
    setTimeout(() => setIncidentSubmitted(false), 4000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 pt-2 px-3 sm:px-4">
      {/* Public Viewer Mode Banner */}
      {currentUser?.isPublicViewer && (
        <div className="mb-3 p-2.5 rounded-[2px] bg-[#EBF7F4] dark:bg-[#07241C] border border-[#1F7280]/40 flex items-center justify-between text-xs text-[#0E2230] dark:text-[#EEF8F8] animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F7280] dark:bg-[#2EA2B5]" />
            <span>
              <strong>Public Guest Mode (Read-Only):</strong> Viewing live weather, chart layers &amp; market prices.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate({ portal: 'gateway' })}
            className="px-2.5 py-1 bg-[#1F7280] text-white rounded text-[11px] font-semibold hover:bg-[#17566A] shrink-0"
          >
            Sign in with OTP
          </button>
        </div>
      )}

      {/* Offline Status Banner */}
      {offlineCatchQueue.filter((q) => q.syncStatus === 'queued_offline').length > 0 && (
        <div className="mb-3 p-2.5 rounded-[2px] bg-[#FEF8EC] dark:bg-[#2E1F06] border border-[#B26A00]/40 flex items-center justify-between text-xs text-[#B26A00] dark:text-[#F5B93A]">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Offline Queue:</strong> {offlineCatchQueue.filter((q) => q.syncStatus === 'queued_offline').length} {t('label.offlineNotice', language)}
            </span>
          </div>
          <button
            type="button"
            onClick={syncOfflineQueue}
            className="px-2 py-1 bg-[#1F7280] text-white rounded text-[11px] font-semibold flex items-center gap-1 hover:bg-[#17566A]"
          >
            <RefreshCw className="w-3 h-3" />
            {t('label.syncNow', language)}
          </button>
        </div>
      )}

      {/* Screen 1: TODAY AT SEA */}
      {activeCommunityTab === 'today' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Harbour Selector */}
          <div className="flex items-center justify-between border-b border-[#D3E2E1] pb-2">
            <div>
              <span className="text-[10px] font-bold text-[#5E7A8A] uppercase tracking-wider block">
                {t('label.harbour', language)}
              </span>
              <select
                value={selectedHarbourId}
                onChange={(e) => setSelectedHarbourId(e.target.value)}
                aria-label="Select harbour"
                className="font-display font-bold text-lg sm:text-xl text-[#0E2230] bg-transparent focus:outline-none cursor-pointer"
              >
                {harbours.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district})
                  </option>
                ))}
              </select>
            </div>
            <ProvenancePopover provenance={selectedHarbour.provenance} />
          </div>

          {/* Bold Plain-Sentence Sea Verdict */}
          <div
            className={`p-4 sm:p-5 rounded-[2px] border ${
              selectedHarbour.seaStateVerdict === 'go'
                ? 'bg-[#F0FDF6] border-[#1B7F57]/40 text-[#0E2230]'
                : selectedHarbour.seaStateVerdict === 'caution'
                ? 'bg-[#FEF8EC] border-[#B26A00]/40 text-[#0E2230]'
                : 'bg-[#FDF2F7] border-[#B3135F]/40 text-[#0E2230]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#5E7A8A]">
                TODAY’S SEA VERDICT
              </span>
              <SignalBadge
                type={
                  selectedHarbour.seaStateVerdict === 'go'
                    ? 'healthy'
                    : selectedHarbour.seaStateVerdict === 'caution'
                    ? 'caution'
                    : 'hazard'
                }
                label={t(`verdict.${selectedHarbour.seaStateVerdict}`, language)}
                size="lg"
              />
            </div>

            <p className="font-display text-lg sm:text-xl font-bold leading-snug">
              {selectedHarbour.verdictReason}
            </p>
          </div>

          {/* 4 Primary Conditions Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-white border border-[#D3E2E1] rounded-[2px]">
              <span className="text-[#5E7A8A] text-[11px] block">{t('label.waveHeight', language)}</span>
              <span className="text-xl font-bold tabular-nums text-[#0E2230]">
                {selectedHarbour.waveHeightM} m
              </span>
              <span className="text-[10px] text-[#5E7A8A] block mt-0.5">Swell 8.4s</span>
            </div>

            <div className="p-3 bg-white border border-[#D3E2E1] rounded-[2px]">
              <span className="text-[#5E7A8A] text-[11px] block">{t('label.wind', language)}</span>
              <span className="text-xl font-bold tabular-nums text-[#0E2230]">
                {selectedHarbour.windKnots} kt
              </span>
              <span className="text-[10px] text-[#5E7A8A] block mt-0.5">NE offshore</span>
            </div>

            <div className="p-3 bg-white border border-[#D3E2E1] rounded-[2px]">
              <span className="text-[#5E7A8A] text-[11px] block">{t('label.sst', language)}</span>
              <span className="text-xl font-bold tabular-nums text-[#0E2230]">
                {selectedHarbour.sstCelsius}°C
              </span>
              <span className="text-[10px] text-[#5E7A8A] block mt-0.5">Optimal pelagic</span>
            </div>

            <div className="p-3 bg-white border border-[#D3E2E1] rounded-[2px]">
              <span className="text-[#5E7A8A] text-[11px] block">{t('label.pfz', language)}</span>
              <span className="text-sm font-bold text-[#1F7280] truncate block mt-1">
                {selectedHarbour.pfzBearingKm}
              </span>
              <span className="text-[10px] text-[#5E7A8A] block">High Chlorophyll</span>
            </div>
          </div>

          {/* Quick Action: Log Today's Catch or View Chart */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCommunityTab('chart')}
              className="flex-1 py-3 px-4 bg-white border border-[#1F7280] text-[#1F7280] font-semibold text-xs rounded-[2px] text-center hover:bg-[#E5EFEF] transition-colors"
            >
              Open Fishing Zones on Chart
            </button>
            <button
              type="button"
              onClick={() => setCommunityTab('catch')}
              className="flex-1 py-3 px-4 bg-[#1F7280] hover:bg-[#17566A] text-white font-semibold text-xs rounded-[2px] text-center transition-colors"
            >
              Log Today's Catch (30s)
            </button>
          </div>

          {/* Active Advisories Card */}
          <div className="p-4 bg-white border border-[#D3E2E1] rounded-[2px] space-y-2">
            <div className="flex items-center justify-between border-b border-[#D3E2E1] pb-1.5">
              <span className="font-semibold text-xs text-[#0E2230]">
                Harbour Safety Advisories ({selectedHarbour.activeAlertsCount})
              </span>
              <button
                type="button"
                onClick={() => setCommunityTab('advisories')}
                className="text-[11px] text-[#1F7280] hover:underline"
              >
                View all &rarr;
              </button>
            </div>
            {selectedHarbour.activeAlertsCount > 0 ? (
              <p className="text-xs text-[#5E7A8A]">
                High swell and breaker warning active near outer breakwater channel. Review notice before casting off.
              </p>
            ) : (
              <p className="text-xs text-[#1B7F57] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                No adverse maritime safety alerts active for {selectedHarbour.name}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Screen 2: THE CHART */}
      {activeCommunityTab === 'chart' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#D3E2E1] pb-2">
            <div>
              <h2 className="font-display font-bold text-lg text-[#0E2230]">
                {t('comm.chart', language)}
              </h2>
              <p className="text-xs text-[#5E7A8A]">
                Fishing zones, seasonal closures, marine sanctuaries & hazards
              </p>
            </div>
            <ProvenancePopover />
          </div>

          <TheChart heightClass="h-[480px]" />
        </div>
      )}

      {/* Screen 3: CATCH LOG (30-second rapid entry) */}
      {activeCommunityTab === 'catch' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-[#D3E2E1] pb-2">
            <h2 className="font-display font-bold text-lg text-[#0E2230]">
              {t('comm.catchLog', language)}
            </h2>
            <p className="text-xs text-[#5E7A8A]">
              Rapid 30-second landing entry. Works seamlessly offline.
            </p>
          </div>

          {catchSuccess && (
            <div className="p-3 bg-[#F0FDF6] border border-[#1B7F57] text-xs text-[#1B7F57] rounded-[2px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Catch logged successfully! Verified and added to local ledger.</span>
            </div>
          )}

          <form onSubmit={handleCatchSubmit} className="p-4 bg-white border border-[#D3E2E1] rounded-[2px] space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0E2230]">{t('label.species', language)}</label>
              <select
                value={catchSpecies}
                onChange={(e) => setCatchSpecies(e.target.value as Species)}
                className="w-full px-3 py-2 text-sm border border-[#D3E2E1] rounded-[2px] bg-[#F2F7F6]"
              >
                {speciesList.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0E2230]">{t('label.weight', language)}</label>
              <input
                type="number"
                value={catchWeight}
                onChange={(e) => setCatchWeight(e.target.value === '' ? '' : Number(e.target.value))}
                required
                min={1}
                max={50000}
                placeholder="e.g. 350"
                className="w-full px-3 py-2 text-sm border border-[#D3E2E1] rounded-[2px] bg-[#F2F7F6] tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0E2230]">{t('label.landingSite', language)}</label>
              <input
                type="text"
                value={catchLandingSite}
                onChange={(e) => setCatchLandingSite(e.target.value)}
                required
                placeholder="e.g. Kasimedu North Wharf"
                className="w-full px-3 py-2 text-sm border border-[#D3E2E1] rounded-[2px] bg-[#F2F7F6]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSimulatedOffline}
                  onChange={(e) => setIsSimulatedOffline(e.target.checked)}
                  className="rounded text-[#1F7280]"
                />
                <span className="text-[#5E7A8A]">Simulate at-sea offline mode</span>
              </label>

              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-[#5E7A8A] hover:text-[#1F7280]"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Add landing photo (optional)</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1F7280] hover:bg-[#17566A] text-white font-semibold text-xs rounded-[2px] transition-colors"
            >
              {t('label.submitCatch', language)}
            </button>
          </form>

          {/* Offline & Recent Logs */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#5E7A8A] uppercase tracking-wider block">
              Recent Logged Catches ({offlineCatchQueue.length})
            </span>
            <div className="space-y-1.5">
              {offlineCatchQueue.map((item) => (
                <div
                  key={item.localId}
                  className="p-3 bg-white border border-[#D3E2E1] rounded-[2px] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#0E2230]">{item.species}</span>
                    <span className="text-[11px] text-[#5E7A8A] block">
                      {item.timestamp} &bull; {item.notes}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#0E2230]">
                      {item.weightKg} kg
                    </span>
                    <span
                      className={`block text-[10px] font-semibold uppercase ${
                        item.syncStatus === 'synced'
                          ? 'text-[#1B7F57]'
                          : 'text-[#B26A00]'
                      }`}
                    >
                      {item.syncStatus === 'synced' ? 'Synced' : 'Queued offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: LICENCES & SUBSIDIES */}
      {activeCommunityTab === 'licences' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-[#D3E2E1] pb-2">
            <h2 className="font-display font-bold text-lg text-[#0E2230]">
              {t('comm.licences', language)}
            </h2>
            <p className="text-xs text-[#5E7A8A]">
              Track your marine fishing permits, aquaculture licences and diesel subsidies.
            </p>
          </div>

          <div className="space-y-3">
            {licences.map((lic) => (
              <div
                key={lic.id}
                className="p-4 bg-white border border-[#D3E2E1] rounded-[2px] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#1F7280] uppercase">
                      {lic.type.replace('_', ' ')}
                    </span>
                    <h3 className="font-semibold text-sm text-[#0E2230]">{lic.vesselName}</h3>
                    <p className="text-xs font-mono text-[#5E7A8A]">{lic.regNo}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      lic.status === 'approved'
                        ? 'bg-[#F0FDF6] text-[#1B7F57] border border-[#1B7F57]/30'
                        : lic.status === 'pending_review'
                        ? 'bg-[#FEF8EC] text-[#B26A00] border border-[#B26A00]/30'
                        : 'bg-[#FDF2F7] text-[#B3135F] border border-[#B3135F]/30'
                    }`}
                  >
                    {lic.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Timeline Step Progression */}
                <div className="p-2.5 bg-[#F2F7F6] rounded-[2px] text-[11px] space-y-1">
                  <div className="flex justify-between text-[#5E7A8A]">
                    <span>Submitted: {lic.submittedDate}</span>
                    <span>
                      {lic.slaRemainingHours > 0
                        ? `SLA: ${lic.slaRemainingHours}h remaining`
                        : 'SLA Overdue'}
                    </span>
                  </div>
                  {lic.reasonNote && (
                    <p className="text-[#0E2230] font-medium pt-1 border-t border-[#D3E2E1]">
                      Official Note: {lic.reasonNote}
                    </p>
                  )}
                </div>

                {/* Subsidies */}
                {lic.subsidyEligible && (
                  <div className="flex items-center justify-between text-xs text-[#1B7F57] bg-[#F0FDF6] p-2 rounded-[2px]">
                    <span>Eligible Fuel & Gear Subsidy</span>
                    <span className="font-bold tabular-nums">
                      {formatInr(lic.subsidyAmountInr || 45000)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screen 5: MARKET PRICES */}
      {activeCommunityTab === 'prices' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#D3E2E1] pb-2">
            <div>
              <h2 className="font-display font-bold text-lg text-[#0E2230]">
                {t('comm.prices', language)}
              </h2>
              <p className="text-xs text-[#5E7A8A]">
                Daily auction & wholesale rates per kg with 14-day price trend.
              </p>
            </div>
            <ProvenancePopover />
          </div>

          {/* Harbour selector for prices */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['Kasimedu', 'Cuddalore', 'Nagapattinam', 'Thoothukudi'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setPriceHarbour(h)}
                className={`px-3 py-1.5 rounded-[2px] whitespace-nowrap transition-colors ${
                  priceHarbour === h
                    ? 'bg-[#1F7280] text-white font-semibold'
                    : 'bg-white border border-[#D3E2E1] text-[#5E7A8A] hover:text-[#0E2230]'
                }`}
              >
                {h} Wholesale
              </button>
            ))}
          </div>

          {/* Table of species prices */}
          <div className="bg-white border border-[#D3E2E1] rounded-[2px] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F2F7F6] text-[#5E7A8A] text-[11px] border-b border-[#D3E2E1]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Species</th>
                  <th className="py-2.5 px-3 text-right">Price / kg</th>
                  <th className="py-2.5 px-3 text-right">14-Day Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3E2E1]">
                {MARKET_PRICES.map((item) => {
                  const price =
                    priceHarbour === 'Kasimedu'
                      ? item.priceKasimedu
                      : priceHarbour === 'Cuddalore'
                      ? item.priceCuddalore
                      : priceHarbour === 'Nagapattinam'
                      ? item.priceNagapattinam
                      : item.priceThoothukudi;

                  const min = Math.min(...item.trend14d);
                  const max = Math.max(...item.trend14d);
                  const pts = item.trend14d
                    .map((val, idx) => {
                      const x = (idx / (item.trend14d.length - 1)) * 60;
                      const y = 20 - ((val - min) / (max - min || 1)) * 16;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <tr key={item.species} className="hover:bg-[#F2F7F6]">
                      <td className="py-2.5 px-3 font-medium text-[#0E2230]">
                        {item.species}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0E2230] tabular-nums">
                        ₹{price}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <svg className="w-16 h-5 inline-block" viewBox="0 0 60 20">
                          <polyline
                            points={pts}
                            fill="none"
                            stroke="#1F7280"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screen 6: REPORT AN INCIDENT */}
      {activeCommunityTab === 'incident' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-[#D3E2E1] pb-2">
            <h2 className="font-display font-bold text-lg text-[#0E2230]">
              {t('comm.incident', language)}
            </h2>
            <p className="text-xs text-[#5E7A8A]">
              Report illegal fishing vessels, oil pollution, or stranded marine wildlife directly to coastal patrols.
            </p>
          </div>

          {incidentSubmitted && (
            <div className="p-3 bg-[#F0FDF6] border border-[#1B7F57] text-xs text-[#1B7F57] rounded-[2px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Incident reported successfully! Dispatched to coastal enforcement unit.</span>
            </div>
          )}

          <form onSubmit={handleIncidentSubmit} className="p-4 bg-white border border-[#D3E2E1] rounded-[2px] space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0E2230]">Incident Category</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIncidentCategory('illegal_fishing')}
                  className={`p-2 rounded-[2px] border text-center transition-colors ${
                    incidentCategory === 'illegal_fishing'
                      ? 'border-[#1F7280] bg-[#E5EFEF] font-semibold text-[#1F7280]'
                      : 'border-[#D3E2E1] text-[#5E7A8A]'
                  }`}
                >
                  Illegal Fishing
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentCategory('pollution')}
                  className={`p-2 rounded-[2px] border text-center transition-colors ${
                    incidentCategory === 'pollution'
                      ? 'border-[#1F7280] bg-[#E5EFEF] font-semibold text-[#1F7280]'
                      : 'border-[#D3E2E1] text-[#5E7A8A]'
                  }`}
                >
                  Pollution / Slick
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentCategory('stranded_marine_life')}
                  className={`p-2 rounded-[2px] border text-center transition-colors ${
                    incidentCategory === 'stranded_marine_life'
                      ? 'border-[#1F7280] bg-[#E5EFEF] font-semibold text-[#1F7280]'
                      : 'border-[#D3E2E1] text-[#5E7A8A]'
                  }`}
                >
                  Stranded Wildlife
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0E2230]">Location Description</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                required
                placeholder="e.g. 2 km east of Kasimedu Lighthouse"
                className="w-full px-3 py-2 text-sm border border-[#D3E2E1] rounded-[2px] bg-[#F2F7F6]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#0E2230]">Detailed Description</label>
              <textarea
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                required
                rows={3}
                placeholder="Describe vessel markings, gear type, color of chemical discharge, or animal condition..."
                className="w-full px-3 py-2 text-sm border border-[#D3E2E1] rounded-[2px] bg-[#F2F7F6]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#B3135F] hover:bg-[#8D0D49] text-white font-semibold text-xs rounded-[2px] transition-colors"
            >
              Submit Report to Marine Patrol
            </button>
          </form>

          {/* Active Incident Reports Tracking */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#5E7A8A] uppercase tracking-wider block">
              Active Reports Status ({incidentReports.length})
            </span>
            <div className="space-y-2">
              {incidentReports.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3 bg-white border border-[#D3E2E1] rounded-[2px] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0E2230] uppercase text-[11px]">
                      {inc.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-[#1F7280] uppercase">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[#5E7A8A]">{inc.description}</p>
                  <div className="flex justify-between text-[11px] text-[#5E7A8A] pt-1 border-t border-[#D3E2E1]">
                    <span>{inc.locationName}</span>
                    <span>{inc.reportedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 7: ADVISORIES INBOX */}
      {activeCommunityTab === 'advisories' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="border-b border-[#D3E2E1] pb-2">
            <h2 className="font-display font-bold text-lg text-[#0E2230]">
              {t('comm.advisories', language)}
            </h2>
            <p className="text-xs text-[#5E7A8A]">
              Official weather bulletins, closed-season notices and potential fishing zone forecasts.
            </p>
          </div>

          <div className="space-y-3">
            {advisories.map((adv) => (
              <div
                key={adv.id}
                className="p-4 bg-white border border-[#D3E2E1] rounded-[2px] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-[#0E2230]">{adv.title}</h3>
                  <SignalBadge
                    type={adv.severity === 'hazard' ? 'hazard' : adv.severity === 'caution' ? 'caution' : 'info'}
                    label={adv.severity.toUpperCase()}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-[#0E2230] leading-relaxed font-medium">
                  {adv.plainSentence}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#5E7A8A] pt-2 border-t border-[#D3E2E1]">
                  <span>Broadcast: {adv.scheduledAt}</span>
                  <span>Delivered to {adv.deliveredCount.toLocaleString()} fishers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile-First Bottom Navigation Bar (Large 48px touch targets) */}
      <nav
        aria-label="Community portal navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#F2F7F6] border-t border-[#D3E2E1] px-1 py-1 flex items-center justify-around shadow-md"
      >
        <button
          type="button"
          onClick={() => setCommunityTab('today')}
          aria-label={t('comm.today', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'today'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <Waves className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.today', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('chart')}
          aria-label={t('comm.chart', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'chart'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.chart', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('catch')}
          aria-label={t('comm.catchLog', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'catch'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.catchLog', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('licences')}
          aria-label={t('comm.licences', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'licences'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <FileCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.licences', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('prices')}
          aria-label={t('comm.prices', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'prices'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.prices', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('incident')}
          aria-label={t('comm.incident', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'incident'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <AlertOctagon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.incident', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setCommunityTab('advisories')}
          aria-label={t('comm.advisories', language)}
          className={`flex-1 py-2 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
            activeCommunityTab === 'advisories'
              ? 'text-[#1F7280] font-semibold bg-[#E5EFEF]'
              : 'text-[#5E7A8A] hover:text-[#0E2230]'
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 truncate">{t('comm.advisories', language)}</span>
        </button>
      </nav>
    </div>
  );
};
