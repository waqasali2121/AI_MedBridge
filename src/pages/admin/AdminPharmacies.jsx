import React from 'react'
import { INITIAL_PHARMACIES } from '../../services/mockData'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function AdminPharmacies() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Participating Community Pharmacies Network
        </h1>
        <p className="text-xs text-slate-500">
          Verified dispensary network in Lahore supporting patient stock queries and reservation holds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INITIAL_PHARMACIES.map((p) => (
          <Card key={p.id} className="p-5 border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-slate-600">{p.address}</p>
            <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-100 pt-2">
              <p>City: {p.city}</p>
              <p>Contact Phone: {p.phone}</p>
              <p>Coordinates: {p.latitude}, {p.longitude}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
