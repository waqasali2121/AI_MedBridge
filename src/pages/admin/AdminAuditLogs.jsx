import React, { useState, useEffect } from 'react'
import { History, Search, ShieldCheck } from 'lucide-react'
import { auditService } from '../../services/auditService'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Badge } from '../../components/common/Badge'

export function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const all = await auditService.getAuditLogs(100)
        setLogs(all)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredLogs = logs.filter(l => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.entity_type && l.entity_type.toLowerCase().includes(term)) ||
      (l.details && l.details.toLowerCase().includes(term)) ||
      (l.user_role && l.user_role.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Immutable Clinical & Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Attributable electronic health logs capturing every upload, transcription verification, clinical approval, and dose reporting event
          </p>
        </div>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Filter audit logs by action, user role, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card className="overflow-x-auto p-0 border-slate-200">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Audit Action</th>
              <th className="p-3.5">Entity / Target</th>
              <th className="p-3.5">Actor / Role</th>
              <th className="p-3.5">Timestamp (UTC)</th>
              <th className="p-3.5">Event Log Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-900">{log.action}</td>
                <td className="p-3.5">
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {log.entity_type} #{String(log.entity_id).slice(0, 12)}
                  </span>
                </td>
                <td className="p-3.5 font-medium capitalize text-slate-700">
                  {log.user_role || log.user_id}
                </td>
                <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-3.5 text-slate-600 max-w-sm truncate">
                  {log.details || 'System recorded event'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
