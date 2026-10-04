import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Building,
  CheckCircle2,
  FileCheck2,
  History,
  Lock,
  Pill,
  ShieldCheck,
  Store,
  Users
} from 'lucide-react'
import { prescriptionService } from '../../services/prescriptionService'
import { caseService } from '../../services/caseService'
import { pharmacyService } from '../../services/pharmacyService'
import { auditService } from '../../services/auditService'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 3,
    totalPrescriptions: 1,
    pendingReviews: 1,
    approvedPlans: 1,
    openCases: 0,
    pharmacyReservations: 1
  })
  const [recentAudits, setRecentAudits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const rxs = await prescriptionService.getAllPrescriptions()
        const cases = await caseService.getAllCases()
        const reservations = await pharmacyService.getPatientReservations()
        const audits = await auditService.getAuditLogs(8)

        setStats({
          totalPatients: 3,
          totalPrescriptions: rxs.length,
          pendingReviews: rxs.filter(r => r.verification_status !== 'approved').length,
          approvedPlans: rxs.filter(r => r.verification_status === 'approved').length,
          openCases: cases.filter(c => c.status !== 'doctor_resolved').length,
          pharmacyReservations: reservations.length
        })
        setRecentAudits(audits)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-700/80 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-purple-100">
              System Administration
            </span>
            <span className="text-xs text-purple-200">Audit Trail & Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            MedBridge Platform Administrator
          </h1>
          <p className="text-xs text-purple-100 max-w-xl">
            Monitor clinical governance, multi-role tenant security, DRAP medicine catalogue integrity, and immutable audit logs.
          </p>
        </div>

        <Link to="/admin/audit-logs">
          <Button variant="secondary" size="sm" icon={History} className="bg-purple-600 hover:bg-purple-700 text-white">
            Inspect Audit Trail
          </Button>
        </Link>
      </div>

      {/* 6 Required Metric Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-1 border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Patients</span>
          <p className="text-xl font-extrabold text-slate-900">{stats.totalPatients}</p>
        </Card>
        <Card className="p-3.5 space-y-1 border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Prescriptions</span>
          <p className="text-xl font-extrabold text-slate-900">{stats.totalPrescriptions}</p>
        </Card>
        <Card className="p-3.5 space-y-1 border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pending Reviews</span>
          <p className="text-xl font-extrabold text-amber-600">{stats.pendingReviews}</p>
        </Card>
        <Card className="p-3.5 space-y-1 border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Approved Plans</span>
          <p className="text-xl font-extrabold text-emerald-600">{stats.approvedPlans}</p>
        </Card>
        <Card className="p-3.5 space-y-1 border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Open Cases</span>
          <p className="text-xl font-extrabold text-blue-600">{stats.openCases}</p>
        </Card>
        <Card className="p-3.5 space-y-1 border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400">Reservations</span>
          <p className="text-xl font-extrabold text-purple-600">{stats.pharmacyReservations}</p>
        </Card>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/users">
          <Card hover className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">User Directory</h3>
                <p className="text-xs text-slate-500">5 Demo personas & roles</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>

        <Link to="/admin/medicines">
          <Card hover className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Medicine Catalogue</h3>
                <p className="text-xs text-slate-500">10 DRAP-registered drugs</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>

        <Link to="/admin/pharmacies">
          <Card hover className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Pharmacies Network</h3>
                <p className="text-xs text-slate-500">3 Lahore dispensaries</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>
      </div>

      {/* Recent Audit Logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <span>Immutable System Audit Trail</span>
          </h2>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-purple-700 hover:underline">
            View Complete Log ({recentAudits.length}) →
          </Link>
        </div>

        <Card className="overflow-x-auto p-0 border-slate-200">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Action</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">User / Role</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Clinical / Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAudits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{a.action}</td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {a.entity_type}
                    </span>
                  </td>
                  <td className="p-3 capitalize text-slate-600">{a.user_role || a.user_id}</td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
