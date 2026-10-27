import {
  PortalType,
  CommunityTab,
  OfficialTab,
  AnalystTab,
  NavigationTarget,
  JurisdictionScope,
} from '../types';

export const VALID_PORTALS: PortalType[] = ['gateway', 'community', 'officials', 'analyst'];

export const VALID_COMMUNITY_TABS: CommunityTab[] = [
  'today',
  'chart',
  'catch',
  'licences',
  'prices',
  'incident',
  'advisories',
];

export const VALID_OFFICIAL_TABS: OfficialTab[] = [
  'command',
  'approvals',
  'enforcement',
  'stocks',
  'economics',
  'broadcaster',
  'audit',
];

export const VALID_ANALYST_TABS: AnalystTab[] = [
  'pipeline',
  'quality',
  'methodology',
  'models',
  'access',
  'audit',
  'rules',
  'assistant',
];

export function isValidPortal(portal: string): portal is PortalType {
  return VALID_PORTALS.includes(portal as PortalType);
}

export function isValidTab(portal: PortalType, tab?: string): boolean {
  if (!tab) return true;
  if (portal === 'community') return VALID_COMMUNITY_TABS.includes(tab as CommunityTab);
  if (portal === 'officials') return VALID_OFFICIAL_TABS.includes(tab as OfficialTab);
  if (portal === 'analyst') return VALID_ANALYST_TABS.includes(tab as AnalystTab);
  return false;
}

export function getDefaultTab(portal: PortalType): string | undefined {
  if (portal === 'community') return 'today';
  if (portal === 'officials') return 'command';
  if (portal === 'analyst') return 'pipeline';
  return undefined;
}

/**
 * Parses a window.location.hash or hash query string into a structured NavigationTarget.
 * Supports both query-style (#portal=officials&view=approvals)
 * and path-style (#officials/approvals?jurisdiction=Thoothukudi)
 */
export function parseNavigationHash(hash: string): NavigationTarget {
  const cleanHash = (hash || '').replace(/^#\/?/, '').trim();

  if (!cleanHash || cleanHash === 'gateway') {
    return { portal: 'gateway' };
  }

  // Check for path-style hash first (e.g. "officials/approvals?scope=Chennai")
  if (cleanHash.includes('/') || (!cleanHash.includes('=') && !cleanHash.includes('&'))) {
    const [pathPart, queryPart] = cleanHash.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const portalCandidate = segments[0] as PortalType;

    const portal = isValidPortal(portalCandidate) ? portalCandidate : 'gateway';
    let view: string | undefined = segments[1];

    if (!isValidTab(portal, view)) {
      view = getDefaultTab(portal);
    }

    const target: NavigationTarget = { portal };
    if (portal !== 'gateway' && view) {
      target.view = view;
    }

    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const jurisdiction = params.get('jurisdiction') || params.get('scope');
      const harbourId = params.get('harbour') || params.get('harbourId');
      const entityId = params.get('entityId') || params.get('id');

      if (jurisdiction) target.jurisdiction = jurisdiction as JurisdictionScope;
      if (harbourId) target.harbourId = harbourId;
      if (entityId) target.entityId = entityId;
    }

    return target;
  }

  // Key-value query style (e.g. "portal=officials&view=approvals&jurisdiction=Thoothukudi")
  const params = new URLSearchParams(cleanHash);
  const portalParam = params.get('portal');
  const viewParam = params.get('view') || params.get('tab');
  const jurisdictionParam = params.get('jurisdiction') || params.get('scope');
  const harbourParam = params.get('harbour') || params.get('harbourId');
  const entityParam = params.get('entityId') || params.get('id');

  const portal: PortalType = portalParam && isValidPortal(portalParam) ? portalParam : 'gateway';
  let view = viewParam || getDefaultTab(portal);

  if (!isValidTab(portal, view)) {
    view = getDefaultTab(portal);
  }

  const target: NavigationTarget = { portal };
  if (portal !== 'gateway' && view) {
    target.view = view;
  }

  if (jurisdictionParam) target.jurisdiction = jurisdictionParam as JurisdictionScope;
  if (harbourParam) target.harbourId = harbourParam;
  if (entityParam) target.entityId = entityParam;

  return target;
}

/**
 * Serializes a NavigationTarget into a standardized URL hash string.
 * Example: "#portal=officials&view=approvals&jurisdiction=Thoothukudi"
 */
export function serializeNavigationHash(target: NavigationTarget): string {
  if (target.portal === 'gateway') {
    return '#gateway';
  }

  const params = new URLSearchParams();
  params.set('portal', target.portal);

  if (target.view) {
    params.set('view', target.view);
  }
  if (target.jurisdiction && target.jurisdiction !== 'all') {
    params.set('jurisdiction', target.jurisdiction);
  }
  if (target.harbourId) {
    params.set('harbour', target.harbourId);
  }
  if (target.entityId) {
    params.set('id', target.entityId);
  }

  return `#${params.toString()}`;
}
