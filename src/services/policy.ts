import { Role } from '../types';

export type Resource =
  | 'sea_state'
  | 'catch_log'
  | 'licence_application'
  | 'licence_decision'
  | 'enforcement_case'
  | 'stock_closure'
  | 'advisory_broadcast'
  | 'economic_export'
  | 'pipeline_connector'
  | 'anomaly_override'
  | 'methodology_rule'
  | 'model_registry'
  | 'access_control'
  | 'audit_log';

export type Action = 'read' | 'create' | 'update' | 'approve' | 'override' | 'admin';

export interface PolicyRule {
  role: Role;
  resource: Resource;
  allowedActions: Action[];
}

export const POLICY_RULES: PolicyRule[] = [
  // User (Community Portal)
  { role: 'user', resource: 'sea_state', allowedActions: ['read'] },
  { role: 'user', resource: 'catch_log', allowedActions: ['read', 'create'] },
  { role: 'user', resource: 'licence_application', allowedActions: ['read', 'create'] },
  { role: 'user', resource: 'enforcement_case', allowedActions: ['create'] }, // incident reports
  { role: 'user', resource: 'stock_closure', allowedActions: ['read'] },

  // Official (Officials Portal)
  { role: 'official', resource: 'sea_state', allowedActions: ['read'] },
  { role: 'official', resource: 'catch_log', allowedActions: ['read'] },
  { role: 'official', resource: 'licence_application', allowedActions: ['read'] },
  { role: 'official', resource: 'licence_decision', allowedActions: ['read', 'approve', 'update'] },
  { role: 'official', resource: 'enforcement_case', allowedActions: ['read', 'create', 'update'] },
  { role: 'official', resource: 'stock_closure', allowedActions: ['read', 'create', 'update'] },
  { role: 'official', resource: 'advisory_broadcast', allowedActions: ['read', 'create'] },
  { role: 'official', resource: 'economic_export', allowedActions: ['read', 'admin'] },
  { role: 'official', resource: 'audit_log', allowedActions: ['read'] },

  // Analyst (Analyst Console)
  { role: 'analyst', resource: 'sea_state', allowedActions: ['read', 'update'] },
  { role: 'analyst', resource: 'pipeline_connector', allowedActions: ['read', 'update', 'admin'] },
  { role: 'analyst', resource: 'anomaly_override', allowedActions: ['read', 'override'] },
  { role: 'analyst', resource: 'methodology_rule', allowedActions: ['read', 'update', 'approve', 'admin'] },
  { role: 'analyst', resource: 'model_registry', allowedActions: ['read', 'update', 'admin'] },
  { role: 'analyst', resource: 'access_control', allowedActions: ['read', 'update', 'admin'] },
  { role: 'analyst', resource: 'audit_log', allowedActions: ['read', 'admin'] },
];

/**
 * Checks if a given role is allowed to perform action on resource
 */
export function isPermitted(role: Role | null, resource: Resource, action: Action): boolean {
  if (!role) {
    // Unauthenticated public can only read sea_state and stock_closure
    return (resource === 'sea_state' || resource === 'stock_closure') && action === 'read';
  }

  const matchingRule = POLICY_RULES.find(
    (rule) => rule.role === role && rule.resource === resource
  );
  if (!matchingRule) return false;

  return matchingRule.allowedActions.includes(action) || matchingRule.allowedActions.includes('admin');
}

/**
 * Route guard checker
 */
export function canAccessPortal(role: Role | null, portal: 'community' | 'officials' | 'analyst'): boolean {
  if (portal === 'community') {
    // Both logged in users and unauthenticated public viewers can view community
    return true;
  }
  if (portal === 'officials') {
    return role === 'official';
  }
  if (portal === 'analyst') {
    return role === 'analyst';
  }
  return false;
}
