import React, { useState, useEffect } from 'react'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Pill,
  Phone,
  Search,
  Store,
  XCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { pharmacyService } from '../../services/pharmacyService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'

export function PharmacySearch() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [query, setQuery] = useState('Tirzee')
  const [city, setCity] = useState('Lahore')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  // Reservation Modal state
  const [selectedItem, setSelectedItem] = useState(null)
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [reserving, setReserving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const items = await pharmacyService.searchPharmacyStock({ query, city })
      setResults(items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch()
  }, [])

  const handleOpenReserve = (item) => {
    setSelectedItem(item)
    setQuantity(1)
    setNotes('')
    setSuccessMessage(null)
    setReserveModalOpen(true)
  }

  const handleConfirmReservation = async (e) => {
    e.preventDefault()
    if (!selectedItem) return

    setReserving(true)
    try {
      await pharmacyService.requestReservation({
        patientId: user?.id,
        patientName: user?.full_name,
        pharmacyId: selectedItem.pharmacy_id,
        medicineId: selectedItem.medicine_id,
        quantity: Number(quantity),
        notes
      })
      setSuccessMessage(`Reservation requested at ${selectedItem.pharmacy_name}! The pharmacy operator has been notified to verify physical stock.`)
      setTimeout(() => {
        setReserveModalOpen(false)
        setSuccessMessage(null)
      }, 2500)
    } catch (err) {
      console.error('Reservation error:', err)
    } finally {
      setReserving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.pharmacies')}
          </h1>
          <p className="text-xs text-slate-500">
            Search verified community pharmacy inventory across Lahore with reported availability timestamps
          </p>
        </div>
      </div>

      {/* Mandatory Reported Availability Disclaimer */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Inventory Verification Policy:</span> Stock numbers are <strong>reported estimates</strong> submitted by participating community pharmacies. To protect patients against wasted travel, please click <strong>"Request Reservation"</strong> so the pharmacy operator confirms actual physical availability on the shelf.
        </div>
      </div>

      {/* Search Input Bar */}
      <Card className="p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by brand name, generic molecule, or strength (e.g. Tirzee, Zanov, 12.5mg)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-44">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi (Coming Soon)</option>
              <option value="Islamabad">Islamabad (Coming Soon)</option>
            </select>
          </div>
          <Button type="submit" loading={loading} icon={Search}>
            Search Inventory
          </Button>
        </form>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Matching Stock Locations ({results.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Fictional Demonstration Network • DHA Phase 6 / Gulberg / Model Town
          </span>
        </div>

        {results.length === 0 ? (
          <Card className="text-center py-10 space-y-2">
            <p className="text-sm font-semibold text-slate-700">No pharmacy stock reported for "{query}"</p>
            <p className="text-xs text-slate-400">Try searching for "Tirzee", "Zanov", or "Methix"</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => {
              const isAvailable = item.stock_status === 'available'
              const isOut = item.stock_status === 'out_of_stock'
              
              const isStale = item.last_updated?.includes('hour') || item.last_updated?.includes('day')

              return (
                <Card
                  key={item.inventory_id}
                  hover
                  className={`p-5 flex flex-col justify-between gap-4 border transition-all ${
                    isOut ? 'bg-slate-50/70 border-slate-200 opacity-90' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {item.pharmacy_name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[210px]">{item.pharmacy_address}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={isAvailable ? 'success' : isOut ? 'danger' : 'warning'}>
                          {isAvailable ? 'Reported Stock' : isOut ? 'Reported Out' : 'Reported Low'}
                        </Badge>
                        {isStale && (
                          <Badge variant="danger" className="bg-rose-50 text-rose-700 text-[9px] px-1.5 py-0 border-rose-200">
                            STALE
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.medicine_name}</span>
                        <span className="text-[11px] font-semibold text-emerald-700">{item.strength}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.dosage_form} • {item.active_ingredient}</p>
                      
                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                        <span>Reported Stock:</span>
                        <span className="font-bold text-slate-700">
                          {isOut ? '0 units' : `${item.reported_quantity} units reported`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Reported {item.last_updated}
                      </span>
                      <a href={`tel:${item.pharmacy_phone}`} className="text-emerald-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {item.pharmacy_phone}
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant={isOut ? 'outline' : 'primary'}
                      disabled={isOut}
                      onClick={() => handleOpenReserve(item)}
                      className="w-full text-xs"
                    >
                      {isOut ? 'Out of Stock at this branch' : t('patient_actions.request_reservation')}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Reservation Request Modal */}
      {selectedItem && (
        <Modal
          isOpen={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
          title="Request Pharmacy Stock Hold"
          maxWidth="max-w-md"
        >
          {successMessage ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Reservation Request Dispatched</h4>
              <p className="text-xs text-slate-600">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-200">
                <p className="font-bold text-slate-900">{selectedItem.pharmacy_name}</p>
                <p className="text-slate-600">{selectedItem.medicine_name} ({selectedItem.strength})</p>
                <p className="text-[11px] text-slate-400">Last reported availability: {selectedItem.last_updated}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Quantity to Reserve (Packs/Pens)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.reported_quantity || 10}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Special Notes for Pharmacy Operator
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Will pick up today around 5:30 PM..."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg text-[11px] text-emerald-800">
                The pharmacy operator will physically verify stock and hold it for you for 24 hours upon confirmation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setReserveModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={reserving}>
                  Confirm & Send Request
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
