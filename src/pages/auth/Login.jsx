import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, Lock, Mail, Sparkles, UserCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Card } from '../../components/common/Card'

export function Login() {
  const { login, switchRole, getRoleDashboardRoute } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStandardLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const loggedUser = await login({ email, password })
      navigate(getRoleDashboardRoute(loggedUser.role))
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async (role) => {
    setLoading(true)
    try {
      const user = await switchRole(role)
      navigate(getRoleDashboardRoute(user.role))
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
          Sign In to MedBridge
        </h2>
        <p className="text-xs text-slate-500">
          Access your secure medication care portal
        </p>
      </div>

      {/* Standard Email/Password Login Form */}
      <Card className="space-y-4">
        <form onSubmit={handleStandardLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@medbridge.demo"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-slate-600">
              <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-emerald-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In with Email
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
