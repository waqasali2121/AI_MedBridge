import React from 'react'
import { INITIAL_MEDICINES } from '../../services/mockData'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function AdminMedicines() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Standard Medicine Catalogue (DRAP Registered)
        </h1>
        <p className="text-xs text-slate-500">
          Official therapeutic goods registry utilized for prescription extraction mapping and inventory matching
        </p>
      </div>

      <Card className="overflow-x-auto p-0 border-slate-200">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Brand / Product</th>
              <th className="p-3.5">Active Molecule</th>
              <th className="p-3.5">Strength</th>
              <th className="p-3.5">Dosage Form & Route</th>
              <th className="p-3.5">Manufacturer</th>
              <th className="p-3.5">Registration Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {INITIAL_MEDICINES.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-900">{m.product_name}</td>
                <td className="p-3.5 text-slate-700 font-medium">{m.active_ingredient}</td>
                <td className="p-3.5 text-emerald-700 font-semibold">{m.strength}</td>
                <td className="p-3.5 text-slate-500">{m.dosage_form} ({m.route})</td>
                <td className="p-3.5 text-slate-600">{m.manufacturer}</td>
                <td className="p-3.5">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                    {m.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
