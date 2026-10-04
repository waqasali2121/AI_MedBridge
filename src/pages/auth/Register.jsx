import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Card } from '../../components/common/Card'

export function Register() {
  const { register, getRoleDashboardRoute } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('patient')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const newUser = await register({
        fullName,
        email,
        phone,
        role,
        password
      })
      navigate(getRoleDashboardRoute(newUser.role))
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create MedBridge Account
        </h2>
        <p className="text-xs text-slate-500">
          Join the connected medication care ecosystem
        </p>
      </div>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Shahid Ehsan"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <Input
            label="Mobile Phone (Pakistan)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
            required
          />

          <div className="space-y-1.5 text-left rtl:text-right">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor / Physician</option>
              <option value="pharmacist">Care Pharmacist</option>
              <option value="pharmacy_operator">Pharmacy Operator</option>
            </select>
          </div>

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />

          <Button type="submit" loading={loading} icon={UserPlus} className="w-full">
            Register Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
