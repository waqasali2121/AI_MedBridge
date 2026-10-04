import React from 'react'
import { INITIAL_DEMO_USERS } from '../../services/mockData'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          User Directory & Role Authorization
        </h1>
        <p className="text-xs text-slate-500">
          Enforce multi-role permissions across Patients, Physicians, Pharmacists, and Operators
        </p>
      </div>

      <Card className="overflow-x-auto p-0 border-slate-200">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3.5">User Full Name</th>
              <th className="p-3.5">Email / Account ID</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Contact Phone</th>
              <th className="p-3.5">Language</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {INITIAL_DEMO_USERS.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                  <img src={u.profile_photo} alt={u.full_name} className="w-7 h-7 rounded-full object-cover" />
                  <span>{u.full_name}</span>
                </td>
                <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                <td className="p-3.5">
                  <Badge variant={u.role === 'doctor' ? 'info' : u.role === 'pharmacist' ? 'purple' : u.role === 'admin' ? 'default' : 'primary'}>
                    {u.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </td>
                <td className="p-3.5 text-slate-500 font-mono text-[11px]">{u.phone}</td>
                <td className="p-3.5 uppercase text-slate-500">{u.language || 'en'}</td>
                <td className="p-3.5 text-emerald-600 font-semibold">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
