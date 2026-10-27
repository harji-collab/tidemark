import { AuditEvent, Role, SeaStateVerdict, District } from '../types';

/**
 * Calculates Blue Sustainability Index (BSI) from indicator values and weights.
 * Normalized to 0-100 scale.
 */
export function computeBlueSustainabilityIndex(
  indicators: { weightPct: number; currentScore: number }[]
): number {
  if (indicators.length === 0) return 0;
  const totalWeight = indicators.reduce((sum, ind) => sum + ind.weightPct, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = indicators.reduce(
    (sum, ind) => sum + (ind.currentScore * ind.weightPct),
    0
  );
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Determines plain-language sea state verdict based on physical oceanic thresholds.
 * Waves > 2.5m or wind > 25 knots triggers 'stay_ashore'
 * Waves > 1.8m or wind > 18 knots triggers 'caution'
 * Otherwise 'go'
 */
export function determineSeaVerdict(
  waveHeightM: number,
  windKnots: number,
  hasStormAlert: boolean = false
): { verdict: SeaStateVerdict; reason: string } {
  if (hasStormAlert) {
    return {
      verdict: 'stay_ashore',
      reason: 'Stay ashore: tropical depression warning in effect along the coast.',
    };
  }
  if (waveHeightM >= 2.5) {
    return {
      verdict: 'stay_ashore',
      reason: `Stay ashore: wave height at ${waveHeightM} m exceeds safe operation threshold.`,
    };
  }
  if (windKnots >= 25) {
    return {
      verdict: 'stay_ashore',
      reason: `Stay ashore: wind speeds at ${windKnots} knots exceed safe vessel handling limits.`,
    };
  }
  if (waveHeightM >= 1.8 || windKnots >= 18) {
    return {
      verdict: 'caution',
      reason: `Caution: moderate swell of ${waveHeightM} m and gusting wind at ${windKnots} knots.`,
    };
  }
  return {
    verdict: 'go',
    reason: `Go: calm conditions with ${waveHeightM} m swell and gentle breeze at ${windKnots} knots.`,
  };
}

/**
 * Checks SLA deadline status for government approval items
 */
export function getSlaStatus(remainingHours: number): 'fresh' | 'warning' | 'stale' {
  if (remainingHours <= 0) return 'stale';
  if (remainingHours <= 12) return 'warning';
  return 'fresh';
}

/**
 * Formats an immutable audit event
 */
export function createAuditEvent(
  actorEmail: string,
  actorRole: Role,
  action: string,
  entityType: string,
  entityId: string,
  rationale: string,
  diffSummary?: string
): AuditEvent {
  return {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole,
    action,
    entityType,
    entityId,
    rationale,
    diffSummary,
  };
}

/**
 * Formats right-aligned currency in INR
 */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Right-aligned metric formatter with commas
 */
export function formatMetric(val: number, decimals: number = 0): string {
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
