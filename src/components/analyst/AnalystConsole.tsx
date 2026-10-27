import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../services/store';
import { Connector, DataAnomaly, MethodologyIndicator, ModelMetadata } from '../../types';
import { SignalBadge } from '../common/SignalBadge';
import { ProvenancePopover } from '../common/ProvenancePopover';
import { StateView } from '../common/StateView';
import {
  Activity,
  AlertTriangle,
  Sliders,
  Cpu,
  Lock,
  Key,
  FileSpreadsheet,
  Settings,
  Bot,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Send,
  Sparkles,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export const AnalystConsole: React.FC = () => {
  const {
    activeAnalystTab,
    setAnalystTab,
    connectors,
    triggerConnectorBackfill,
    dataAnomalies,
    resolveAnomaly,
    methodologyIndicators,
    proposeMethodologyUpdate,
    secondAnalystApproveMethodology,
    modelRegistry,
    rollbackModel,
    userAccounts,
    forceSignOutUser,
    auditLog,
    analystIdleSecondsRemaining,
    resetAnalystIdleTimer,
    decrementIdleTimer,
    isAnalystLocked,
    lockAnalystConsole,
    unlockAnalystConsole,
    currentUser,
    signOut,
    assistantMessages,
    askAssistant,
    isAssistantLoading,
  } = useAppStore();

  // 15-minute idle timer decrement
  useEffect(() => {
    const timer = setInterval(() => {
      decrementIdleTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [decrementIdleTimer]);

  const idleMinutes = Math.floor(analystIdleSecondsRemaining / 60);
  const idleSeconds = analystIdleSecondsRemaining % 60;

  // Anomaly override modal state
  const [selectedAnomaly, setSelectedAnomaly] = useState<DataAnomaly | null>(null);
  const [overrideNote, setOverrideNote] = useState('');
  const [anomalyResolvedFeedback, setAnomalyResolvedFeedback] = useState('');

  // Methodology edit state
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState(30);
  const [newWarning, setNewWarning] = useState(0.9);

  // Assistant prompt state
  const [assistantInput, setAssistantInput] = useState('');

  const handleResolveAnomaly = (type: 'resolved_rule' | 'resolved_override') => {
    if (!selectedAnomaly) return;
    resolveAnomaly(
      selectedAnomaly.id,
      type,
      overrideNote || 'Validated against primary sensor stream & physical displacement constraints.'
    );
    setAnomalyResolvedFeedback(`Anomaly ${selectedAnomaly.id} resolved as ${type}. Logged to immutable audit trail.`);
    setSelectedAnomaly(null);
    setOverrideNote('');
    setTimeout(() => setAnomalyResolvedFeedback(''), 4000);
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim() || isAssistantLoading) return;
    askAssistant(assistantInput);
    setAssistantInput('');
  };

  return (
    <div
      onMouseMove={resetAnalystIdleTimer}
      onKeyDown={resetAnalystIdleTimer}
      className="flex-1 w-full bg-[#05141F] text-[#DCECF5] min-h-[calc(100vh-100px)] flex flex-col font-ui text-[13px]"
    >
      {/* Top Console Status Bar with 15-min Idle Lock Countdown */}
      <div className="h-9 bg-[#071B2B] border-b border-[#123149] px-4 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[#38BDF8] flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#4ED39A] animate-pulse" />
            ANALYST CONSOLE // AIR-GAPPED METRICS OBSERVATORY
          </span>
          <span className="text-[#5D798B] hidden sm:inline">Telemetry Cluster: TN-EAST-COAST</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#F5B93A]">
            <Clock className="w-3.5 h-3.5" />
            <span>
              SESSION TIMEOUT: {String(idleMinutes).padStart(2, '0')}:{String(idleSeconds).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={resetAnalystIdleTimer}
            className="text-[10px] bg-[#0B2438] hover:bg-[#123149] text-[#8DA8BA] px-2 py-0.5 rounded border border-[#123149]"
          >
            Extend 15m
          </button>
          <button
            type="button"
            onClick={lockAnalystConsole}
            title="Lock Analyst Console"
            className="text-[10px] bg-[#290C1B] hover:bg-[#46142E] text-[#FF6FA8] px-2 py-0.5 rounded border border-[#FF6FA8]/30 flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Analyst Console Locked Overlay */}
      {isAnalystLocked && (
        <div className="fixed inset-0 z-50 bg-[#05141F]/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#071B2B] border-2 border-[#38BDF8]/60 rounded-[4px] p-6 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#123149] border border-[#38BDF8] mx-auto flex items-center justify-center text-[#38BDF8]">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#F5B93A] uppercase font-bold">
                SECURITY PROTOCOL // IDLE LOCK TRIGGERED
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Analyst Workstation Locked
              </h3>
              <p className="text-xs text-[#8DA8BA] leading-relaxed">
                Terminal suspended after 15 minutes of inactivity in compliance with maritime data observatory protocols.
              </p>
            </div>

            <div className="p-3 bg-[#0B2438] border border-[#123149] rounded-[2px] text-xs font-mono text-left space-y-1">
              <span className="text-[10px] text-[#5D798B] block uppercase">Active Workstation Credential</span>
              <p className="text-white font-bold">{currentUser?.name || 'Lead Marine Data Steward'}</p>
              <p className="text-[11px] text-[#38BDF8]">{currentUser?.emailOrPhone || 'ananya.deshmukh@tidemark.gov.in'}</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={unlockAnalystConsole}
                className="w-full py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#05141F] font-bold text-xs rounded-[2px] shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Tap FIDO2 Key / Re-authenticate (Extend 15m)
              </button>
              <button
                type="button"
                onClick={signOut}
                className="w-full py-2 bg-transparent hover:bg-[#123149] border border-[#123149] text-xs text-[#8DA8BA] hover:text-white rounded-[2px] transition-colors"
              >
                Sign Out to Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Console Split View: Left Navigation + Central Workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Dense Rail */}
        <nav
          aria-label="Analyst console sections"
          className="w-full md:w-56 bg-[#071B2B] border-b md:border-b-0 md:border-r border-[#123149] p-2 space-y-1 shrink-0 text-xs font-mono"
        >
          <button
            type="button"
            onClick={() => setAnalystTab('pipeline')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'pipeline'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
              1. Pipeline Health
            </span>
            <span className="text-[10px] text-[#4ED39A]">6/6</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('quality')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'quality'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F5B93A]" />
              2. Data Quality Inbox
            </span>
            <span className="text-[10px] bg-[#B3135F] text-white px-1.5 py-0.2 rounded font-bold">
              {dataAnomalies.filter((a) => a.status === 'unresolved').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('methodology')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'methodology'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
              3. Methodology Studio
            </span>
            <span className="text-[10px] text-[#8DA8BA]">v2.4</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('models')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'models'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
              4. Model Registry
            </span>
            <span className="text-[10px] text-[#4ED39A]">3 online</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('access')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'access'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#38BDF8]" />
              5. Access Control
            </span>
            <span className="text-[10px] text-[#8DA8BA]">{userAccounts.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('audit')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'audit'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#38BDF8]" />
              6. Immutable Audit Log
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('rules')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'rules'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#38BDF8]" />
              7. Rules & Thresholds
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAnalystTab('assistant')}
            className={`w-full flex items-center justify-between p-2 rounded-[2px] transition-colors text-left ${
              activeAnalystTab === 'assistant'
                ? 'bg-[#123149] text-[#38BDF8] font-bold border-l-2 border-[#38BDF8]'
                : 'text-[#8DA8BA] hover:bg-[#0B2438]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
              8. Tidemark Assistant
            </span>
            <span className="text-[10px] text-[#38BDF8]">AI Grounded</span>
          </button>
        </nav>

        {/* Central High-Density Workspace */}
        <main className="flex-1 p-4 lg:p-5 overflow-y-auto space-y-4">
          {/* Screen 1: PIPELINE HEALTH */}
          {activeAnalystTab === 'pipeline' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#123149] pb-2">
                <div>
                  <h2 className="font-mono text-base font-bold text-white uppercase">
                    Data Connectors & Telemetry Ingest Pipelines
                  </h2>
                  <p className="text-xs text-[#8DA8BA]">
                    Freshness SLAs, socket latency, drop rate, and manual incremental backfill.
                  </p>
                </div>
                <ProvenancePopover />
              </div>

              <div className="bg-[#071B2B] border border-[#123149] rounded-[2px] overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-[#0B2438] text-[#5D798B] text-[11px] border-b border-[#123149]">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Connector Service</th>
                      <th className="py-2.5 px-3 text-left">Category</th>
                      <th className="py-2.5 px-right text-right">Freshness</th>
                      <th className="py-2.5 px-right text-right">Latency</th>
                      <th className="py-2.5 px-right text-right">Error Rate</th>
                      <th className="py-2.5 px-right text-right">Records Today</th>
                      <th className="py-2.5 px-center text-center">Status</th>
                      <th className="py-2.5 px-right text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123149]">
                    {connectors.map((c) => (
                      <tr key={c.id} className="hover:bg-[#0B2438]/80">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {c.name}
                          <span className="block text-[10px] text-[#5D798B]">{c.id}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#8DA8BA]">{c.category}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-white">
                          {c.freshnessSeconds}s (SLA {c.slaMaxSeconds}s)
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-[#38BDF8]">
                          {c.latencyMs} ms
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-white">
                          {c.errorRatePct.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-white">
                          {c.recordsToday.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <SignalBadge
                            type={c.status === 'healthy' ? 'healthy' : 'caution'}
                            label={c.status.toUpperCase()}
                            size="sm"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => triggerConnectorBackfill(c.id)}
                            disabled={c.isBackfilling}
                            className="px-2 py-1 bg-[#123149] hover:bg-[#184263] text-[#38BDF8] text-[11px] font-semibold rounded border border-[#1E445C] disabled:opacity-50"
                          >
                            {c.isBackfilling ? 'Backfilling...' : 'Trigger Backfill'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Screen 2: DATA QUALITY INBOX (Side-by-side Raw vs Cleaned) */}
          {activeAnalystTab === 'quality' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#123149] pb-2">
                <div>
                  <h2 className="font-mono text-base font-bold text-white uppercase">
                    Data Quality Anomaly Triage
                  </h2>
                  <p className="text-xs text-[#8DA8BA]">
                    Raw telemetry vs rule-proposed values. Side-by-side reconciliation with mandatory audit logging.
                  </p>
                </div>
                <ProvenancePopover />
              </div>

              {anomalyResolvedFeedback && (
                <div className="p-3 bg-[#08261A] border border-[#4ED39A] text-xs text-[#4ED39A] rounded-[2px] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{anomalyResolvedFeedback}</span>
                </div>
              )}

              <div className="space-y-3">
                {dataAnomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="p-4 bg-[#071B2B] border border-[#123149] rounded-[2px] space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <SignalBadge
                            type={anom.status === 'unresolved' ? 'hazard' : 'healthy'}
                            label={anom.type.toUpperCase()}
                            size="sm"
                          />
                          <span className="font-mono font-bold text-white text-xs">{anom.entityRef}</span>
                        </div>
                        <p className="text-xs text-[#F5B93A]">{anom.differenceSummary}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                          anom.status === 'unresolved'
                            ? 'bg-[#290C1B] text-[#FF6FA8]'
                            : 'bg-[#08261A] text-[#4ED39A]'
                        }`}
                      >
                        {anom.status}
                      </span>
                    </div>

                    {/* Side by side: Raw vs Cleaned */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-[#05141F] border border-[#290C1B] rounded-[2px] space-y-1">
                        <span className="text-[10px] text-[#FF6FA8] font-bold uppercase block">
                          RAW INGEST RECORD
                        </span>
                        <p className="text-[#DCECF5] text-xs leading-relaxed">{anom.rawValue}</p>
                      </div>

                      <div className="p-3 bg-[#05141F] border border-[#08261A] rounded-[2px] space-y-1">
                        <span className="text-[10px] text-[#4ED39A] font-bold uppercase block">
                          PROPOSED RULE CLEANSE
                        </span>
                        <p className="text-[#DCECF5] text-xs leading-relaxed">{anom.proposedCleanValue}</p>
                      </div>
                    </div>

                    {anom.status === 'unresolved' && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#123149]">
                        <input
                          type="text"
                          value={selectedAnomaly?.id === anom.id ? overrideNote : ''}
                          onChange={(e) => {
                            setSelectedAnomaly(anom);
                            setOverrideNote(e.target.value);
                          }}
                          placeholder="Mandatory rationale for override or approval..."
                          className="flex-1 p-1.5 text-xs bg-[#05141F] border border-[#123149] rounded text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnomaly(anom);
                            handleResolveAnomaly('resolved_rule');
                          }}
                          className="px-3 py-1.5 bg-[#1B7F57] hover:bg-[#12583C] text-white text-xs font-semibold rounded"
                        >
                          Apply Rule Cleansing
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnomaly(anom);
                            handleResolveAnomaly('resolved_override');
                          }}
                          className="px-3 py-1.5 bg-[#B26A00] hover:bg-[#854F00] text-white text-xs font-semibold rounded"
                        >
                          Manual Analyst Override
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen 3: METHODOLOGY STUDIO */}
          {activeAnalystTab === 'methodology' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#123149] pb-2">
                <div>
                  <h2 className="font-mono text-base font-bold text-white uppercase">
                    Methodology Studio: Blue Sustainability Index (BSI)
                  </h2>
                  <p className="text-xs text-[#8DA8BA]">
                    Versioned indicator formulas, weights, and thresholds. Publishing requires 2nd analyst approval.
                  </p>
                </div>
                <ProvenancePopover />
              </div>

              <div className="space-y-3">
                {methodologyIndicators.map((ind) => (
                  <div
                    key={ind.id}
                    className="p-4 bg-[#071B2B] border border-[#123149] rounded-[2px] space-y-2 text-xs font-mono"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-[#38BDF8] font-bold block">{ind.code} &bull; {ind.dimension.toUpperCase()}</span>
                        <h4 className="font-bold text-white text-sm">{ind.name}</h4>
                        <p className="text-[11px] text-[#5D798B] mt-0.5 font-mono">{ind.formula}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-white">{ind.weightPct}% Weight</span>
                        <span
                          className={`block text-[10px] uppercase font-bold mt-0.5 ${
                            ind.status === 'published' ? 'text-[#4ED39A]' : 'text-[#F5B93A]'
                          }`}
                        >
                          {ind.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {ind.status === 'draft_pending_second_review' ? (
                      <div className="p-2.5 bg-[#281B05] border border-[#F5B93A] rounded flex justify-between items-center text-xs">
                        <span className="text-[#F5B93A]">
                          Draft revision pending second analyst confirmation.
                        </span>
                        <button
                          type="button"
                          onClick={() => secondAnalystApproveMethodology(ind.id)}
                          className="px-3 py-1 bg-[#4ED39A] text-black font-bold rounded"
                        >
                          Simulate Peer Review & Publish
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-[#123149] text-[11px]">
                        <span className="text-[#5D798B]">
                          Warning Threshold: {ind.thresholdWarning} &bull; Effective: {ind.effectiveDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => proposeMethodologyUpdate(ind.id, ind.weightPct + 5, ind.thresholdWarning + 0.05)}
                          className="text-[#38BDF8] hover:underline"
                        >
                          Propose Weight Revision &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen 4: MODEL REGISTRY */}
          {activeAnalystTab === 'models' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-[#123149] pb-2">
                <h2 className="font-mono text-base font-bold text-white uppercase">
                  Marine ML Model Registry & Drift Monitor
                </h2>
                <p className="text-xs text-[#8DA8BA]">
                  Oceanic PFZ thermal front classifier, stock biomass curve, and coastal anomaly detector.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {modelRegistry.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-4 bg-[#071B2B] border border-[#123149] rounded-[2px] space-y-2 text-xs font-mono flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-[#38BDF8] font-bold">{mod.version}</span>
                        <SignalBadge type="healthy" label="ONLINE" size="sm" />
                      </div>
                      <h4 className="font-bold text-white text-xs">{mod.name}</h4>
                      <p className="text-[11px] text-[#5D798B] mt-1">{mod.task}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#123149]">
                      <div className="flex justify-between">
                        <span className="text-[#8DA8BA]">Accuracy:</span>
                        <span className="text-white font-bold">{mod.accuracyPct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8DA8BA]">Drift Metric (PSI):</span>
                        <span className="text-[#4ED39A] font-bold">{mod.driftMetric}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#5D798B]">
                        <span>Trained: {mod.lastTrained}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => rollbackModel(mod.id, 'v1.0.0-lts')}
                        className="w-full mt-2 py-1 bg-[#123149] hover:bg-[#184263] text-[#F5B93A] font-bold text-[11px] rounded"
                      >
                        Rollback to LTS Baseline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen 5: ACCESS CONTROL */}
          {activeAnalystTab === 'access' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-[#123149] pb-2">
                <h2 className="font-mono text-base font-bold text-white uppercase">
                  Observatory Access Control & Token Governance
                </h2>
                <p className="text-xs text-[#8DA8BA]">
                  Active sessions, RBAC role scopes, MFA status, and force revocation.
                </p>
              </div>

              <div className="bg-[#071B2B] border border-[#123149] rounded-[2px] overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-[#0B2438] text-[#5D798B] text-[11px] border-b border-[#123149]">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Identity</th>
                      <th className="py-2.5 px-3 text-left">Role</th>
                      <th className="py-2.5 px-3 text-left">Jurisdiction</th>
                      <th className="py-2.5 px-3 text-center">MFA</th>
                      <th className="py-2.5 px-3 text-left">Last Active</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123149]">
                    {userAccounts.map((u) => (
                      <tr key={u.id} className="hover:bg-[#0B2438]/80">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {u.name}
                          <span className="block text-[10px] text-[#5D798B]">{u.emailOrPhone}</span>
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[#38BDF8] font-bold">{u.role}</td>
                        <td className="py-2.5 px-3 text-[#8DA8BA]">{u.jurisdiction}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[#4ED39A] font-bold">Enabled</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#5D798B]">{u.lastActive}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => forceSignOutUser(u.id)}
                            className="px-2 py-0.5 bg-[#290C1B] hover:bg-[#46142E] text-[#FF6FA8] font-semibold text-[11px] rounded"
                          >
                            Force Sign-out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Screen 6: AUDIT LOG */}
          {activeAnalystTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#123149] pb-2">
                <div>
                  <h2 className="font-mono text-base font-bold text-white uppercase">
                    Append-Only Immutable Audit Log
                  </h2>
                  <p className="text-xs text-[#8DA8BA]">
                    Complete state-changing event ledger across all roles, resources, and decisions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const csv = auditLog.map((l) => Object.values(l).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tidemark-immutable-audit-log.csv';
                    a.click();
                  }}
                  className="px-3 py-1 bg-[#123149] hover:bg-[#184263] text-xs font-semibold text-[#38BDF8] rounded flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Ledger
                </button>
              </div>

              <div className="bg-[#071B2B] border border-[#123149] rounded-[2px] divide-y divide-[#123149] font-mono text-xs">
                {auditLog.map((log) => (
                  <div key={log.id} className="p-3 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#38BDF8] font-bold">{log.action}</span>
                      <span className="text-[#5D798B]">{log.timestamp}</span>
                    </div>
                    <p className="text-white text-xs">{log.rationale}</p>
                    {log.diffSummary && (
                      <p className="text-[#F5B93A] text-[11px]">Diff: {log.diffSummary}</p>
                    )}
                    <div className="flex justify-between text-[10px] text-[#5D798B] pt-0.5">
                      <span>Actor: {log.actorEmail} ({log.actorRole})</span>
                      <span>Target: {log.entityType} #{log.entityId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screen 7: RULES & THRESHOLDS */}
          {activeAnalystTab === 'rules' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-[#123149] pb-2">
                <h2 className="font-mono text-base font-bold text-white uppercase">
                  Alert Rules & Warning Thresholds
                </h2>
                <p className="text-xs text-[#8DA8BA]">
                  Operational safety limits for automated marine advisories.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-[#071B2B] border border-[#123149] rounded-[2px] space-y-2">
                  <span className="font-bold text-[#FF6FA8] uppercase block">
                    RULE-WAVE-01: Severe Wave Height Alert
                  </span>
                  <p className="text-[#DCECF5]">
                    Trigger "Stay Ashore" advisory when significant wave height exceeds <strong>2.50 meters</strong> or breaker period &gt; 14 seconds.
                  </p>
                  <span className="text-[10px] text-[#5D798B] block">Applies to: All artisanal & motorised fibre boats</span>
                </div>

                <div className="p-3.5 bg-[#071B2B] border border-[#123149] rounded-[2px] space-y-2">
                  <span className="font-bold text-[#F5B93A] uppercase block">
                    RULE-GEOFENCE-02: Sanctuary Buffer Violation
                  </span>
                  <p className="text-[#DCECF5]">
                    Trigger Coast Guard patrol alert when any commercial hull enters the <strong>Gulf of Mannar No-Take Sanctuary</strong> buffer.
                  </p>
                  <span className="text-[10px] text-[#5D798B] block">Response SLA: 15-minute dispatch</span>
                </div>
              </div>
            </div>
          )}

          {/* Screen 8: TIDEMARK ASSISTANT */}
          {activeAnalystTab === 'assistant' && (
            <div className="space-y-4 animate-in fade-in duration-150 h-full flex flex-col">
              <div className="border-b border-[#123149] pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#38BDF8]" />
                  <h2 className="font-mono text-base font-bold text-white uppercase">
                    Tidemark Marine Intelligence Assistant
                  </h2>
                </div>
                <p className="text-xs text-[#8DA8BA]">
                  Plain-language queries over coastal telemetry, stock biomass, and economic indicators. Inline provenance grounded.
                </p>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 min-h-[350px] max-h-[480px] overflow-y-auto bg-[#071B2B] border border-[#123149] rounded-[2px] p-4 space-y-3 font-mono text-xs">
                {assistantMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-[2px] space-y-1.5 ${
                      msg.role === 'assistant'
                        ? 'bg-[#0B2438] border-l-2 border-[#38BDF8] text-[#DCECF5]'
                        : 'bg-[#123149] text-white ml-8'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75">
                      <span className="uppercase font-bold">
                        {msg.role === 'assistant' ? 'Tidemark Observatory Agent' : 'Analyst'}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.provenance && (
                      <div className="text-[10px] text-[#38BDF8] pt-1 border-t border-[#123149]">
                        Provenance: {msg.provenance}
                      </div>
                    )}
                  </div>
                ))}

                {isAssistantLoading && (
                  <div className="p-3 bg-[#0B2438] border-l-2 border-[#38BDF8] text-xs text-[#38BDF8] flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                    Querying cross-pipeline telemetry graph and ICAR-CMFRI stock registers...
                  </div>
                )}
              </div>

              {/* Query Input */}
              <form onSubmit={handleAssistantSubmit} className="flex gap-2 font-mono">
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ask any question... (e.g. 'What is the sardine biomass status?', 'Any active geofence breaches?')"
                  className="flex-1 p-2.5 text-xs bg-[#071B2B] border border-[#123149] rounded-[2px] text-white focus:outline-none focus:border-[#38BDF8]"
                />
                <button
                  type="submit"
                  disabled={isAssistantLoading || !assistantInput.trim()}
                  className="px-4 py-2.5 bg-[#38BDF8] text-[#05141F] font-bold text-xs rounded-[2px] hover:bg-[#60A5FA] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Query Dataset
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
