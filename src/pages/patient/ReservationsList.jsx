import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, MapPin, Phone, Store, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { pharmacyService } from '../../services/pharmacyService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function ReservationsList() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const list = await pharmacyService.getPatientReservations(user?.id)
        setReservations(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.reservations')}
          </h1>
          <p className="text-xs text-slate-500">
            Track medicine reservation holds confirmed by community pharmacies
          </p>
        </div>
        <Link to="/patient/pharmacies">
          <Button size="sm" icon={Store}>
            Search More Pharmacies
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading reservations...</Card>
      ) : reservations.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <Store className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Medicine Reservations</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't requested any stock reservations yet. Search local pharmacies and request a hold before heading to the pharmacy.
          </p>
          <Link to="/patient/pharmacies">
            <Button size="sm">Search Pharmacies</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'confirmed'
            const isRejected = res.status === 'rejected'

            return (
              <Card key={res.id} className="p-5 border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{res.medicine_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Quantity: {res.quantity} unit(s)</p>
                  </div>
                  <Badge variant={isConfirmed ? 'success' : isRejected ? 'danger' : 'warning'}>
                    {t(`status.${res.status}`, res.status)}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-100">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    {res.pharmacy_name}
                  </p>
                  {res.pharmacy_phone && (
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {res.pharmacy_phone}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Requested on {new Date(res.requested_at).toLocaleString()}
                  </p>
                </div>

                {isConfirmed && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pharmacy operator has confirmed stock! Reserved until {new Date(res.expiry_at).toLocaleDateString()}.</span>
                  </div>
                )}

                {isRejected && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Unavailable: {res.operator_notes || 'Stock could not be verified on the shelf.'}</span>
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
