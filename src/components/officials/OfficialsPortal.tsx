import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../services/store';
import { District, JurisdictionScope, Licence, EnforcementCase, Species } from '../../types';
import { TheChart } from '../chart/TheChart';
import { SignalBadge } from '../common/SignalBadge';
import { ProvenancePopover } from '../common/ProvenancePopover';
import { StateView } from '../common/StateView';
import {
  Compass,
  FileCheck2,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Megaphone,
  History,
  CheckCircle,
  XCircle,
  RotateCcw,
  Download,
  AlertTriangle,
  Ship,
  Eye,
  Filter,
  Users,
} from 'lucide-react';
import { ECONOMIC_DISTRICT_DATA } from '../../services/mockData';
import { computeBlueSustainabilityIndex, formatInr, formatMetric, getSlaStatus } from '../../utils/observatory';

export const OfficialsPortal: React.FC = () => {
  const {
    activeOfficialTab,
    setOfficialTab,
    selectedJurisdiction,
    setJurisdiction,
    vessels,
    harbours,
    licences,
    triageLicence,
    enforcementCases,
    assignEnforcementUnit,
    resolveEnforcementCase,
    stockAssessments,
    methodologyIndicators,
    auditLog,
    broadcastNewAdvisory,
    currentUser,
  } = useAppStore();

  const districts: District[] = [
    'Chennai',
    'Cuddalore',
    'Nagapattinam',
    'Ramanathapuram',
    'Thoothukudi',
    'Kanniyakumari',
  ];

  // Approvals Queue state & keyboard triage
  const pendingLicences = licences.filter(
    (l) =>
      (selectedJurisdiction === 'all' || l.district === selectedJurisdiction) &&
      l.status === 'pending_review'
  );

  const [selectedLicenceIndex, setSelectedLicenceIndex] = useState(0);
  const [triageAction, setTriageAction] = useState<'approve' | 'return' | 'reject' | null>(null);
  const [triageReason, setTriageReason] = useState('');
  const [triageFeedback, setTriageFeedback] = useState('');

  const currentLicence: Licence | undefined = pendingLicences[selectedLicenceIndex];

  // Enforcement modal state
  const [selectedCase, setSelectedCase] = useState<EnforcementCase | null>(null);
  const [assignUnitInput, setAssignUnitInput] = useState('ICGS Rani Abbakka');
  const [resolveNoteInput, setResolveNoteInput] = useState('');

  // Stocks closure what-if panel state
  const [closureSpecies, setClosureSpecies] = useState<Species>('Silver pomfret');
  const [closureDays, setClosureDays] = useState(45);
  const [closurePublished, setClosurePublished] = useState(false);

  // Advisory broadcaster state
  const [advTitle, setAdvTitle] = useState('Monsoon Swell & High Sea State Alert');
  const [advSentence, setAdvSentence] = useState('Wave heights exceeding 2.5 m expected after 14:00 hrs. All small craft advised to return to port.');
  const [advHarbours, setAdvHarbours] = useState<string[]>([]);
  const [advLanguages, setAdvLanguages] = useState<('en' | 'ta' | 'hi')[]>(['en', 'ta']);
  const [advSeverity, setAdvSeverity] = useState<'hazard' | 'caution' | 'info'>('hazard');
  const [advBroadcasted, setAdvBroadcasted] = useState(false);

  // Keyboard navigation for approvals queue (J/K next/prev, A approve, R return, X reject)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (activeOfficialTab !== 'approvals' || !currentLicence) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedLicenceIndex((prev) => Math.min(prev + 1, pendingLicences.length - 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedLicenceIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setTriageAction('approve');
        setTriageReason('All seaworthiness and biosecurity criteria verified against maritime registry.');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setTriageAction('return');
        setTriageReason('Clarification required on gear specifications and vessel VMS transponder ID.');
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setTriageAction('reject');
        setTriageReason('Non-compliant gear detected: banned purse-seine mesh size exceeds statutory limit.');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOfficialTab, currentLicence, pendingLicences.length]);

  const handleExecuteTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLicence || !triageAction || !triageReason.trim()) return;

    triageLicence(currentLicence.id, triageAction, triageReason);
    setTriageFeedback(`Licence ${triageAction === 'approve' ? 'approved' : triageAction === 'return' ? 'returned' : 'rejected'}`);
    setTriageAction(null);
    setTriageReason('');
    setSelectedLicenceIndex(0);
    setTimeout(() => setTriageFeedback(''), 3000);
  };

  // KPIs
  const filteredVessels = vessels.filter(
    (v) => selectedJurisdiction === 'all' || v.district === selectedJurisdiction
  );
  const compliantVessels = filteredVessels.filter((v) => v.complianceStatus === 'compliant');
  const complianceRatePct = filteredVessels.length > 0 ? Math.round((compliantVessels.length / filteredVessels.length) * 100) : 100;

  const currentBsi = computeBlueSustainabilityIndex(
    methodologyIndicators.map((m) => ({ weightPct: m.weightPct, currentScore: 78 }))
  );

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row bg-[#0B2230] text-[#EEF8F8] min-h-[calc(100vh-100px)]">
      {/* Left Jurisdiction Rail & Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1E445C] bg-[#0E2A3C] p-3 space-y-4 shrink-0">
        <div>
          <span className="text-[10px] font-bold text-[#799CA9] uppercase tracking-wider block mb-1">
            JURISDICTION RAIL
          </span>
          <select
            value={selectedJurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as JurisdictionScope)}
            className="w-full text-xs font-semibold bg-[#071C2B] border border-[#1E445C] rounded-[2px] p-2 text-[#EEF8F8]"
          >
            <option value="all">Tamil Nadu Maritime Coast (All)</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d} Coastal District
              </option>
            ))}
          </select>
        </div>

        {/* Portal Navigation Items */}
        <nav className="space-y-1 text-xs" aria-label="Officials portal tabs">
          <button
            type="button"
            onClick={() => setOfficialTab('command')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'command'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#2EA2B5]" />
              1. Command View
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOfficialTab('approvals')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'approvals'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#2EA2B5]" />
              2. Approvals Queue
            </span>
            {pendingLicences.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#B26A00] text-white text-[10px] font-bold rounded">
                {pendingLicences.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOfficialTab('enforcement')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'enforcement'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#2EA2B5]" />
              3. Enforcement Cases
            </span>
            <span className="px-1.5 py-0.2 bg-[#B3135F] text-white text-[10px] font-bold rounded">
              {enforcementCases.filter((c) => c.status !== 'resolved').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOfficialTab('stocks')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'stocks'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2EA2B5]" />
              4. Stocks & Quotas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOfficialTab('economics')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'economics'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2EA2B5]" />
              5. Economic Indicators
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOfficialTab('broadcaster')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'broadcaster'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#2EA2B5]" />
              6. Advisory Broadcaster
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOfficialTab('audit')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors ${
              activeOfficialTab === 'audit'
                ? 'bg-[#1F7280] text-white font-semibold'
                : 'text-[#ADC6CF] hover:bg-[#14354B]'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#2EA2B5]" />
              7. My Audit Trail
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Command Pane */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-5">
        {/* Screen 1: COMMAND VIEW */}
        {activeOfficialTab === 'command' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* 4 Core KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px]">
                <div className="flex justify-between items-start">
                  <span className="text-[#799CA9] text-[11px]">Landings Today vs 5yr Avg</span>
                  <ProvenancePopover />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums text-white">418.2 T</span>
                  <span className="text-[11px] text-[#4ED39A] font-semibold">+4.2% vs avg</span>
                </div>
                <span className="text-[10px] text-[#799CA9] block mt-0.5">8 harbours reporting</span>
              </div>

              <div className="p-3.5 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px]">
                <div className="flex justify-between items-start">
                  <span className="text-[#799CA9] text-[11px]">Active Vessels at Sea</span>
                  <ProvenancePopover />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums text-white">
                    {filteredVessels.length} hulls
                  </span>
                  <span className="text-[11px] text-[#2EA2B5]">VMS/AIS linked</span>
                </div>
                <span className="text-[10px] text-[#799CA9] block mt-0.5">142 pings/min</span>
              </div>

              <div className="p-3.5 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px]">
                <div className="flex justify-between items-start">
                  <span className="text-[#799CA9] text-[11px]">Fleet Compliance Rate</span>
                  <SignalBadge
                    type={complianceRatePct > 90 ? 'healthy' : 'caution'}
                    label={`${complianceRatePct}%`}
                    size="sm"
                  />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums text-white">
                    {complianceRatePct}%
                  </span>
                  <span className="text-[11px] text-[#F5B93A]">
                    {filteredVessels.length - compliantVessels.length} anomalies
                  </span>
                </div>
                <span className="text-[10px] text-[#799CA9] block mt-0.5">1 geofence breach</span>
              </div>

              <div className="p-3.5 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px]">
                <div className="flex justify-between items-start">
                  <span className="text-[#799CA9] text-[11px]">Blue Sustainability Index (BSI)</span>
                  <SignalBadge type="healthy" label="Index" size="sm" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums text-white">
                    {currentBsi} / 100
                  </span>
                  <span className="text-[11px] text-[#4ED39A]">Grade A-</span>
                </div>
                <span className="text-[10px] text-[#799CA9] block mt-0.5">Methodology v2.4</span>
              </div>
            </div>

            {/* Live Chart Split with Active Alert Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TheChart heightClass="h-[460px]" />
              </div>

              {/* Alert Feed Pane */}
              <div className="bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] p-3.5 space-y-3 flex flex-col h-[460px]">
                <div className="flex items-center justify-between border-b border-[#1E445C] pb-2">
                  <span className="font-semibold text-xs text-[#EEF8F8] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FF6FA8]" />
                    Command Alert Feed ({enforcementCases.length})
                  </span>
                  <span className="text-[10px] font-mono text-[#799CA9]">LIVE TELEMETRY</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                  {enforcementCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCase(c);
                        setOfficialTab('enforcement');
                      }}
                      className="p-2.5 bg-[#071C2B] border-l-2 border-[#FF6FA8] hover:bg-[#14354B] cursor-pointer rounded-[2px] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <SignalBadge
                          type={c.severity === 'hazard' ? 'hazard' : 'caution'}
                          label={c.type.replace('_', ' ').toUpperCase()}
                          size="sm"
                        />
                        <span className="text-[10px] text-[#799CA9]">{c.detectedAt.split(' ')[1]}</span>
                      </div>
                      <p className="font-semibold text-[11px] text-[#EEF8F8]">{c.title}</p>
                      <p className="text-[10px] text-[#799CA9] mt-0.5">
                        {c.vesselRegNo} &bull; {c.locationDesc}
                      </p>
                      {c.assignedPatrolUnit && (
                        <p className="text-[10px] text-[#2EA2B5] mt-1">
                          Patrol: {c.assignedPatrolUnit}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: APPROVALS QUEUE */}
        {activeOfficialTab === 'approvals' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E445C] pb-2">
              <div>
                <h2 className="font-display font-bold text-xl text-[#EEF8F8]">
                  Approvals Queue
                </h2>
                <p className="text-xs text-[#799CA9]">
                  Keyboard-driven triage: [J/K] navigate &bull; [A] Approve &bull; [R] Return &bull; [X] Reject
                </p>
              </div>
              <ProvenancePopover />
            </div>

            {triageFeedback && (
              <div className="p-2.5 bg-[#0A2B1D] border border-[#4ED39A] text-xs text-[#4ED39A] rounded-[2px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{triageFeedback} recorded in audit ledger.</span>
              </div>
            )}

            {pendingLicences.length === 0 ? (
              <StateView
                type="empty"
                title="All Licence & Permit Applications Cleared"
                message="No pending review items for the selected jurisdiction. Excellent SLA performance."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Queue List with colored left border for SLA */}
                <div className="lg:col-span-5 space-y-2">
                  <span className="text-[10px] font-bold text-[#799CA9] uppercase block mb-1">
                    Pending Applications ({pendingLicences.length})
                  </span>
                  {pendingLicences.map((lic, idx) => {
                    const slaState = getSlaStatus(lic.slaRemainingHours);
                    const isSelected = idx === selectedLicenceIndex;

                    return (
                      <div
                        key={lic.id}
                        onClick={() => setSelectedLicenceIndex(idx)}
                        className={`p-3 bg-[#0E2A3C] border-l-4 ${
                          slaState === 'stale'
                            ? 'border-l-[#FF6FA8]'
                            : slaState === 'warning'
                            ? 'border-l-[#F5B93A]'
                            : 'border-l-[#4ED39A]'
                        } ${
                          isSelected
                            ? 'ring-1 ring-[#2EA2B5] bg-[#14354B]'
                            : 'border-[#1E445C] hover:bg-[#14354B]/60'
                        } rounded-[2px] cursor-pointer transition-colors text-xs`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-[#EEF8F8]">{lic.vesselName}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              slaState === 'stale'
                                ? 'text-[#FF6FA8]'
                                : slaState === 'warning'
                                ? 'text-[#F5B93A]'
                                : 'text-[#4ED39A]'
                            }`}
                          >
                            {lic.slaRemainingHours > 0
                              ? `${lic.slaRemainingHours}h SLA`
                              : 'Overdue'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#799CA9] mt-0.5">
                          {lic.applicantName} &bull; {lic.district}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#799CA9] mt-1.5 pt-1 border-t border-[#1E445C]">
                          <span className="uppercase">{lic.type.replace('_', ' ')}</span>
                          <span className="font-mono">{lic.regNo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Application Review & Triage Box */}
                {currentLicence && (
                  <div className="lg:col-span-7 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] p-5 space-y-4">
                    <div className="border-b border-[#1E445C] pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#2EA2B5]">
                          Application #{currentLicence.id}
                        </span>
                        <h3 className="font-display text-xl font-bold text-white">
                          {currentLicence.vesselName}
                        </h3>
                        <p className="text-xs text-[#799CA9]">
                          Applicant: {currentLicence.applicantName} ({currentLicence.applicantPhone})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#799CA9] block">District Jurisdiction</span>
                        <span className="text-xs font-semibold text-[#EEF8F8]">
                          {currentLicence.district}
                        </span>
                      </div>
                    </div>

                    {/* Attached Verification Documents */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#799CA9] uppercase block">
                        Submitted Statutory Documents
                      </span>
                      <div className="space-y-1 text-xs">
                        {currentLicence.documents.map((doc) => (
                          <div
                            key={doc.name}
                            className="p-2 bg-[#071C2B] border border-[#1E445C] rounded-[2px] flex justify-between items-center"
                          >
                            <span className="font-mono text-[#EEF8F8]">{doc.name}</span>
                            <span className="text-[10px] text-[#4ED39A] font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subsidy Info */}
                    {currentLicence.subsidyEligible && (
                      <div className="p-3 bg-[#0A2B1D] border border-[#4ED39A]/40 rounded-[2px] text-xs flex justify-between items-center text-[#4ED39A]">
                        <span>Direct Benefit Subsidy Transfer Entitlement</span>
                        <span className="font-bold tabular-nums text-sm">
                          {formatInr(currentLicence.subsidyAmountInr || 45000)}
                        </span>
                      </div>
                    )}

                    {/* Triage Decision Form */}
                    <form onSubmit={handleExecuteTriage} className="space-y-3 pt-2 border-t border-[#1E445C]">
                      <span className="text-[10px] font-bold text-[#799CA9] uppercase block">
                        Record Statutory Decision (Mandatory Reason Required)
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTriageAction('approve');
                            setTriageReason('All seaworthiness, biometric, and gear certificates verified against fisheries registry.');
                          }}
                          className={`py-2 px-3 text-xs font-semibold rounded-[2px] border transition-colors ${
                            triageAction === 'approve'
                              ? 'bg-[#1B7F57] text-white border-[#4ED39A]'
                              : 'bg-[#071C2B] text-[#4ED39A] border-[#1E445C] hover:bg-[#14354B]'
                          }`}
                        >
                          [A] Approve licence
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTriageAction('return');
                            setTriageReason('Clarification requested regarding vessel VMS transponder serial validation.');
                          }}
                          className={`py-2 px-3 text-xs font-semibold rounded-[2px] border transition-colors ${
                            triageAction === 'return'
                              ? 'bg-[#B26A00] text-white border-[#F5B93A]'
                              : 'bg-[#071C2B] text-[#F5B93A] border-[#1E445C] hover:bg-[#14354B]'
                          }`}
                        >
                          [R] Return for info
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTriageAction('reject');
                            setTriageReason('Non-compliant gear detected: banned purse-seine mesh size exceeds statutory limit.');
                          }}
                          className={`py-2 px-3 text-xs font-semibold rounded-[2px] border transition-colors ${
                            triageAction === 'reject'
                              ? 'bg-[#B3135F] text-white border-[#FF6FA8]'
                              : 'bg-[#071C2B] text-[#FF6FA8] border-[#1E445C] hover:bg-[#14354B]'
                          }`}
                        >
                          [X] Reject application
                        </button>
                      </div>

                      {triageAction && (
                        <div className="space-y-2 animate-in fade-in duration-100">
                          <label className="text-[11px] font-medium text-[#EEF8F8]">
                            Official Rationale for {triageAction.toUpperCase()} (Required for Audit)
                          </label>
                          <textarea
                            value={triageReason}
                            onChange={(e) => setTriageReason(e.target.value)}
                            required
                            rows={2}
                            placeholder="State exact statutory reason..."
                            className="w-full p-2 text-xs bg-[#071C2B] border border-[#1E445C] rounded-[2px] text-[#EEF8F8] focus:outline-none focus:border-[#2EA2B5]"
                          />
                          <button
                            type="submit"
                            className="w-full py-2 bg-[#2EA2B5] text-[#071C2B] font-bold text-xs rounded-[2px] hover:bg-[#6CB9B8] transition-colors"
                          >
                            Confirm {triageAction === 'approve' ? 'Licence Approval' : triageAction === 'return' ? 'Return to Applicant' : 'Application Rejection'}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Screen 3: ENFORCEMENT */}
        {activeOfficialTab === 'enforcement' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E445C] pb-2">
              <div>
                <h2 className="font-display font-bold text-xl text-[#EEF8F8]">
                  Enforcement & Patrol Operations
                </h2>
                <p className="text-xs text-[#799CA9]">
                  Geofence breaches, transponder blackouts, closed-season operations & spill signatures.
                </p>
              </div>
              <ProvenancePopover />
            </div>

            <div className="space-y-3">
              {enforcementCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SignalBadge
                          type={c.severity === 'hazard' ? 'hazard' : 'caution'}
                          label={c.type.replace('_', ' ').toUpperCase()}
                          size="md"
                        />
                        <h3 className="font-bold text-sm text-[#EEF8F8]">{c.title}</h3>
                      </div>
                      <p className="text-xs font-mono text-[#799CA9]">
                        Target Hull: {c.vesselRegNo} &bull; Detected at: {c.detectedAt}
                      </p>
                      <p className="text-xs text-[#2EA2B5]">Location: {c.locationDesc}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs font-bold uppercase rounded-[2px] self-start sm:self-center ${
                        c.status === 'resolved'
                          ? 'bg-[#0A2B1D] text-[#4ED39A]'
                          : c.status === 'assigned'
                          ? 'bg-[#14354B] text-[#2EA2B5]'
                          : 'bg-[#2B0E1E] text-[#FF6FA8]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Case Notes History */}
                  <div className="p-2.5 bg-[#071C2B] rounded-[2px] text-xs space-y-1 border border-[#1E445C]">
                    <span className="text-[10px] font-bold text-[#799CA9] uppercase block">
                      Investigation Log:
                    </span>
                    {c.notes.map((n, idx) => (
                      <p key={idx} className="text-[#ADC6CF]">
                        &bull; {n}
                      </p>
                    ))}
                  </div>

                  {/* Action Controls */}
                  {c.status !== 'resolved' && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={assignUnitInput}
                        onChange={(e) => setAssignUnitInput(e.target.value)}
                        placeholder="Patrol unit name"
                        className="px-2 py-1 text-xs bg-[#071C2B] border border-[#1E445C] rounded-[2px] text-[#EEF8F8]"
                      />
                      <button
                        type="button"
                        onClick={() => assignEnforcementUnit(c.id, assignUnitInput)}
                        className="px-3 py-1 bg-[#1F7280] text-white hover:bg-[#17566A] text-xs font-semibold rounded-[2px]"
                      >
                        Assign Patrol Intercept
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          resolveEnforcementCase(
                            c.id,
                            'Interception verified and documented by patrol unit. Case closed.'
                          )
                        }
                        className="px-3 py-1 bg-[#1B7F57] text-white hover:bg-[#12583C] text-xs font-semibold rounded-[2px] ml-auto"
                      >
                        Resolve Case
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screen 4: STOCKS AND QUOTAS */}
        {activeOfficialTab === 'stocks' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E445C] pb-2">
              <div>
                <h2 className="font-display font-bold text-xl text-[#EEF8F8]">
                  Fish Stocks & Quota Governance
                </h2>
                <p className="text-xs text-[#799CA9]">
                  Biomass reference points (B/B_msy, F/F_msy) with Closure What-If Simulator.
                </p>
              </div>
              <ProvenancePopover />
            </div>

            {/* Stocks Table */}
            <div className="bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#071C2B] text-[#799CA9] text-[11px] border-b border-[#1E445C]">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Species & Scientific Name</th>
                    <th className="py-2.5 px-3 text-right">Biomass B/B_msy</th>
                    <th className="py-2.5 px-3 text-right">Mortality F/F_msy</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Annual Quota</th>
                    <th className="py-2.5 px-3 text-right">Quota Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E445C]">
                  {stockAssessments.map((s) => {
                    const consumedPct = Math.round((s.consumedTons / s.annualQuotaTons) * 100);
                    return (
                      <tr key={s.species} className="hover:bg-[#14354B]">
                        <td className="py-2.5 px-3 font-semibold text-[#EEF8F8]">
                          {s.species}
                          <span className="block text-[10px] text-[#799CA9] italic font-normal">
                            {s.scientificName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-mono text-[#EEF8F8]">
                          {s.bCurrentVsBmsy.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-mono text-[#EEF8F8]">
                          {s.fCurrentVsFmsy.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <SignalBadge
                            type={
                              s.status === 'sustainable'
                                ? 'healthy'
                                : s.status === 'rebuilding'
                                ? 'caution'
                                : 'hazard'
                            }
                            label={s.status.toUpperCase()}
                            size="sm"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-[#EEF8F8]">
                          {formatMetric(s.annualQuotaTons)} T
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="tabular-nums font-semibold text-[#EEF8F8]">
                              {consumedPct}%
                            </span>
                            <div className="w-16 h-2 bg-[#071C2B] rounded-full overflow-hidden border border-[#1E445C]">
                              <div
                                className={`h-full ${
                                  consumedPct > 90
                                    ? 'bg-[#FF6FA8]'
                                    : consumedPct > 75
                                    ? 'bg-[#F5B93A]'
                                    : 'bg-[#4ED39A]'
                                }`}
                                style={{ width: `${Math.min(consumedPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Closure Scheduler with What-If Panel */}
            <div className="p-5 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] space-y-4">
              <div className="border-b border-[#1E445C] pb-2">
                <h3 className="font-display font-bold text-base text-white">
                  Closure Scheduler & What-If Impact Simulator
                </h3>
                <p className="text-xs text-[#799CA9]">
                  Evaluate affected vessels, estimated catch reduction, and livelihood support required before publishing regulatory closures.
                </p>
              </div>

              {closurePublished && (
                <div className="p-3 bg-[#0A2B1D] border border-[#4ED39A] text-xs text-[#4ED39A] rounded-[2px] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Regulatory closure gazette published and broadcasted to all Tamil Nadu maritime districts.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Target Depleted Species</label>
                    <select
                      value={closureSpecies}
                      onChange={(e) => setClosureSpecies(e.target.value as Species)}
                      className="w-full p-2 bg-[#071C2B] border border-[#1E445C] rounded-[2px] text-[#EEF8F8]"
                    >
                      <option value="Silver pomfret">Silver pomfret (Depleted - B/Bmsy 0.68)</option>
                      <option value="Seer fish (King seer)">Seer fish (King seer) (Overfished)</option>
                      <option value="Yellowfin tuna">Yellowfin tuna (Overfished)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Proposed Closure Window (Days)</label>
                    <input
                      type="range"
                      min={15}
                      max={90}
                      step={5}
                      value={closureDays}
                      onChange={(e) => setClosureDays(Number(e.target.value))}
                      className="w-full accent-[#2EA2B5]"
                    />
                    <div className="flex justify-between text-[11px] text-[#799CA9] mt-1">
                      <span>15 Days</span>
                      <span className="font-bold text-white">{closureDays} Days</span>
                      <span>90 Days</span>
                    </div>
                  </div>
                </div>

                {/* What-if calculation output box */}
                <div className="p-4 bg-[#071C2B] border border-[#1E445C] rounded-[2px] space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-[#2EA2B5] uppercase block">
                    What-If Impact Analysis
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#799CA9]">Affected Mechanised Trawlers:</span>
                      <span className="font-bold text-white">
                        {Math.round(closureDays * 14.8)} vessels
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#799CA9]">Estimated Fisher Livelihoods:</span>
                      <span className="font-bold text-white">
                        {Math.round(closureDays * 88)} crew families
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#799CA9]">Livelihood Relief Outlay:</span>
                      <span className="font-bold text-[#F5B93A]">
                        {formatInr(closureDays * 88 * 5000)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#1E445C] pt-1">
                      <span className="text-[#799CA9]">Spawning Biomass Recovery:</span>
                      <span className="font-bold text-[#4ED39A]">
                        +{(closureDays * 0.28).toFixed(1)}% B/B_msy
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setClosurePublished(true);
                  setTimeout(() => setClosurePublished(false), 4000);
                }}
                className="w-full py-2.5 bg-[#B3135F] hover:bg-[#8D0D49] text-white font-bold text-xs rounded-[2px] transition-colors"
              >
                Publish Statutory Closure Order
              </button>
            </div>
          </div>
        )}

        {/* Screen 5: ECONOMIC INDICATORS */}
        {activeOfficialTab === 'economics' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E445C] pb-2">
              <div>
                <h2 className="font-display font-bold text-xl text-[#EEF8F8]">
                  Blue Economy Indicators
                </h2>
                <p className="text-xs text-[#799CA9]">
                  Blue GVA, seafood export receipts, coastal employment & fisher household income.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const csv = ECONOMIC_DISTRICT_DATA.map((d) => Object.values(d).join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'tidemark-blue-economy-indicators.csv';
                  a.click();
                }}
                className="px-3 py-1.5 bg-[#0E2A3C] border border-[#1E445C] hover:bg-[#14354B] text-xs font-semibold text-white rounded-[2px] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#2EA2B5]" />
                Export CSV Dataset
              </button>
            </div>

            {/* District Comparison Table */}
            <div className="bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[#071C2B] text-[#799CA9] text-[11px] border-b border-[#1E445C]">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Maritime District</th>
                    <th className="py-2.5 px-3 text-right">Blue GVA (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-right">Seafood Exports (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-right">Coastal Jobs</th>
                    <th className="py-2.5 px-3 text-right">Avg Fisher Mo. Income</th>
                    <th className="py-2.5 px-3 text-right">Price Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E445C]">
                  {ECONOMIC_DISTRICT_DATA.map((d) => (
                    <tr key={d.district} className="hover:bg-[#14354B]">
                      <td className="py-2.5 px-3 font-semibold text-[#EEF8F8]">{d.district}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#EEF8F8]">
                        ₹{d.blueGvaCr.toLocaleString()} Cr
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#EEF8F8]">
                        ₹{d.exportValueCr.toLocaleString()} Cr
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#EEF8F8]">
                        {d.coastalJobs.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#4ED39A]">
                        ₹{d.fisherIncomeMonth.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#EEF8F8]">
                        {d.priceIndex.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Screen 6: ADVISORY BROADCASTER */}
        {activeOfficialTab === 'broadcaster' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#1E445C] pb-2">
              <h2 className="font-display font-bold text-xl text-[#EEF8F8]">
                Advisory Broadcaster
              </h2>
              <p className="text-xs text-[#799CA9]">
                Compose and broadcast alerts targeted by harbour, language, and severity.
              </p>
            </div>

            {advBroadcasted && (
              <div className="p-3 bg-[#0A2B1D] border border-[#4ED39A] text-xs text-[#4ED39A] rounded-[2px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Advisory broadcast dispatched to coastal fishers SMS & Community app inbox.</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Form */}
              <div className="p-4 bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#EEF8F8] block mb-1">Bulletin Headline</label>
                  <input
                    type="text"
                    value={advTitle}
                    onChange={(e) => setAdvTitle(e.target.value)}
                    required
                    className="w-full p-2 bg-[#071C2B] border border-[#1E445C] rounded-[2px] text-[#EEF8F8]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#EEF8F8] block mb-1">
                    Plain-Sentence Instruction (Plain Language Required)
                  </label>
                  <textarea
                    value={advSentence}
                    onChange={(e) => setAdvSentence(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-2 bg-[#071C2B] border border-[#1E445C] rounded-[2px] text-[#EEF8F8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-[#EEF8F8] block mb-1">Severity</label>
                    <select
                      value={advSeverity}
                      onChange={(e) => setAdvSeverity(e.target.value as 'hazard' | 'caution' | 'info')}
                      className="w-full p-2 bg-[#071C2B] border border-[#1E445C] rounded-[2px] text-[#EEF8F8]"
                    >
                      <option value="hazard">Hazard Magenta (Life safety)</option>
                      <option value="caution">Caution Amber (Warning)</option>
                      <option value="info">Info Blue (PFZ / Routine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[#EEF8F8] block mb-1">Languages</label>
                    <div className="flex gap-2 pt-1 text-xs">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advLanguages.includes('en')}
                          onChange={(e) => {
                            if (e.target.checked) setAdvLanguages([...advLanguages, 'en']);
                            else setAdvLanguages(advLanguages.filter((l) => l !== 'en'));
                          }}
                        />
                        <span>EN</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advLanguages.includes('ta')}
                          onChange={(e) => {
                            if (e.target.checked) setAdvLanguages([...advLanguages, 'ta']);
                            else setAdvLanguages(advLanguages.filter((l) => l !== 'ta'));
                          }}
                        />
                        <span>தமிழ்</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advLanguages.includes('hi')}
                          onChange={(e) => {
                            if (e.target.checked) setAdvLanguages([...advLanguages, 'hi']);
                            else setAdvLanguages(advLanguages.filter((l) => l !== 'hi'));
                          }}
                        />
                        <span>हिन्दी</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    broadcastNewAdvisory({
                      title: advTitle,
                      plainSentence: advSentence,
                      harbourIds: advHarbours,
                      languages: advLanguages,
                      severity: advSeverity,
                    });
                    setAdvBroadcasted(true);
                    setTimeout(() => setAdvBroadcasted(false), 3000);
                  }}
                  className="w-full py-2.5 bg-[#2EA2B5] text-[#071C2B] font-bold text-xs rounded-[2px] hover:bg-[#6CB9B8] transition-colors"
                >
                  Broadcast to Marine Fleet & Fishers
                </button>
              </div>

              {/* Community Portal Format Live Preview */}
              <div className="p-4 bg-[#071C2B] border border-[#1E445C] rounded-[2px] space-y-2">
                <span className="text-[10px] font-bold text-[#799CA9] uppercase block">
                  Community Portal Live Preview
                </span>
                <div className="p-3 bg-white text-[#0E2230] rounded-[2px] shadow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{advTitle}</span>
                    <SignalBadge type={advSeverity} label={advSeverity.toUpperCase()} size="sm" />
                  </div>
                  <p className="text-xs leading-relaxed text-[#0E2230] font-medium">
                    {advSentence}
                  </p>
                  <div className="text-[10px] text-[#5E7A8A] border-t border-[#D3E2E1] pt-1">
                    Delivering in: {advLanguages.join(' / ').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 7: MY AUDIT TRAIL */}
        {activeOfficialTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#1E445C] pb-2">
              <h2 className="font-display font-bold text-xl text-[#EEF8F8]">
                Official Regulatory Audit Trail
              </h2>
              <p className="text-xs text-[#799CA9]">
                Immutable tamper-evident record of all licensing, enforcement and advisory state changes.
              </p>
            </div>

            <div className="bg-[#0E2A3C] border border-[#1E445C] rounded-[2px] divide-y divide-[#1E445C]">
              {auditLog.map((log) => (
                <div key={log.id} className="p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#2EA2B5] font-mono">{log.action}</span>
                    <span className="text-[11px] text-[#799CA9]">{log.timestamp}</span>
                  </div>
                  <p className="text-[#EEF8F8]">{log.rationale}</p>
                  <div className="flex justify-between text-[10px] text-[#799CA9]">
                    <span>Actor: {log.actorEmail} ({log.actorRole})</span>
                    <span>Entity: {log.entityType} ({log.entityId})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
