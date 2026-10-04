import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute, RoleRedirect } from './ProtectedRoute'

// Pages
import { LandingPage } from '../pages/LandingPage'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { ForgotPassword } from '../pages/auth/ForgotPassword'

// Patient Pages
import { PatientDashboard } from '../pages/patient/PatientDashboard'
import { UploadPrescription } from '../pages/patient/UploadPrescription'
import { PrescriptionsList } from '../pages/patient/PrescriptionsList'
import { PrescriptionDetail } from '../pages/patient/PrescriptionDetail'
import { MedicationsView } from '../pages/patient/MedicationsView'
import { RemindersView } from '../pages/patient/RemindersView'
import { PharmacySearch } from '../pages/patient/PharmacySearch'
import { ReservationsList } from '../pages/patient/ReservationsList'
import { PatientCases } from '../pages/patient/PatientCases'
import { NewCaseReport } from '../pages/patient/NewCaseReport'
import { PatientProfile } from '../pages/patient/PatientProfile'
import { MedicineScanner } from '../pages/patient/MedicineScanner'
import { AIChatAssistant } from '../pages/patient/AIChatAssistant'

// Doctor Pages
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard'
import { DoctorPatients } from '../pages/doctor/DoctorPatients'
import { DoctorPrescriptions } from '../pages/doctor/DoctorPrescriptions'
import { DoctorPrescriptionReview } from '../pages/doctor/DoctorPrescriptionReview'
import { DoctorCases } from '../pages/doctor/DoctorCases'
import { DoctorMedicationPlans } from '../pages/doctor/DoctorMedicationPlans'

// Pharmacist Pages
import { PharmacistDashboard } from '../pages/pharmacist/PharmacistDashboard'
import { PharmacistPrescriptions } from '../pages/pharmacist/PharmacistPrescriptions'
import { PharmacistReview } from '../pages/pharmacist/PharmacistReview'
import { PharmacistCases } from '../pages/pharmacist/PharmacistCases'
import { PharmacistCounselling } from '../pages/pharmacist/PharmacistCounselling'

// Pharmacy Operator Pages
import { PharmacyDashboard } from '../pages/pharmacy/PharmacyDashboard'
import { PharmacyInventory } from '../pages/pharmacy/PharmacyInventory'
import { PharmacyReservations } from '../pages/pharmacy/PharmacyReservations'

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { AdminUsers } from '../pages/admin/AdminUsers'
import { AdminMedicines } from '../pages/admin/AdminMedicines'
import { AdminPharmacies } from '../pages/admin/AdminPharmacies'
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public & Landing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Patient Portal Routes */}
        <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><PrescriptionsList /></ProtectedRoute>} />
        <Route path="/patient/prescriptions/new" element={<ProtectedRoute allowedRoles={['patient']}><UploadPrescription /></ProtectedRoute>} />
        <Route path="/patient/prescriptions/:id" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'pharmacist', 'admin']}><PrescriptionDetail /></ProtectedRoute>} />
        <Route path="/patient/medications" element={<ProtectedRoute allowedRoles={['patient']}><MedicationsView /></ProtectedRoute>} />
        <Route path="/patient/reminders" element={<ProtectedRoute allowedRoles={['patient']}><RemindersView /></ProtectedRoute>} />
        <Route path="/patient/pharmacies" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'pharmacist', 'admin']}><PharmacySearch /></ProtectedRoute>} />
        <Route path="/patient/reservations" element={<ProtectedRoute allowedRoles={['patient']}><ReservationsList /></ProtectedRoute>} />
        <Route path="/patient/cases" element={<ProtectedRoute allowedRoles={['patient']}><PatientCases /></ProtectedRoute>} />
        <Route path="/patient/cases/new" element={<ProtectedRoute allowedRoles={['patient']}><NewCaseReport /></ProtectedRoute>} />
        <Route path="/patient/ai-assistant" element={<ProtectedRoute allowedRoles={['patient']}><AIChatAssistant /></ProtectedRoute>} />
        <Route path="/patient/scan" element={<ProtectedRoute allowedRoles={['patient']}><MedicineScanner /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

        {/* Doctor Portal Routes */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions/:id" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptionReview /></ProtectedRoute>} />
        <Route path="/doctor/cases" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorCases /></ProtectedRoute>} />
        <Route path="/doctor/medication-plans" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorMedicationPlans /></ProtectedRoute>} />

        {/* Pharmacist Portal Routes */}
        <Route path="/pharmacist/dashboard" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
        <Route path="/pharmacist/prescriptions" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistPrescriptions /></ProtectedRoute>} />
        <Route path="/pharmacist/prescriptions/:id" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistReview /></ProtectedRoute>} />
        <Route path="/pharmacist/cases" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistCases /></ProtectedRoute>} />
        <Route path="/pharmacist/counselling" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistCounselling /></ProtectedRoute>} />

        {/* Pharmacy Operator Portal Routes */}
        <Route path="/pharmacy/dashboard" element={<ProtectedRoute allowedRoles={['pharmacy_operator']}><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/pharmacy/inventory" element={<ProtectedRoute allowedRoles={['pharmacy_operator']}><PharmacyInventory /></ProtectedRoute>} />
        <Route path="/pharmacy/reservations" element={<ProtectedRoute allowedRoles={['pharmacy_operator']}><PharmacyReservations /></ProtectedRoute>} />

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/medicines" element={<ProtectedRoute allowedRoles={['admin']}><AdminMedicines /></ProtectedRoute>} />
        <Route path="/admin/pharmacies" element={<ProtectedRoute allowedRoles={['admin']}><AdminPharmacies /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminAuditLogs /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
