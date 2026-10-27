import test from 'node:test';
import assert from 'node:assert/strict';
import { useAppStore } from './store';

test('Navigation State Manager initializes at gateway portal', () => {
  const store = useAppStore.getState();
  assert.equal(store.currentRole, null);
  assert.equal(store.currentPortal, 'gateway');
  assert.deepEqual(store.currentNavTarget, { portal: 'gateway' });
});

test('Navigation State Manager switches to Community portal features', () => {
  useAppStore.getState().navigate({ portal: 'community', view: 'chart', harbourId: 'kasimedu' });
  const store = useAppStore.getState();

  assert.equal(store.currentRole, 'user');
  assert.equal(store.currentPortal, 'community');
  assert.equal(store.activeCommunityTab, 'chart');
  assert.equal(store.selectedHarbourId, 'kasimedu');
  assert.equal(store.currentNavTarget.portal, 'community');
  assert.equal(store.currentNavTarget.view, 'chart');
});

test('Navigation State Manager switches to Officials portal features with jurisdiction scope', () => {
  useAppStore.getState().navigate({
    portal: 'officials',
    view: 'approvals',
    jurisdiction: 'Thoothukudi',
  });
  const store = useAppStore.getState();

  assert.equal(store.currentRole, 'official');
  assert.equal(store.currentPortal, 'officials');
  assert.equal(store.activeOfficialTab, 'approvals');
  assert.equal(store.selectedJurisdiction, 'Thoothukudi');
  assert.equal(store.currentNavTarget.portal, 'officials');
  assert.equal(store.currentNavTarget.view, 'approvals');
  assert.equal(store.currentNavTarget.jurisdiction, 'Thoothukudi');
});

test('Navigation State Manager parses shorthand hash string navigation', () => {
  useAppStore.getState().navigate('#portal=analyst&view=methodology');
  const store = useAppStore.getState();

  assert.equal(store.currentRole, 'analyst');
  assert.equal(store.currentPortal, 'analyst');
  assert.equal(store.activeAnalystTab, 'methodology');
  assert.equal(store.currentNavTarget.portal, 'analyst');
  assert.equal(store.currentNavTarget.view, 'methodology');
});

test('Deep link URL generation outputs hash parameters without URL path routing', () => {
  useAppStore.getState().navigate({
    portal: 'officials',
    view: 'enforcement',
    jurisdiction: 'Kanniyakumari',
  });
  const deepLink = useAppStore.getState().getDeepLinkUrl();

  assert.ok(deepLink.includes('#portal=officials'));
  assert.ok(deepLink.includes('view=enforcement'));
  assert.ok(deepLink.includes('jurisdiction=Kanniyakumari'));
  // Verifying no HTML5 path routing is injected
  assert.ok(!deepLink.includes('/officials/enforcement'));
});

test('Legacy portal tab setters trigger unified navigation', () => {
  useAppStore.getState().setOfficialTab('stocks');
  const store = useAppStore.getState();

  assert.equal(store.activeOfficialTab, 'stocks');
  assert.equal(store.currentNavTarget.view, 'stocks');
});

test('Navigation State Manager handles gateway return and session sign out', () => {
  useAppStore.getState().navigate({ portal: 'gateway' });
  const store = useAppStore.getState();

  assert.equal(store.currentRole, null);
  assert.equal(store.currentPortal, 'gateway');
  assert.equal(store.currentNavTarget.portal, 'gateway');
});

test('Authentication: Community sign-in records user and logs audit event', () => {
  const customFisher = {
    id: 'usr-custom-1',
    name: 'M. Arumugam',
    emailOrPhone: '+91 98841 55667',
    role: 'user' as const,
    jurisdiction: 'Nagapattinam' as const,
    mfaEnabled: true,
    lastActive: 'Just now',
    status: 'active' as const,
  };
  useAppStore.getState().signInAs('user', customFisher);
  const store = useAppStore.getState();

  assert.equal(store.currentRole, 'user');
  assert.equal(store.currentUser?.name, 'M. Arumugam');
  assert.equal(store.currentUser?.emailOrPhone, '+91 98841 55667');
  assert.ok(store.auditLog.some((e) => e.action === 'USER_SIGN_IN' && e.actorRole === 'user'));
});

test('Authentication: Public viewer sign-in provides read-only guest status', () => {
  useAppStore.getState().signInAsPublicViewer();
  const store = useAppStore.getState();

  assert.equal(store.currentRole, 'user');
  assert.equal(store.currentUser?.isPublicViewer, true);
  assert.equal(store.currentPortal, 'community');
});

test('Authentication: Officials sign-in preserves district jurisdiction', () => {
  const revathiOfficial = {
    id: 'usr-3',
    name: 'S. Revathi, Joint Director (Thoothukudi)',
    emailOrPhone: 'jd.thoothukudi@tnfisheries.gov.in',
    role: 'official' as const,
    jurisdiction: 'Thoothukudi' as const,
    mfaEnabled: true,
    lastActive: 'Just now',
    status: 'active' as const,
  };
  useAppStore.getState().signInAs('official', revathiOfficial);
  const store = useAppStore.getState();

  assert.equal(store.currentRole, 'official');
  assert.equal(store.selectedJurisdiction, 'Thoothukudi');
  assert.equal(store.currentUser?.name, 'S. Revathi, Joint Director (Thoothukudi)');
});

test('Authentication: Analyst Console lock and unlock protocol', () => {
  useAppStore.getState().signInAs('analyst');
  let store = useAppStore.getState();
  assert.equal(store.currentRole, 'analyst');
  assert.equal(store.isAnalystLocked, false);
  assert.equal(store.analystIdleSecondsRemaining, 900);

  // Trigger manual lock
  useAppStore.getState().lockAnalystConsole();
  store = useAppStore.getState();
  assert.equal(store.isAnalystLocked, true);
  assert.ok(store.auditLog.some((e) => e.action === 'CONSOLE_LOCK'));

  // Unlock with FIDO2 key
  useAppStore.getState().unlockAnalystConsole();
  store = useAppStore.getState();
  assert.equal(store.isAnalystLocked, false);
  assert.equal(store.analystIdleSecondsRemaining, 900);
  assert.ok(store.auditLog.some((e) => e.action === 'CONSOLE_UNLOCK'));
});

test('Authentication: Force sign-out terminates active session', () => {
  const testUser = {
    id: 'usr-target-session',
    name: 'Test Session',
    emailOrPhone: 'session.test@aquagov.gov.in',
    role: 'user' as const,
    jurisdiction: 'all' as const,
    mfaEnabled: false,
    lastActive: 'Now',
    status: 'active' as const,
  };
  useAppStore.getState().signInAs('user', testUser);
  assert.equal(useAppStore.getState().currentUser?.id, 'usr-target-session');

  useAppStore.getState().forceSignOutUser('usr-target-session');
  const store = useAppStore.getState();
  assert.equal(store.currentRole, null);
  assert.equal(store.currentUser, null);
  assert.equal(store.currentPortal, 'gateway');
});
