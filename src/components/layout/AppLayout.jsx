import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { MedicalDisclaimer } from '../common/MedicalDisclaimer'

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 2. Top Header Navigation */}
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* 3. Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Mobile Drawer Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-64 bg-white h-full shadow-2xl flex flex-col">
              <Sidebar className="w-full flex-1 border-r-0" />
            </div>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Persistent Medical Safety Disclaimer at bottom of view */}
          <div className="mt-8 pt-4 border-t border-slate-200/80">
            <MedicalDisclaimer />
          </div>
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
