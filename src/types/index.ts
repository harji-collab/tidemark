export type Role = 'user' | 'official' | 'analyst';

export type District =
  | 'Chennai'
  | 'Cuddalore'
  | 'Nagapattinam'
  | 'Ramanathapuram'
  | 'Thoothukudi'
  | 'Kanniyakumari';

export type JurisdictionScope = District | 'all';

export type SeaStateVerdict = 'go' | 'caution' | 'stay_ashore';

export interface ProvenanceMeta {
  source: string;
  lastUpdated: string;
  qualityScore: number; // 0 - 100
  slaStatus: 'fresh' | 'stale' | 'critical';
}

export interface Harbour {
  id: string;
  name: string;
  district: District;
  coordinates: [number, number]; // [lat, lng]
  seaStateVerdict: SeaStateVerdict;
  verdictReason: string;
  waveHeightM: number;
  windKnots: number;
  sstCelsius: number;
  activeAlertsCount: number;
  pfzBearingKm: string;
  depthMeters: number;
  provenance: ProvenanceMeta;
}

export type VesselCompliance =
  | 'compliant'
  | 'geofence_breach'
  | 'transponder_gap'
  | 'closed_season_suspect';

export interface Vessel {
  id: string;
  name: string;
  registrationNo: string;
  type: 'Mechanised Trawler' | 'Motorised Fibre Boat' | 'Traditional Catamaran' | 'Deep-Sea Longliner';
  district: District;
  homeHarbourId: string;
  coordinates: [number, number];
  headingDegrees: number;
  speedKnots: number;
  complianceStatus: VesselCompliance;
  lastSeenMinutesAgo: number;
  trail: [number, number][];
  ownerName: string;
  crewCount: number;
}

export type Species =
  | 'Oil sardine'
  | 'Indian mackerel'
  | 'Yellowfin tuna'
  | 'Seer fish (King seer)'
  | 'Anchovy'
  | 'Silver pomfret'
  | 'Farmed vannamei shrimp';

export interface Landing {
  id: string;
  date: string;
  harbourId: string;
  district: District;
  species: Species;
  weightKg: number;
  pricePerKg: number;
  vesselRegNo: string;
  boatType: string;
  auditStatus: 'verified' | 'flagged' | 'manual_override';
  qualityScore: number;
  provenance: ProvenanceMeta;
}

export interface StockAssessment {
  species: Species;
  scientificName: string;
  bCurrentVsBmsy: number; // biomass ratio: >1.0 healthy, <0.8 overfished
  fCurrentVsFmsy: number; // fishing mortality ratio: <1.0 safe, >1.0 overfishing
  status: 'sustainable' | 'overfished' | 'depleted' | 'rebuilding';
  annualQuotaTons: number;
  consumedTons: number;
  recommendedClosureWindow: string;
  provenance: ProvenanceMeta;
}

export interface Licence {
  id: string;
  applicantName: string;
  applicantPhone: string;
  vesselName: string;
  regNo: string;
  district: District;
  type: 'marine_fishing' | 'aquaculture_shrimp' | 'coastal_crz_clearance';
  submittedDate: string;
  slaRemainingHours: number;
  status: 'pending_review' | 'approved' | 'returned' | 'rejected';
  reasonNote?: string;
  documents: { name: string; size: string; status: 'verified' | 'pending' }[];
  subsidyEligible?: boolean;
  subsidyAmountInr?: number;
}

export interface EnforcementCase {
  id: string;
  title: string;
  type: 'geofence_breach' | 'transponder_gap' | 'closed_season_activity' | 'spill_signature';
  vesselId: string;
  vesselRegNo: string;
  district: District;
  harbourId: string;
  detectedAt: string;
  severity: 'hazard' | 'caution';
  status: 'open' | 'assigned' | 'investigating' | 'resolved';
  assignedPatrolUnit?: string;
  locationDesc: string;
  notes: string[];
}

export interface IncidentReport {
  id: string;
  category: 'illegal_fishing' | 'pollution' | 'stranded_marine_life';
  locationName: string;
  coordinates: [number, number];
  description: string;
  photoPlaceholder?: string;
  reportedAt: string;
  status: 'received' | 'triaged' | 'patrol_dispatched' | 'closed';
  reporterPhone: string;
  reporterRole: Role;
}

export interface Connector {
  id: string;
  name: string;
  category: 'Satellite' | 'Vessel Telemetry' | 'Harbour Logbooks' | 'Market Feed' | 'Government GVA' | 'Port Throughput';
  freshnessSeconds: number;
  slaMaxSeconds: number;
  latencyMs: number;
  errorRatePct: number;
  lastSuccess: string;
  status: 'healthy' | 'degraded' | 'stale' | 'error';
  recordsToday: number;
  isBackfilling?: boolean;
}

export interface DataAnomaly {
  id: string;
  type: 'outlier_landing' | 'duplicate_vessel_id' | 'stuck_sensor';
  entityRef: string;
  harbourId?: string;
  rawValue: string;
  proposedCleanValue: string;
  differenceSummary: string;
  detectedAt: string;
  status: 'unresolved' | 'resolved_rule' | 'resolved_override';
  resolutionNote?: string;
  provenance: ProvenanceMeta;
}

export interface MethodologyIndicator {
  id: string;
  code: string;
  name: string;
  dimension: 'biological' | 'economic' | 'social' | 'governance';
  formula: string;
  weightPct: number;
  thresholdWarning: number;
  thresholdCritical: number;
  version: string;
  effectiveDate: string;
  status: 'published' | 'draft_pending_second_review';
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  task: string;
  accuracyPct: number;
  driftMetric: number;
  lastTrained: string;
  status: 'active' | 'evaluating' | 'deprecated';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  rationale: string;
  diffSummary?: string;
}

export interface Advisory {
  id: string;
  title: string;
  plainSentence: string;
  harbourIds: string[]; // empty means all
  languages: ('en' | 'ta' | 'hi')[];
  severity: 'hazard' | 'caution' | 'info';
  scheduledAt: string;
  status: 'broadcast' | 'scheduled';
  deliveredCount: number;
}

export interface OfflineCatchEntry {
  localId: string;
  species: Species;
  weightKg: number;
  harbourId: string;
  timestamp: string;
  syncStatus: 'queued_offline' | 'synced';
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  emailOrPhone: string;
  role: Role;
  jurisdiction: JurisdictionScope;
  mfaEnabled: boolean;
  lastActive: string;
  status: 'active' | 'suspended';
  isPublicViewer?: boolean;
}

export type PortalType = 'gateway' | 'community' | 'officials' | 'analyst';

export type CommunityTab =
  | 'today'
  | 'chart'
  | 'catch'
  | 'licences'
  | 'prices'
  | 'incident'
  | 'advisories';

export type OfficialTab =
  | 'command'
  | 'approvals'
  | 'enforcement'
  | 'stocks'
  | 'economics'
  | 'broadcaster'
  | 'audit';

export type AnalystTab =
  | 'pipeline'
  | 'quality'
  | 'methodology'
  | 'models'
  | 'access'
  | 'audit'
  | 'rules'
  | 'assistant';

export type PortalTab = CommunityTab | OfficialTab | AnalystTab;

export interface NavigationTarget {
  portal: PortalType;
  view?: string;
  jurisdiction?: JurisdictionScope;
  harbourId?: string;
  entityId?: string;
}

export interface NavigationStateRecord {
  target: NavigationTarget;
  timestamp: number;
}

