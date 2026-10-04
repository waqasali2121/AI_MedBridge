import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, Package, Phone, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { pharmacyService } from '../../services/pharmacyService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PharmacyReservations() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  const loadData = async () => {
    try {
      const all = await pharmacyService.getPatientReservations()
      setReservations(all)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusUpdate = async (resId, status) => {
    setActionLoading(prev => ({ ...prev, [resId]: true }))
    try {
      await pharmacyService.updateReservationStatus({
        reservationId: resId,
        operatorId: user?.id,
        status,
        notes: status === 'confirmed' ? 'Verified physical stock on shelf. Held for 24h.' : 'Unable to fulfill at this time.'
      })
      await loadData()
    } finally {
      setActionLoading(prev => ({ ...prev, [resId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pharmacy Stock Hold & Reservation Management
        </h1>
        <p className="text-xs text-slate-500">
          Verify physical items on the shelf before confirming holds to prevent wasted patient visits
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading reservation requests...</Card>
      ) : reservations.length === 0 ? (
        <Card className="text-center py-10 text-xs text-slate-400">No reservation requests</Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'confirmed'
            const isRejected = res.status === 'rejected'
            const isRequested = res.status === 'requested'

            return (
              <Card key={res.id} className="p-5 border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Patient: {res.patient_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Requested on {new Date(res.requested_at).toLocaleString()} • Hold ID: {res.id}
                    </p>
                  </div>
                  <Badge variant={isConfirmed ? 'success' : isRejected ? 'danger' : 'warning'}>
                    {t(`status.${res.status}`, res.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Medicine Requested</span>
                    <span className="font-bold text-slate-900">{res.medicine_name}</span>
                    <p className="text-slate-600">{res.strength}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity to Hold</span>
                    <span className="font-bold text-slate-900">{res.quantity} unit(s)</span>
                    {res.notes && <p className="text-slate-500 italic mt-0.5">"{res.notes}"</p>}
                  </div>
                </div>

                {isConfirmed && (
                  <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                    ✓ Stock physically confirmed. Patient notified that medicine is reserved until {new Date(res.expiry_at).toLocaleDateString()}.
                  </p>
                )}

                {isRequested && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={actionLoading[res.id]}
                      onClick={() => handleStatusUpdate(res.id, 'rejected')}
                      icon={XCircle}
                      className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      Reject Request (Out of Stock)
                    </Button>
                    <Button
                      size="sm"
                      loading={actionLoading[res.id]}
                      onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                      icon={CheckCircle2}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      Confirm Physical Availability & Hold
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
