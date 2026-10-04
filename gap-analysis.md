# MedBridge Gap Analysis

## 1. Homepage & Core Positioning
EXISTING FEATURE: Landing Page
CURRENT BEHAVIOR: Shows 5 separate roles (Patient, Doctor, Pharmacist, Pharmacy Operator, Admin) as isolated "portals". The story is fragmented.
REQUIRED CHANGE: Present one continuous problem/solution journey: PRESCRIBED → VERIFIED → UNDERSTOOD → FOUND → TAKEN → FOLLOWED UP.
FILES/COMPONENTS AFFECTED: `src/pages/LandingPage.jsx`
DATABASE CHANGES: None
API CHANGES: None
UI CHANGES: Redesign to remove 5 portal boxes. Build Hero, Medication Journey timeline, How It Works, and Demo CTA.
SECURITY IMPACT: None
TEST REQUIRED: Verify presentation is clear and Demo CTA switches to Demo mode reliably.
PRIORITY: P0

## 2. OCR and AI Extraction Confidence
EXISTING FEATURE: Prescription Upload & Extraction
CURRENT BEHAVIOR: `UploadPrescription.jsx` likely extracts medication without structured field-level confidence or uncertainty handling that leads to explicit Pharmacist/Physician routing.
REQUIRED CHANGE: AI must never guess. Display field-level OCR confidence. If confidence is low, require Pharmacist review, or escalate to Physician.
FILES/COMPONENTS AFFECTED: `src/pages/patient/UploadPrescription.jsx`, `src/services/prescriptionService.js` (or mockData), `src/pages/pharmacist/PharmacistReview.jsx`.
DATABASE CHANGES: Add `confidence_score` and `requires_review` to OCR extracted fields (in `mockData.js` / DB schema).
API CHANGES: OCR extraction endpoint needs to return confidence metadata.
UI CHANGES: Show ⚠️ Review required for low-confidence fields in Pharmacist and Patient portals.
SECURITY IMPACT: Enforces clinical safety boundaries by preventing silent AI hallucinations.
TEST REQUIRED: Test 2 - Unreadable Dose. Upload mock with low confidence, assure it requires Pharmacist Review and then Doctor Clarification.
PRIORITY: P0

## 3. Care Pharmacist as Primary Reviewer
EXISTING FEATURE: Prescription Approval Workflow
CURRENT BEHAVIOR: Prescriptions seem to need Doctor approval directly or Pharmacist is just an intermediary.
REQUIRED CHANGE: Care Pharmacist must be primary. Only escalate to Physician if clinical ambiguity requires prescriber authority.
FILES/COMPONENTS AFFECTED: `src/pages/pharmacist/PharmacistReview.jsx`, `src/services/prescriptionService.js`.
DATABASE CHANGES: Add structured fields for Pharmacist Notes, Escalation Reason, and status workflows.
API CHANGES: Update `Approve` endpoint to handle `Awaiting Pharmacist` -> `Approved` or `Needs Doctor Clarification`.
UI CHANGES: Pharmacist Review page gets an "Escalate to Physician" flow and "Approve Plan" (for routine meds).
SECURITY IMPACT: Authorization check - Pharmacist can only approve non-escalated cases.
TEST REQUIRED: Test 1 - Routine Prescription bypassing doctor.
PRIORITY: P0

## 4. Smart Physician Escalation
EXISTING FEATURE: Doctor Dashboard
CURRENT BEHAVIOR: Doctor likely sees all prescriptions or patients.
REQUIRED CHANGE: Physician should only see focused escalation queue (Needs Doctor Clarification).
FILES/COMPONENTS AFFECTED: `src/pages/doctor/DoctorPrescriptions.jsx`, `src/pages/doctor/DoctorPrescriptionReview.jsx`.
DATABASE CHANGES: Filter by `status === 'Needs Doctor Clarification'`.
API CHANGES: Filter queries.
UI CHANGES: Focused queue showing: Escalation reason, Pharmacist notes, Request decision.
SECURITY IMPACT: None
TEST REQUIRED: Ensure routine prescriptions do not appear in Doctor queue.
PRIORITY: P0

## 5. Consistent Medication Status Lifecycle
EXISTING FEATURE: Multiple statuses scattered across files (Requested, Confirmed, etc.)
CURRENT BEHAVIOR: Different nomenclature in different workflows.
REQUIRED CHANGE: Unified lifecycle: Draft, Awaiting Pharmacist, Needs Doctor Clarification, Approved / Active, Completed, Discontinued, Cancelled.
FILES/COMPONENTS AFFECTED: `src/services/mockData.js`, `src/pages/*/` status badges.
DATABASE CHANGES: Standardize `status` field enum.
API CHANGES: Standardize status returns.
UI CHANGES: Update all Badge components and table/list views.
SECURITY IMPACT: None
TEST REQUIRED: Verify statuses across all dashboards.
PRIORITY: P0

## 6. AI Assistant Safety Boundaries
EXISTING FEATURE: AI Chat Assistant (`AIChatAssistant.jsx`)
CURRENT BEHAVIOR: Generic LLM responses.
REQUIRED CHANGE: Strict prompts to forbid diagnosing, prescribing, or overriding approved plans. Escalate red/yellow inquiries to Care Pharmacist.
FILES/COMPONENTS AFFECTED: `src/pages/patient/AIChatAssistant.jsx`, Backend AI service.
DATABASE CHANGES: Integration with Care Inquiry tracking.
API CHANGES: AI prompt/system context modifications.
UI CHANGES: Show "Case forwarded to care team" fallback UI.
SECURITY IMPACT: High - clinical safety boundary. AI must not dispense unchecked medical advice.
TEST REQUIRED: Test 3 (Chest pain -> no prescription) and Test 4 (Increase dosage -> fallback).
PRIORITY: P0

## 7. Demo / Synthetic Data Workflow
EXISTING FEATURE: Interactive 1-click Demo (on Landing Page)
CURRENT BEHAVIOR: Switches users but context is disjointed.
REQUIRED CHANGE: Ensure 1 synchronized synthetic patient journey runs smoothly from upload to reservation in ~3 mins.
FILES/COMPONENTS AFFECTED: `src/services/mockData.js`, `src/pages/LandingPage.jsx`.
DATABASE CHANGES: Pre-populate cohesive demo data representing exactly 1 workflow.
API CHANGES: None
UI CHANGES: Visually mark as Demo mode.
SECURITY IMPACT: Separation of Demo/Production.
TEST REQUIRED: Test 10 - 3-minute demo completes successfully.
PRIORITY: P0

## 8. Patient Dashboard Redesign
EXISTING FEATURE: `PatientDashboard.jsx`
CURRENT BEHAVIOR: Likely generic widgets.
REQUIRED CHANGE: Must answer: What do I take? When? What is pending? Action-oriented.
FILES/COMPONENTS AFFECTED: `src/pages/patient/PatientDashboard.jsx`.
DATABASE CHANGES: `medication_schedule` schema adherence (Taken, Missed).
API CHANGES: Endpoints for "Today's Schedule".
UI CHANGES: Build "Today's Medicines" UI with timeline (8:00 AM, 2:00 PM).
SECURITY IMPACT: None
TEST REQUIRED: Test 7 - Dashboard clear action states.
PRIORITY: P1

## 9. Pharmacy Terminology & Freshness
EXISTING FEATURE: Pharmacy Stock
CURRENT BEHAVIOR: Inconsistent stock terms.
REQUIRED CHANGE: Use: Reported Stock, Reservation Requested, Pharmacy Confirmed, Reserved, Expired, Rejected. Show "Last updated: X mins ago" and "STALE" markers.
FILES/COMPONENTS AFFECTED: `src/pages/patient/PharmacySearch.jsx`, `src/services/pharmacyService.js`.
DATABASE CHANGES: Track timestamp delta to calculate STALE.
API CHANGES: None
UI CHANGES: Update `PharmacySearch.jsx` to reflect exact terms and STALE tagging.
SECURITY IMPACT: None
TEST REQUIRED: Test 5 & 6 (Reported vs Confirmed, Reservations hold expiry).
PRIORITY: P1
