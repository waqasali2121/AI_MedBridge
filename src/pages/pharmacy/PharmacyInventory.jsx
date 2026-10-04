import React, { useState, useEffect } from 'react'
import { CheckCircle2, Edit2, Package, Pill, Save, Store } from 'lucide-react'
import { pharmacyService } from '../../services/pharmacyService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PharmacyInventory() {
  const [medicines, setMedicines] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editQty, setEditQty] = useState(0)
  const [editStatus, setEditStatus] = useState('available')
  const [savedSuccess, setSavedSuccess] = useState(null)

  const loadData = async () => {
    try {
      const meds = await pharmacyService.getMedicines()
      const inv = await pharmacyService.searchPharmacyStock({ city: 'Lahore' })
      setMedicines(meds)
      setInventory(inv.filter(i => i.pharmacy_id === 'pharm-01'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStartEdit = (item) => {
    setEditingId(item.medicine_id)
    setEditQty(item.reported_quantity)
    setEditStatus(item.stock_status)
    setSavedSuccess(null)
  }

  const handleSaveStock = async (medicineId) => {
    await pharmacyService.updateInventoryStock({
      pharmacyId: 'pharm-01',
      medicineId,
      quantity: Number(editQty),
      stockStatus: editStatus
    })
    setEditingId(null)
    setSavedSuccess(medicineId)
    await loadData()
    setTimeout(() => setSavedSuccess(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pharmacy Shelf Stock & Reported Inventory
        </h1>
        <p className="text-xs text-slate-500">
          Prime Health Hub Pharmacy - DHA Phase 6, Lahore
        </p>
      </div>

      <Card className="overflow-x-auto p-0 border-slate-200">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Medicine Product</th>
              <th className="p-3.5">Strength / Form</th>
              <th className="p-3.5">Reported Quantity</th>
              <th className="p-3.5">Stock Status</th>
              <th className="p-3.5">Last Reported</th>
              <th className="p-3.5 text-right rtl:text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((item) => {
              const isEditing = editingId === item.medicine_id

              return (
                <tr key={item.inventory_id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-bold text-slate-900">{item.medicine_name}</td>
                  <td className="p-3.5 text-slate-600">{item.strength} • {item.dosage_form}</td>

                  {/* Quantity Field */}
                  <td className="p-3.5 font-semibold">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="w-20 px-2 py-1 text-xs border rounded border-slate-300"
                      />
                    ) : (
                      <span>{item.reported_quantity} units</span>
                    )}
                  </td>

                  {/* Stock Status Field */}
                  <td className="p-3.5">
                    {isEditing ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="px-2 py-1 text-xs border rounded border-slate-300"
                      >
                        <option value="available">Available in Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    ) : (
                      <Badge variant={item.stock_status === 'available' ? 'success' : item.stock_status === 'out_of_stock' ? 'danger' : 'warning'}>
                        {item.stock_status.replace('_', ' ')}
                      </Badge>
                    )}
                  </td>

                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{item.last_updated}</td>

                  {/* Action Buttons */}
                  <td className="p-3.5 text-right rtl:text-left">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveStock(item.medicine_id)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 ml-auto rtl:ml-0 rtl:mr-auto"
                      >
                        <Edit2 className="w-3 h-3" /> Update
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
