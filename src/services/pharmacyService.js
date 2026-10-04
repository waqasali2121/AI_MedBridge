import { getAppState, saveAppState } from './mockData'
import { auditService } from './auditService'
import { notificationService } from './notificationService'

export const pharmacyService = {
  async getPharmacies() {
    const state = getAppState()
    return state.pharmacies || []
  },

  async getMedicines() {
    const state = getAppState()
    return state.medicines || []
  },

  /**
   * Search pharmacies and matching inventory.
   * Enforces display rule: Always label as 'Reported availability' and include update timestamp.
   */
  async searchPharmacyStock({ query = '', city = 'Lahore' }) {
    const state = getAppState()
    const pharmacies = state.pharmacies || []
    const inventory = state.inventory || []
    const medicines = state.medicines || []

    const q = query.trim().toLowerCase()

    // Find medicines matching query (by name, brand, active ingredient, or strength)
    const matchingMedicines = medicines.filter(m => {
      if (!q) return true
      return (
        m.product_name.toLowerCase().includes(q) ||
        m.brand_name.toLowerCase().includes(q) ||
        m.active_ingredient.toLowerCase().includes(q) ||
        m.strength.toLowerCase().includes(q)
      )
    })

    const matchingMedIds = matchingMedicines.map(m => m.id)

    // Build results list linking pharmacy + inventory + medicine details
    const results = []

    pharmacies
      .filter(p => !city || p.city.toLowerCase() === city.toLowerCase())
      .forEach(pharmacy => {
        const pharmInventory = inventory.filter(inv => 
          inv.pharmacy_id === pharmacy.id && matchingMedIds.includes(inv.medicine_id)
        )

        pharmInventory.forEach(invItem => {
          const med = medicines.find(m => m.id === invItem.medicine_id)
          if (med) {
            results.push({
              inventory_id: invItem.id,
              pharmacy_id: pharmacy.id,
              pharmacy_name: pharmacy.name,
              pharmacy_address: pharmacy.address,
              pharmacy_phone: pharmacy.phone,
              city: pharmacy.city,
              medicine_id: med.id,
              medicine_name: med.product_name,
              brand_name: med.brand_name,
              active_ingredient: med.active_ingredient,
              strength: med.strength,
              dosage_form: med.dosage_form,
              stock_status: invItem.stock_status, // 'available' | 'low_stock' | 'out_of_stock' | 'unknown'
              reported_quantity: invItem.quantity,
              last_updated: invItem.last_updated,
              reported_label: 'Reported availability (Subject to pharmacy confirmation)'
            })
          }
        })
      })

    return results
  },

  /**
   * Patient requests medicine reservation to prevent wasted trip
   */
  async requestReservation({ patientId, patientName, pharmacyId, medicineId, quantity = 1, notes = '' }) {
    const state = getAppState()
    const pharmacy = (state.pharmacies || []).find(p => p.id === pharmacyId)
    const medicine = (state.medicines || []).find(m => m.id === medicineId)

    const resId = `res-${Date.now()}`
    const timestamp = new Date().toISOString()
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24hr hold window

    const reservation = {
      id: resId,
      patient_id: patientId || 'user-pat-01',
      patient_name: patientName || 'Shahid Ehsan',
      pharmacy_id: pharmacyId,
      pharmacy_name: pharmacy ? pharmacy.name : 'Participating Pharmacy',
      pharmacy_phone: pharmacy ? pharmacy.phone : '',
      medicine_id: medicineId,
      medicine_name: medicine ? medicine.product_name : 'Prescribed Medicine',
      strength: medicine ? medicine.strength : '',
      quantity,
      status: 'requested', // 'requested' | 'confirmed' | 'rejected' | 'fulfilled'
      requested_at: timestamp,
      confirmed_at: null,
      expiry_at: expiry,
      notes
    }

    state.reservations = [reservation, ...(state.reservations || [])]
    saveAppState(state)

    // Audit log
    await auditService.logAction({
      userId: patientId,
      userRole: 'patient',
      action: 'Reservation Requested',
      entityType: 'reservation',
      entityId: resId,
      details: `Reservation requested for ${reservation.quantity}x ${reservation.medicine_name} at ${reservation.pharmacy_name}`
    })

    // Notify Pharmacy Operator
    await notificationService.notify({
      userId: 'user-ops-01',
      type: 'reservation_request',
      title: 'New Medicine Reservation Request',
      message: `${reservation.patient_name} requested a reservation for ${reservation.medicine_name}. Please confirm stock availability.`,
      linkUrl: `/pharmacy/reservations`
    })

    return reservation
  },

  async getPatientReservations(patientId) {
    const state = getAppState()
    return (state.reservations || []).filter(r => !patientId || r.patient_id === patientId)
  },

  async getPharmacyReservations(pharmacyId) {
    const state = getAppState()
    return (state.reservations || []).filter(r => !pharmacyId || r.pharmacy_id === pharmacyId)
  },

  /**
   * Pharmacy Operator confirms or rejects reservation
   */
  async updateReservationStatus({ reservationId, operatorId, status, notes = '' }) {
    const state = getAppState()
    const index = (state.reservations || []).findIndex(r => r.id === reservationId)
    if (index === -1) throw new Error('Reservation not found.')

    const currentRes = state.reservations[index]
    const timestamp = new Date().toISOString()

    currentRes.status = status
    currentRes.confirmed_at = status === 'confirmed' ? timestamp : currentRes.confirmed_at
    currentRes.operator_notes = notes

    state.reservations[index] = currentRes
    saveAppState(state)

    // Audit log
    await auditService.logAction({
      userId: operatorId,
      userRole: 'pharmacy_operator',
      action: `Reservation ${status.toUpperCase()}`,
      entityType: 'reservation',
      entityId: reservationId,
      details: `Pharmacy operator marked reservation ${reservationId} as ${status}.`
    })

    // Notify Patient
    const notifTitle = status === 'confirmed'
      ? 'Medicine Reservation Confirmed!'
      : 'Reservation Update'
    const notifMsg = status === 'confirmed'
      ? `${currentRes.pharmacy_name} has verified physical stock and confirmed your reservation for ${currentRes.medicine_name}. Please pick it up before expiry.`
      : `Your reservation request at ${currentRes.pharmacy_name} could not be confirmed: ${notes || 'Stock currently unavailable'}.`

    await notificationService.notify({
      userId: currentRes.patient_id,
      type: status === 'confirmed' ? 'reservation_confirmed' : 'reservation_rejected',
      title: notifTitle,
      message: notifMsg,
      linkUrl: `/patient/reservations`
    })

    return currentRes
  },

  /**
   * Pharmacy Operator updates inventory stock count
   */
  async updateInventoryStock({ pharmacyId, medicineId, quantity, stockStatus }) {
    const state = getAppState()
    const index = (state.inventory || []).findIndex(inv => 
      inv.pharmacy_id === pharmacyId && inv.medicine_id === medicineId
    )

    const now = 'Just now'
    if (index !== -1) {
      state.inventory[index].quantity = quantity
      state.inventory[index].stock_status = stockStatus
      state.inventory[index].last_updated = now
    } else {
      state.inventory.push({
        id: `inv-${Date.now()}`,
        pharmacy_id: pharmacyId,
        medicine_id: medicineId,
        quantity,
        stock_status: stockStatus,
        last_updated: now
      })
    }
    saveAppState(state)
    return state.inventory
  }
}
