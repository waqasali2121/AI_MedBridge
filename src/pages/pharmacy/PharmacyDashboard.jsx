import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Package,
  Pill,
  Store,
  XCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { pharmacyService } from '../../services/pharmacyService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PharmacyDashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [inventory, setInventory] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const pharmRes = await pharmacyService.getPharmacyReservations('pharm-01')
        const allRes = await pharmacyService.getPatientReservations()
        setReservations(allRes)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingHolds = reservations.filter(r => r.status === 'requested')

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-700/80 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-amber-100">
              Branch: DHA Phase 6, Lahore
            </span>
            <span className="text-xs text-amber-200">Plaza 154, CCA 1, Sector C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Prime Health Hub Community Pharmacy
          </h1>
          <p className="text-xs text-amber-100 max-w-xl">
            Manage reported inventory, confirm reservation holds, and ensure patients find medicines without wasted travel.
          </p>
        </div>

        <Link to="/pharmacy/reservations">
          <Button variant="secondary" size="sm" icon={Package} className="bg-amber-600 hover:bg-amber-700 text-white">
            Pending Hold Requests ({pendingHolds.length})
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Pending Reservations</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingHolds.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Verify physical shelf stock</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Confirmed Holds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {reservations.filter(r => r.status === 'confirmed').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Held for 24 hours</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Active Catalogue Items</span>
            <Pill className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">10</p>
          <span className="text-[11px] text-slate-400">DRAP Registered products</span>
        </Card>
      </div>

      {/* Quick Action Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Incoming Stock Hold Requests
          </h2>
          <Link to="/pharmacy/reservations" className="text-xs font-semibold text-amber-700 hover:underline">
            View All Holds →
          </Link>
        </div>

        {pendingHolds.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No pending stock hold requests at this moment.
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingHolds.map((res) => (
              <Card key={res.id} className="p-4 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{res.patient_name}</span>
                    <Badge variant="warning">Hold Requested</Badge>
                  </div>
                  <p className="text-slate-600">
                    Requested: <strong>{res.quantity}x {res.medicine_name}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Received: {new Date(res.requested_at).toLocaleTimeString()} • Hold window: 24h
                  </p>
                </div>

                <Link to="/pharmacy/reservations">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs">
                    Confirm / Reject Request
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
