import { getAppState, saveAppState } from './mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const auditService = {
  async logAction({ userId, userRole, action, entityType, entityId, details, oldData = null, newData = null }) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId || 'anonymous',
      user_role: userRole || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      old_data: oldData,
      new_data: newData,
      created_at: timestamp
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').insert([{
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: String(entityId),
          old_data: oldData,
          new_data: newData
        }])
      } catch (err) {
        console.warn('Supabase audit log error, falling back to local:', err)
      }
    }

    // Always maintain in local app state for reliable auditing display
    const state = getAppState()
    state.audit_logs = [logEntry, ...(state.audit_logs || [])]
    saveAppState(state)

    return logEntry
  },

  async getAuditLogs(limit = 50) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)
        if (!error && data && data.length > 0) return data
      } catch (err) {
        console.warn('Using local audit logs:', err)
      }
    }

    const state = getAppState()
    return (state.audit_logs || []).slice(0, limit)
  }
}
