import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBlueSustainabilityIndex,
  determineSeaVerdict,
  getSlaStatus,
} from './observatory';
import { isPermitted, canAccessPortal } from '../services/policy';

test('determineSeaVerdict accurately classifies harsh, moderate and calm waters', () => {
  const severe = determineSeaVerdict(2.8, 15);
  assert.equal(severe.verdict, 'stay_ashore');
  assert.match(severe.reason, /Stay ashore: wave height at 2.8 m/);

  const gale = determineSeaVerdict(1.2, 28);
  assert.equal(gale.verdict, 'stay_ashore');
  assert.match(gale.reason, /wind speeds at 28 knots/);

  const caution = determineSeaVerdict(2.0, 12);
  assert.equal(caution.verdict, 'caution');

  const calm = determineSeaVerdict(0.9, 10);
  assert.equal(calm.verdict, 'go');
  assert.match(calm.reason, /Go: calm conditions/);
});

test('computeBlueSustainabilityIndex computes weighted composite index', () => {
  const indicators = [
    { weightPct: 40, currentScore: 80 },
    { weightPct: 30, currentScore: 70 },
    { weightPct: 30, currentScore: 90 },
  ];
  // 40*80 + 30*70 + 30*90 = 3200 + 2100 + 2700 = 8000 / 100 = 80
  const bsi = computeBlueSustainabilityIndex(indicators);
  assert.equal(bsi, 80);
});

test('getSlaStatus detects fresh, warning and stale SLA deadlines', () => {
  assert.equal(getSlaStatus(48), 'fresh');
  assert.equal(getSlaStatus(11), 'warning');
  assert.equal(getSlaStatus(0), 'stale');
  assert.equal(getSlaStatus(-2), 'stale');
});

test('RBAC isPermitted strictly bounds roles to permitted actions', () => {
  // Public / unauthenticated
  assert.equal(isPermitted(null, 'sea_state', 'read'), true);
  assert.equal(isPermitted(null, 'licence_decision', 'approve'), false);
  assert.equal(isPermitted(null, 'pipeline_connector', 'admin'), false);

  // User (Fisher / Coastal citizen)
  assert.equal(isPermitted('user', 'catch_log', 'create'), true);
  assert.equal(isPermitted('user', 'licence_application', 'create'), true);
  assert.equal(isPermitted('user', 'licence_decision', 'approve'), false);
  assert.equal(isPermitted('user', 'pipeline_connector', 'read'), false);

  // Official
  assert.equal(isPermitted('official', 'licence_decision', 'approve'), true);
  assert.equal(isPermitted('official', 'stock_closure', 'create'), true);
  assert.equal(isPermitted('official', 'advisory_broadcast', 'create'), true);
  assert.equal(isPermitted('official', 'anomaly_override', 'override'), false);

  // Analyst
  assert.equal(isPermitted('analyst', 'pipeline_connector', 'admin'), true);
  assert.equal(isPermitted('analyst', 'anomaly_override', 'override'), true);
  assert.equal(isPermitted('analyst', 'methodology_rule', 'approve'), true);
  assert.equal(isPermitted('analyst', 'licence_decision', 'approve'), false);
});

test('canAccessPortal guards prevent cross-role portal navigation', () => {
  assert.equal(canAccessPortal('user', 'community'), true);
  assert.equal(canAccessPortal('user', 'officials'), false);
  assert.equal(canAccessPortal('user', 'analyst'), false);

  assert.equal(canAccessPortal('official', 'officials'), true);
  assert.equal(canAccessPortal('official', 'analyst'), false);

  assert.equal(canAccessPortal('analyst', 'analyst'), true);
  assert.equal(canAccessPortal('analyst', 'officials'), false);
});
