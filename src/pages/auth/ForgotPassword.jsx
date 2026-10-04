import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Card } from '../../components/common/Card'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-slate-500">
          We will send a password reset link to your registered email
        </p>
      </div>

      <Card className="space-y-4">
        {sent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Reset Instructions Sent!
            </p>
            <p className="text-xs text-slate-500">
              Check your inbox for a link to reset your MedBridge account password.
            </p>
            <Link to="/login" className="inline-block pt-2">
              <Button variant="outline" size="sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. patient@medbridge.demo"
              required
            />
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
