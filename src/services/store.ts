import { create } from 'zustand';
import {
  Role,
  District,
  JurisdictionScope,
  Harbour,
  Vessel,
  StockAssessment,
  Licence,
  EnforcementCase,
  IncidentReport,
  Connector,
  DataAnomaly,
  MethodologyIndicator,
  ModelMetadata,
  AuditEvent,
  Advisory,
  OfflineCatchEntry,
  UserAccount,
  Species,
  PortalType,
  CommunityTab,
  OfficialTab,
  AnalystTab,
  NavigationTarget,
  NavigationStateRecord,
} from '../types';
import {
  HARBOURS,
  VESSELS,
  STOCK_ASSESSMENTS,
  LICENCES,
  ENFORCEMENT_CASES,
  INCIDENT_REPORTS,
  CONNECTORS,
  DATA_ANOMALIES,
  METHODOLOGY_INDICATORS,
  MODEL_REGISTRY,
  INITIAL_AUDIT_LOG,
  ADVISORIES,
  USER_ACCOUNTS,
} from './mockData';
import { Language } from './i18n';
import { createAuditEvent } from '../utils/observatory';
import { isPermitted } from './policy';
import {
  parseNavigationHash,
  serializeNavigationHash,
  isValidTab,
  getDefaultTab,
} from '../utils/navigation';

export interface AppState {
  // Navigation & Authentication
  currentRole: Role | null;
  currentPortal: PortalType;
  currentNavTarget: NavigationTarget;
  navigationHistory: NavigationStateRecord[];
  currentUser: UserAccount | null;
  language: Language;
  textSize: 'normal' | 'large';
  activeCommunityTab: CommunityTab;
  activeOfficialTab: OfficialTab;
  activeAnalystTab: AnalystTab;
  selectedJurisdiction: JurisdictionScope;
  selectedHarbourId: string;
  isSearchOpen: boolean;
  searchQuery: string;
  analystIdleSecondsRemaining: number;
  isAnalystLocked: boolean;

  // Domain state collections
  harbours: Harbour[];
  vessels: Vessel[];
  stockAssessments: StockAssessment[];
  licences: Licence[];
  enforcementCases: EnforcementCase[];
  incidentReports: IncidentReport[];
  connectors: Connector[];
  dataAnomalies: DataAnomaly[];
  methodologyIndicators: MethodologyIndicator[];
  modelRegistry: ModelMetadata[];
  auditLog: AuditEvent[];
  advisories: Advisory[];
  userAccounts: UserAccount[];
  offlineCatchQueue: OfflineCatchEntry[];

  // Assistant Chat
  assistantMessages: { id: string; role: 'user' | 'assistant'; text: string; provenance?: string }[];
  isAssistantLoading: boolean;

  // Navigation Actions
  navigate: (
    target: NavigationTarget | string,
    options?: { replace?: boolean; autoAuthenticateDemo?: boolean; user?: UserAccount }
  ) => void;
  initSessionNavigation: () => () => void;
  getDeepLinkUrl: (target?: NavigationTarget) => string;
  copyDeepLink: (target?: NavigationTarget) => Promise<boolean>;

  // Authentication & Settings Actions
  signInAs: (role: Role, user?: UserAccount) => void;
  signInAsPublicViewer: () => void;
  signOut: () => void;
  setLanguage: (lang: Language) => void;
  setTextSize: (size: 'normal' | 'large') => void;
  setCommunityTab: (tab: AppState['activeCommunityTab']) => void;
  setOfficialTab: (tab: AppState['activeOfficialTab']) => void;
  setAnalystTab: (tab: AppState['activeAnalystTab']) => void;
  setJurisdiction: (j: JurisdictionScope) => void;
  setSelectedHarbourId: (id: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetAnalystIdleTimer: () => void;
  decrementIdleTimer: () => void;
  lockAnalystConsole: () => void;
  unlockAnalystConsole: () => void;

  // Domain Actions
  triageLicence: (id: string, action: 'approve' | 'return' | 'reject', reason: string) => boolean;
  assignEnforcementUnit: (caseId: string, unitName: string) => void;
  resolveEnforcementCase: (caseId: string, note: string) => void;
  submitIncidentReport: (report: Omit<IncidentReport, 'id' | 'reportedAt' | 'status'>) => void;
  addCatchEntry: (entry: { species: Species; weightKg: number; harbourId: string; notes?: string }, offline?: boolean) => void;
  syncOfflineQueue: () => void;
  triggerConnectorBackfill: (connectorId: string) => void;
  resolveAnomaly: (anomalyId: string, resolutionType: 'resolved_rule' | 'resolved_override', note: string) => void;
  proposeMethodologyUpdate: (indicatorId: string, newWeight: number, newWarning: number) => void;
  secondAnalystApproveMethodology: (indicatorId: string) => void;
  rollbackModel: (modelId: string, targetVersion: string) => void;
  broadcastNewAdvisory: (advisory: Omit<Advisory, 'id' | 'scheduledAt' | 'status' | 'deliveredCount'>) => void;
  askAssistant: (query: string) => Promise<void>;
  forceSignOutUser: (userId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: null,
  currentPortal: 'gateway',
  currentNavTarget: { portal: 'gateway' },
  navigationHistory: [{ target: { portal: 'gateway' }, timestamp: Date.now() }],
  currentUser: null,
  language: 'en',
  textSize: 'normal',
  activeCommunityTab: 'today',
  activeOfficialTab: 'command',
  activeAnalystTab: 'pipeline',
  selectedJurisdiction: 'all',
  selectedHarbourId: 'kasimedu',
  isSearchOpen: false,
  searchQuery: '',
  analystIdleSecondsRemaining: 900, // 15 minutes
  isAnalystLocked: false,

  harbours: HARBOURS,
  vessels: VESSELS,
  stockAssessments: STOCK_ASSESSMENTS,
  licences: LICENCES,
  enforcementCases: ENFORCEMENT_CASES,
  incidentReports: INCIDENT_REPORTS,
  connectors: CONNECTORS,
  dataAnomalies: DATA_ANOMALIES,
  methodologyIndicators: METHODOLOGY_INDICATORS,
  modelRegistry: MODEL_REGISTRY,
  auditLog: INITIAL_AUDIT_LOG,
  advisories: ADVISORIES,
  userAccounts: USER_ACCOUNTS,
  offlineCatchQueue: [
    {
      localId: 'off-1',
      species: 'Indian mackerel',
      weightKg: 280,
      harbourId: 'kasimedu',
      timestamp: '2026-10-25 04:30 IST',
      syncStatus: 'queued_offline',
      notes: 'Logged on outer sea ridge before cellular reconnect',
    },
    {
      localId: 'off-2',
      species: 'Oil sardine',
      weightKg: 540,
      harbourId: 'kasimedu',
      timestamp: '2026-10-25 05:15 IST',
      syncStatus: 'queued_offline',
      notes: 'Seine haul off Ennore coast',
    },
  ],

  assistantMessages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: 'Greetings. I am the Tidemark Marine Intelligence Assistant, grounded directly in the Tamil Nadu coastal telemetry, landings, and stock assessments. Ask me any plain-language inquiry regarding vessel compliance, biomass limits, harbour forecasts, or blue economic indicators.',
      provenance: 'Tidemark Observatory Synthetic Knowledge Base (Oct 2026)',
    },
  ],
  isAssistantLoading: false,

  navigate: (target, options) => {
    const rawTarget: NavigationTarget =
      typeof target === 'string' ? parseNavigationHash(target) : target;
    const {
      currentRole,
      currentUser,
      activeCommunityTab,
      activeOfficialTab,
      activeAnalystTab,
      selectedJurisdiction,
      selectedHarbourId,
      auditLog,
    } = get();

    const targetPortal: PortalType = rawTarget.portal || 'gateway';
    let targetView = rawTarget.view;
    let nextRole: Role | null = currentRole;
    let nextUser: UserAccount | null = options?.user !== undefined ? options.user : currentUser;
    let nextJurisdiction: JurisdictionScope = rawTarget.jurisdiction || selectedJurisdiction;
    const nextHarbourId: string = rawTarget.harbourId || selectedHarbourId;

    if (targetPortal === 'gateway') {
      if (currentUser) {
        const exitAudit = createAuditEvent(
          currentUser.emailOrPhone,
          currentRole || 'user',
          'USER_SIGN_OUT',
          'UserSession',
          currentUser.id,
          'Voluntary sign out by user.'
        );
        set({ auditLog: [exitAudit, ...auditLog] });
      }
      nextRole = null;
      nextUser = null;
      targetView = undefined;
    } else if (targetPortal === 'community') {
      if (!nextUser || nextRole !== 'user') {
        nextRole = 'user';
        nextUser = options?.user || USER_ACCOUNTS[0];
      }
      targetView = isValidTab('community', targetView)
        ? targetView
        : activeCommunityTab || 'today';
    } else if (targetPortal === 'officials') {
      if (!nextUser || nextRole !== 'official') {
        nextRole = 'official';
        nextUser = options?.user || USER_ACCOUNTS[1];
        if (!rawTarget.jurisdiction && nextUser) {
          nextJurisdiction = nextUser.jurisdiction;
        }
      }
      targetView = isValidTab('officials', targetView)
        ? targetView
        : activeOfficialTab || 'command';
    } else if (targetPortal === 'analyst') {
      if (!nextUser || nextRole !== 'analyst') {
        nextRole = 'analyst';
        nextUser = options?.user || USER_ACCOUNTS[3];
      }
      targetView = isValidTab('analyst', targetView)
        ? targetView
        : activeAnalystTab || 'pipeline';
    }

    const normalizedTarget: NavigationTarget = {
      portal: targetPortal,
      ...(targetView ? { view: targetView } : {}),
      ...(targetPortal === 'officials' && nextJurisdiction !== 'all'
        ? { jurisdiction: nextJurisdiction }
        : {}),
      ...(targetPortal === 'community' && nextHarbourId
        ? { harbourId: nextHarbourId }
        : {}),
      ...(rawTarget.entityId ? { entityId: rawTarget.entityId } : {}),
    };

    set((state) => ({
      currentPortal: targetPortal,
      currentRole: nextRole,
      currentUser: nextUser,
      currentNavTarget: normalizedTarget,
      activeCommunityTab:
        targetPortal === 'community' && targetView
          ? (targetView as CommunityTab)
          : state.activeCommunityTab,
      activeOfficialTab:
        targetPortal === 'officials' && targetView
          ? (targetView as OfficialTab)
          : state.activeOfficialTab,
      activeAnalystTab:
        targetPortal === 'analyst' && targetView
          ? (targetView as AnalystTab)
          : state.activeAnalystTab,
      selectedJurisdiction: nextJurisdiction,
      selectedHarbourId: nextHarbourId,
      analystIdleSecondsRemaining: targetPortal === 'analyst' ? 900 : state.analystIdleSecondsRemaining,
      navigationHistory: [
        { target: normalizedTarget, timestamp: Date.now() },
        ...state.navigationHistory.slice(0, 49),
      ],
    }));

    // In-session hash update & storage sync without URL path routing
    if (typeof window !== 'undefined') {
      const hashStr = serializeNavigationHash(normalizedTarget);
      if (window.location.hash !== hashStr) {
        if (options?.replace) {
          window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${window.location.search}${hashStr}`
          );
        } else {
          window.location.hash = hashStr;
        }
      }
      try {
        sessionStorage.setItem('tidemark_session_nav', JSON.stringify(normalizedTarget));
      } catch {
        // ignore
      }
    }
  },

  initSessionNavigation: () => {
    if (typeof window === 'undefined') return () => {};

    // Restore deep-linked route or session
    let initialTarget: NavigationTarget | null = null;
    if (window.location.hash && window.location.hash.length > 1) {
      initialTarget = parseNavigationHash(window.location.hash);
    } else {
      try {
        const stored = sessionStorage.getItem('tidemark_session_nav');
        if (stored) {
          initialTarget = JSON.parse(stored);
        }
      } catch {
        // ignore
      }
    }

    if (initialTarget && initialTarget.portal && initialTarget.portal !== 'gateway') {
      get().navigate(initialTarget, { replace: true, autoAuthenticateDemo: true });
    }

    const handleHashChange = () => {
      const newTarget = parseNavigationHash(window.location.hash);
      const cur = get().currentNavTarget;
      if (
        newTarget.portal !== cur.portal ||
        newTarget.view !== cur.view ||
        newTarget.jurisdiction !== cur.jurisdiction ||
        newTarget.harbourId !== cur.harbourId
      ) {
        get().navigate(newTarget, { replace: true, autoAuthenticateDemo: true });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  },

  getDeepLinkUrl: (target?: NavigationTarget) => {
    const t = target || get().currentNavTarget;
    const hash = serializeNavigationHash(t);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}${hash}`;
    }
    return hash;
  },

  copyDeepLink: async (target?: NavigationTarget) => {
    const url = get().getDeepLinkUrl(target);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  signInAs: (role: Role, user?: UserAccount) => {
    let resolvedUser = user;
    if (!resolvedUser) {
      if (role === 'user') resolvedUser = USER_ACCOUNTS[0];
      else if (role === 'official') resolvedUser = USER_ACCOUNTS[1];
      else if (role === 'analyst') resolvedUser = USER_ACCOUNTS[3];
    }
    const portal: PortalType =
      role === 'user' ? 'community' : role === 'official' ? 'officials' : 'analyst';

    const newAudit = createAuditEvent(
      resolvedUser?.emailOrPhone || 'user@tidemark.gov.in',
      role,
      'USER_SIGN_IN',
      'UserSession',
      resolvedUser?.id || 'session-init',
      `Successful authentication to ${portal} portal${resolvedUser?.isPublicViewer ? ' (Public Viewer Mode)' : ''}.`
    );

    set((state) => ({
      currentRole: role,
      currentUser: resolvedUser,
      selectedJurisdiction: resolvedUser?.jurisdiction || state.selectedJurisdiction,
      auditLog: [newAudit, ...state.auditLog],
      isAnalystLocked: false,
      analystIdleSecondsRemaining: 900,
    }));

    get().navigate(
      {
        portal,
        view: getDefaultTab(portal),
        jurisdiction: resolvedUser?.jurisdiction || 'all',
      },
      { user: resolvedUser }
    );
  },

  signInAsPublicViewer: () => {
    const publicUser: UserAccount = {
      id: 'usr-guest',
      name: 'Public Viewer (Guest)',
      emailOrPhone: 'public.viewer@tidemark.gov.in',
      role: 'user',
      jurisdiction: 'all',
      mfaEnabled: false,
      lastActive: 'Just now',
      status: 'active',
      isPublicViewer: true,
    };
    get().signInAs('user', publicUser);
  },

  signOut: () => {
    set({ isAnalystLocked: false, analystIdleSecondsRemaining: 900 });
    get().navigate({ portal: 'gateway' });
  },

  setLanguage: (lang) => set({ language: lang }),
  setTextSize: (size) => set({ textSize: size }),
  setCommunityTab: (tab) => get().navigate({ portal: 'community', view: tab }),
  setOfficialTab: (tab) => get().navigate({ portal: 'officials', view: tab }),
  setAnalystTab: (tab) => get().navigate({ portal: 'analyst', view: tab }),
  setJurisdiction: (j) => {
    const cur = get().currentNavTarget;
    get().navigate({ ...cur, jurisdiction: j });
  },
  setSelectedHarbourId: (id) => {
    const cur = get().currentNavTarget;
    get().navigate({ ...cur, harbourId: id });
  },
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  resetAnalystIdleTimer: () => set({ analystIdleSecondsRemaining: 900 }),
  lockAnalystConsole: () => {
    const { currentUser, auditLog } = get();
    const lockAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      'CONSOLE_LOCK',
      'UserSession',
      currentUser?.id || 'session-lock',
      'Analyst console locked due to session inactivity (15-min SLA).'
    );
    set({ isAnalystLocked: true, auditLog: [lockAudit, ...auditLog] });
  },
  unlockAnalystConsole: () => {
    const { currentUser, auditLog } = get();
    const unlockAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      'CONSOLE_UNLOCK',
      'UserSession',
      currentUser?.id || 'session-unlock',
      'Analyst console unlocked via hardware security key / master credential verification.'
    );
    set({
      isAnalystLocked: false,
      analystIdleSecondsRemaining: 900,
      auditLog: [unlockAudit, ...auditLog],
    });
  },
  decrementIdleTimer: () => {
    const { analystIdleSecondsRemaining, isAnalystLocked, currentRole } = get();
    if (currentRole !== 'analyst' || isAnalystLocked) return;

    const remaining = analystIdleSecondsRemaining - 1;
    if (remaining <= 0) {
      get().lockAnalystConsole();
    } else {
      set({ analystIdleSecondsRemaining: remaining });
    }
  },

  triageLicence: (id, action, reason) => {
    const { currentRole, currentUser, licences, auditLog } = get();
    if (!isPermitted(currentRole, 'licence_decision', 'approve')) {
      return false;
    }
    const targetStatus = action === 'approve' ? 'approved' : action === 'return' ? 'returned' : 'rejected';
    const updatedLicences = licences.map((lic) =>
      lic.id === id ? { ...lic, status: targetStatus as Licence['status'], reasonNote: reason } : lic
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'official@tnfisheries.gov.in',
      'official',
      `LICENCE_${action.toUpperCase()}`,
      'Licence',
      id,
      reason,
      `Status changed to ${targetStatus}`
    );
    set({
      licences: updatedLicences,
      auditLog: [newAudit, ...auditLog],
    });
    return true;
  },

  assignEnforcementUnit: (caseId, unitName) => {
    const { enforcementCases, currentUser, auditLog } = get();
    const updatedCases = enforcementCases.map((c) =>
      c.id === caseId
        ? {
            ...c,
            status: 'assigned' as const,
            assignedPatrolUnit: unitName,
            notes: [...c.notes, `Assigned to ${unitName} at ${new Date().toLocaleTimeString('en-IN')}`],
          }
        : c
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'official@tnfisheries.gov.in',
      'official',
      'ASSIGN_PATROL_UNIT',
      'EnforcementCase',
      caseId,
      `Assigned intercept responsibility to ${unitName}.`
    );
    set({
      enforcementCases: updatedCases,
      auditLog: [newAudit, ...auditLog],
    });
  },

  resolveEnforcementCase: (caseId, note) => {
    const { enforcementCases, currentUser, auditLog } = get();
    const updatedCases = enforcementCases.map((c) =>
      c.id === caseId
        ? {
            ...c,
            status: 'resolved' as const,
            notes: [...c.notes, `Resolved: ${note} (${new Date().toLocaleTimeString('en-IN')})`],
          }
        : c
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'official@tnfisheries.gov.in',
      'official',
      'RESOLVE_ENFORCEMENT_CASE',
      'EnforcementCase',
      caseId,
      note
    );
    set({
      enforcementCases: updatedCases,
      auditLog: [newAudit, ...auditLog],
    });
  },

  submitIncidentReport: (report) => {
    const { incidentReports, currentUser, currentRole, auditLog } = get();
    const newReport: IncidentReport = {
      ...report,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toLocaleString('en-IN') + ' IST',
      status: 'received',
    };
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || report.reporterPhone,
      currentRole || 'user',
      'SUBMIT_INCIDENT_REPORT',
      'IncidentReport',
      newReport.id,
      `Reported ${report.category} at ${report.locationName}`
    );
    set({
      incidentReports: [newReport, ...incidentReports],
      auditLog: [newAudit, ...auditLog],
    });
  },

  addCatchEntry: (entry, offline = false) => {
    const { offlineCatchQueue } = get();
    const newEntry: OfflineCatchEntry = {
      localId: `cat-${Date.now()}`,
      species: entry.species,
      weightKg: entry.weightKg,
      harbourId: entry.harbourId,
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST',
      syncStatus: offline ? 'queued_offline' : 'synced',
      notes: entry.notes,
    };
    set({ offlineCatchQueue: [newEntry, ...offlineCatchQueue] });
  },

  syncOfflineQueue: () => {
    const { offlineCatchQueue, currentUser, auditLog } = get();
    const synced = offlineCatchQueue.map((item) => ({ ...item, syncStatus: 'synced' as const }));
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'fisher@tidemark.gov.in',
      'user',
      'SYNC_OFFLINE_CATCH_LOGS',
      'OfflineCatchQueue',
      'batch-sync',
      `Synchronized ${offlineCatchQueue.length} offline landing records.`
    );
    set({
      offlineCatchQueue: synced,
      auditLog: [newAudit, ...auditLog],
    });
  },

  triggerConnectorBackfill: (connectorId) => {
    const { connectors, currentUser, auditLog } = get();
    const updated = connectors.map((c) =>
      c.id === connectorId ? { ...c, isBackfilling: true, errorRatePct: 0.0, freshnessSeconds: 0, lastSuccess: 'Just now' } : c
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      'BACKFILL_DATA_CONNECTOR',
      'Connector',
      connectorId,
      'Initiated manual incremental backfill and socket reconnect.'
    );
    set({ connectors: updated, auditLog: [newAudit, ...auditLog] });

    // Clear backfilling flag after 2 seconds
    setTimeout(() => {
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === connectorId ? { ...c, isBackfilling: false } : c
        ),
      }));
    }, 2000);
  },

  resolveAnomaly: (anomalyId, resolutionType, note) => {
    const { dataAnomalies, currentUser, auditLog } = get();
    const updated = dataAnomalies.map((a) =>
      a.id === anomalyId ? { ...a, status: resolutionType, resolutionNote: note } : a
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      resolutionType === 'resolved_override' ? 'ANOMALY_MANUAL_OVERRIDE' : 'ANOMALY_RULE_CLEANSE',
      'DataAnomaly',
      anomalyId,
      note,
      `Status changed to ${resolutionType}`
    );
    set({ dataAnomalies: updated, auditLog: [newAudit, ...auditLog] });
  },

  proposeMethodologyUpdate: (indicatorId, newWeight, newWarning) => {
    const { methodologyIndicators, currentUser, auditLog } = get();
    const updated = methodologyIndicators.map((ind) =>
      ind.id === indicatorId
        ? {
            ...ind,
            weightPct: newWeight,
            thresholdWarning: newWarning,
            status: 'draft_pending_second_review' as const,
          }
        : ind
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      'METHODOLOGY_PROPOSAL_DRAFT',
      'MethodologyIndicator',
      indicatorId,
      `Adjusted weight to ${newWeight}% and warning threshold to ${newWarning}. Requires second analyst approval.`
    );
    set({ methodologyIndicators: updated, auditLog: [newAudit, ...auditLog] });
  },

  secondAnalystApproveMethodology: (indicatorId) => {
    const { methodologyIndicators, auditLog } = get();
    const updated = methodologyIndicators.map((ind) =>
      ind.id === indicatorId ? { ...ind, status: 'published' as const } : ind
    );
    const newAudit = createAuditEvent(
      'peer.analyst@tidemark.gov.in',
      'analyst',
      'METHODOLOGY_PEER_APPROVAL',
      'MethodologyIndicator',
      indicatorId,
      'Second analyst peer review completed. Formula and weights approved for production BSI calculations.'
    );
    set({ methodologyIndicators: updated, auditLog: [newAudit, ...auditLog] });
  },

  rollbackModel: (modelId, targetVersion) => {
    const { modelRegistry, currentUser, auditLog } = get();
    const updated = modelRegistry.map((m) =>
      m.id === modelId ? { ...m, version: targetVersion, driftMetric: 0.015, accuracyPct: 94.1 } : m
    );
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      'MODEL_ROLLBACK',
      'ModelMetadata',
      modelId,
      `Rolled back to verified baseline version ${targetVersion} due to drift check.`
    );
    set({ modelRegistry: updated, auditLog: [newAudit, ...auditLog] });
  },

  broadcastNewAdvisory: (advData) => {
    const { advisories, currentUser, auditLog } = get();
    const newAdvisory: Advisory = {
      ...advData,
      id: `adv-${Date.now()}`,
      scheduledAt: new Date().toLocaleTimeString('en-IN') + ' IST',
      status: 'broadcast',
      deliveredCount: Math.floor(Math.random() * 3000) + 2500,
    };
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'official@tnfisheries.gov.in',
      'official',
      'BROADCAST_ADVISORY',
      'Advisory',
      newAdvisory.id,
      `Broadcasted "${advData.title}" to ${advData.harbourIds.length === 0 ? 'all harbours' : advData.harbourIds.join(', ')} in ${advData.languages.join('/')}.`
    );
    set({ advisories: [newAdvisory, ...advisories], auditLog: [newAudit, ...auditLog] });
  },

  askAssistant: async (query: string) => {
    const { assistantMessages } = get();
    const userMsgId = `usr-${Date.now()}`;
    set({
      assistantMessages: [...assistantMessages, { id: userMsgId, role: 'user', text: query }],
      isAssistantLoading: true,
    });

    // Provide an intelligent analytical response grounded in the Tamil Nadu dataset
    setTimeout(() => {
      let responseText = '';
      let provenanceStr = 'Tidemark In-Memory Knowledge Graph & ICAR-CMFRI Stock Ledger';

      const q = query.toLowerCase();
      if (q.includes('sardine') || q.includes('biomass') || q.includes('stock')) {
        responseText = 'Based on the October 2026 ICAR-CMFRI pelagic assessment, Oil sardine (Sardinella longiceps) is currently in a sustainable state with B/B_msy at 1.14 and F/F_msy at 0.88. The Tamil Nadu annual quota is 142,000 tons, with 98,400 tons (69.3%) consumed to date. In contrast, Silver pomfret is critically depleted (B/B_msy 0.68), warranting an immediate 45-day juvenile protection zone.';
        provenanceStr = 'ICAR-CMFRI Biomass Assessment Report 2026 / NFDB Catch Registry';
      } else if (q.includes('breach') || q.includes('vessel') || q.includes('enforcement') || q.includes('illegal')) {
        responseText = 'Currently, 1 critical geofence breach is active: Vessel IND-TN-11-MM-0872 (Pearl Fisher VI) is located 4.2 nautical miles inside the Gulf of Mannar Marine National Park No-Take Zone (8.92°N, 78.42°E) moving at 7.8 knots. Indian Coast Guard interceptor ICGS Rani Abbakka has been dispatched. Additionally, Samudra Kumari (IND-TN-06-MM-4491) has exhibited an unacknowledged AIS transponder blackout for 142 minutes off Point Calimere.';
        provenanceStr = 'ISRO/Coast Guard AIS Live Telemetry Feed (conn-coastal-ais)';
      } else if (q.includes('wave') || q.includes('weather') || q.includes('kasimedu') || q.includes('colachel') || q.includes('sea')) {
        responseText = 'Ocean state summary across Tamil Nadu: Kasimedu is on Caution (1.9 m swell, 19 kt NE wind). Cuddalore, Nagapattinam, and Rameswaram are all clear for fishing ("Go" status, waves 0.8–1.2 m). Colachel in Kanniyakumari is under a strict "Stay Ashore" advisory due to 2.7 m long-period Arabian Sea breakers and 26 knot gale winds.';
        provenanceStr = 'INCOIS Coastal Wave Rider Buoy Network & IMD Radar Stream';
      } else if (q.includes('bsi') || q.includes('sustainability') || q.includes('index')) {
        responseText = 'The Tamil Nadu Blue Sustainability Index (BSI) currently stands at 78.4 / 100. Biological spawning health contributes 30% weight, Sanctuary compliance 25%, Eco-gear adoption 15%, Fisher household income 15%, and Export GVA 15%. All 5 indicators are operating within acceptable thresholds, though Silver Pomfret biomass and Gulf of Mannar transponder compliance are flagged as warning zones.';
        provenanceStr = 'Methodology Studio Schema v2.4.0 (Tidemark Indicator Engine)';
      } else {
        responseText = `Observatory query analysis: "${query}". All 6 coastal data pipelines (Satellite SST, Vessel AIS, NFDB landings, Port throughput, Wholesale market, and MoSPI GVA) are operational with a mean freshness of 14 minutes. 8 registered vessels are active in state territorial waters with 87.5% compliance. Total blue GVA for Tamil Nadu is estimated at ₹23,640 Crore across Chennai, Cuddalore, Nagapattinam, Ramanathapuram, Thoothukudi, and Kanniyakumari.`;
        provenanceStr = 'Tidemark Cross-Pipeline Aggregator (All Jurisdictions)';
      }

      set((state) => ({
        assistantMessages: [
          ...state.assistantMessages,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            text: responseText,
            provenance: provenanceStr,
          },
        ],
        isAssistantLoading: false,
      }));
    }, 700);
  },

  forceSignOutUser: (userId) => {
    const { userAccounts, currentUser, auditLog } = get();
    const updated = userAccounts.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u));
    const newAudit = createAuditEvent(
      currentUser?.emailOrPhone || 'analyst@tidemark.gov.in',
      'analyst',
      'FORCE_SIGN_OUT_USER',
      'UserAccount',
      userId,
      'Administrative force revocation of user token from Analyst Console.'
    );
    set({ userAccounts: updated, auditLog: [newAudit, ...auditLog] });
    if (currentUser?.id === userId) {
      get().signOut();
    }
  },
}));
