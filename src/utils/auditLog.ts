/**
 * Audit Logging Utility
 * Provides structured logging for security-sensitive actions
 */

import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'oauth.initiate'
  | 'oauth.callback'
  | 'oauth.success'
  | 'oauth.failure'
  | 'connection.create'
  | 'connection.delete'
  | 'profile.update'
  | 'team.invite'
  | 'team.remove'
  | 'settings.update'
  | 'login.success'
  | 'login.failure'
  | 'logout';

export interface AuditLogEntry {
  action: AuditAction;
  actor_id?: string;
  organization_id?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an audit event to the audit_logs table
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      action: entry.action,
      actor_id: entry.actor_id,
      organization_id: entry.organization_id,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      metadata: entry.metadata,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
    });

    if (error) {
      console.error('[AuditLog] Failed to write audit log:', error);
    }
  } catch (err) {
    // Don't throw - audit logging should never break the main flow
    console.error('[AuditLog] Error writing audit log:', err);
  }
}

/**
 * Create a structured log object for console/server logging
 */
export function createStructuredLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {}
): string {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  return JSON.stringify(log);
}

/**
 * Log to console with structured format
 */
export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(createStructuredLog('info', message, context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(createStructuredLog('warn', message, context));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(createStructuredLog('error', message, context));
  },
};
