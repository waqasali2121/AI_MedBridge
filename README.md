# MedBridge — Collaborative Medication Care Platform

> **"One verified medication plan. One connected care journey."**
> A bilingual Urdu/English healthcare platform connecting Patients, Physicians, Care Pharmacists, and Pharmacy Operators around an attributable, verified medication loop.

---

## 1. Project Overview

In fragmented health systems such as Pakistan, patients frequently suffer from illegible or confusing handwritten prescriptions, dispensary stockouts, uncoordinated dosage escalation, and unmonitored adverse drug reactions. 

**MedBridge** bridges this divide by turning every digitized prescription into:
1. An understandable, bilingual medication schedule (English + Urdu).
2. A verified community pharmacy availability and reservation pathway.
3. A collaborative care loop where patient inquiries are triaged by a **Care Pharmacist** and authorized by a **Doctor**.

---

## 2. Medical Safety & Clinical Governance Rules

> [!CAUTION]
> **Strict Medical Non-Negotiables:**
> - MedBridge is an assistive coordination tool, **NOT an autonomous diagnosis or prescribing agent**.
> - The platform **never** autonomously prescribes, modifies drugs, or substitutes medications.
> - **AI is strictly assistive:** It extracts structured drafts from prescription uploads and identifies missing/unclear fields. If handwriting or dosage timing is ambiguous, it flags `⚠ Needs Clarification` without guessing.
> - **Mandatory Verification Gate:** Reminders and daily dose logging **cannot be activated** until the physician (Dr. Ali Raza Naqvi) reviews pharmacist notes and approves the clinical plan.
> - **PRN ("As Needed") Rule:** "As needed" medications are never scheduled as automated fixed-time alerts.
> - **Red-Flag Symptom Screener:** When a patient reports severe warning signs (e.g. chest pain, severe shortness of breath, anaphylaxis), an **Urgent Safety Warning** immediately prompts them to seek emergency hospital care (Rescue 1122) rather than waiting for an asynchronous app reply.
> - **Attributable Adherence:** Actions logged by patients (Taken, Skipped, Remind Later) are strictly labeled as *Patient-Reported Events* for clinical review.

---

## 3. Technology Stack (Free-Tier Deployable)

| Tier | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS | High-performance mobile-first responsive SPA with RTL support |
| **Icons & UI** | Lucide React | Clean, accessible clinical iconography |
| **Typography** | Noto Nastaliq Urdu, Noto Sans Arabic, Inter | Native Nastaliq/Naskh typography rendering with dynamic bidirectional layout |
| **Database** | Supabase (PostgreSQL 15) | Relational multi-tenant schema with foreign keys, constraints, and indexes |
| **Security** | Supabase Row-Level Security (RLS) | Tenancy enforcement separating patients, doctors, pharmacists, operators |
| **Storage** | Supabase Storage | Authenticated private bucket (`prescriptions`) with signed URLs |
| **Hosting** | Vercel | Instant global edge deployment (`vercel.json` SPA rewrites) |
| **Zero-Config Mode** | In-Memory / LocalStorage State Engine | Instant zero-config demo with 1-click role switcher |

---

## 4. Architecture & User Roles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MedBridge Care Loop                               │
└─────────────────────────────────────────────────────────────────────────────┘
  1. Patient Uploads Rx  ──>  2. Assistive AI Draft  ──>  3. Pharmacist Verification
                                (Flag Unclear)            (Interaction & Notes)
                                                                 │
  6. Pharmacy Reservation <──  5. Patient Schedule   <──  4. Physician Approval Gate
     (DHA vs Gulberg)         (Urdu/Eng Reminders)        (Resolves Escalation)
           │
  7. Patient Adherence Logs  ──>  8. Shared Case Inquiry  ──>  Doctor Decision
     ("Patient Reported")          (Pharmacist Triage)        (Unified Outcome)
```

### Supported Personas:
1. **Patient (Shahid Ehsan):** Uploads prescription, receives verified Urdu directions, sets reminders, logs doses (`Taken`, `Skipped`, `Remind Later`), reserves pharmacy stock, and submits "Check Your Understanding" (Teach-Back).
2. **Physician (Dr. Ali Raza Naqvi):** Resolves unclear orders, verifies pharmacist counselling notes, authorizes official medication plans, reviews patient concerns, and publishes final clinical decisions.
3. **Care Pharmacist (Zainab Fatima, PharmD):** Checks transcription fidelity, adds dosage and meal counselling in English and Urdu, evaluates adherence barriers, and submits recommendations to the physician.
4. **Pharmacy Operator (Usman Tariq - DHA Hub):** Updates physical shelf stock with timestamps ("Reported 10 mins ago") and verifies/confirms reservation requests.
5. **System Administrator:** Audits the immutable electronic health record trail, manages the DRAP medicine catalogue, and monitors system metrics.

---

## 5. Instant 16-Step Demonstration Guide

MedBridge comes preloaded with the synthetic consultation scenario from **Prime Health HUB Dew** (Lahore):

| Step | Persona | Action | Expected Output |
|---|---|---|---|
| **1** | Patient | Click **Patient (Shahid)** | Enters Patient Dashboard |
| **2** | Patient | Navigate to `/patient/prescriptions/new` | Uploads PDF / Image |
| **3** | Patient | AI Assistive Parser executes | Structured draft extracted |
| **4** | Patient | View draft | `⚠ Needs Clarification` flagged on Tirzee 12.5mg escalation |
| **5** | Pharmacist | Click **Pharmacist (Zainab)** | Opens `/pharmacist/prescriptions` |
| **6** | Pharmacist | Reviews items & adds note | Forwards recommendation to Doctor |
| **7** | Doctor | Click **Doctor (Dr. Ali)** | Opens `/doctor/prescriptions` |
| **8** | Doctor | Resolves escalation timing & clicks **Approve** | Official Plan activated! Patient notified |
| **9** | Patient | Switch to Patient | Sees *"Medication plan approved"* |
| **10** | Patient | Views Today's Schedule | Daily schedule active with Urdu directions |
| **11** | Patient | Clicks **[✓ Patient Reported Taken]** | Adherence log recorded with audit timestamp |
| **12** | Patient | Searches *"Tirzee"* in Pharmacies | Gulberg shows **Out of Stock**; DHA shows **Available (Reported 10m ago)** |
| **13** | Patient | Clicks **Request Reservation** at DHA | Reservation request created |
| **14** | Pharmacy | Click **Pharmacy (DHA)** | Operator clicks **Confirm Stock Hold** |
| **15** | Patient | Submits inquiry *"Medicine not helping"* | Red-flag symptom screener passes; AI summarizes |
| **16** | Care Team | Pharmacist adds note $\rightarrow$ Doctor publishes decision | Patient receives unified approved clinical outcome |

---

## 6. Quickstart & Local Development

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/medbridge-care.git
cd medbridge-care

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser. The application is completely functional out-of-the-box with full interactive state!

---

## 7. Supabase Database & Storage Setup

To connect your own production Supabase instance:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and execute the migrations in order:
   - `supabase/schema.sql` (Creates all 18 tables, indexes, and constraints)
   - `supabase/rls_policies.sql` (Enforces Row-Level Security policies)
   - `supabase/seed.sql` (Seeds demo users, Lahore pharmacies, and DRAP catalogue)
3. Go to **Storage** and create a bucket named `prescriptions` (Private bucket).
4. Configure your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_SUPABASE_STORAGE_BUCKET=prescriptions
VITE_MAX_UPLOAD_SIZE_MB=10
```
5. Restart your dev server (`npm run dev`). MedBridge will automatically detect the Supabase credentials and transition to cloud database mode.

---

## 8. Deployment (Vercel & GitHub)

### Deploying to Vercel
1. Push your repository to GitHub:
```bash
git init
git add .
git commit -m "feat: Initial MedBridge release"
git branch -M main
git remote add origin https://github.com/your-username/medbridge-care.git
git push -u origin main
```
2. Import the repository into [vercel.com](https://vercel.com).
3. The build configuration is preconfigured:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add your Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
5. Click **Deploy**. The included `vercel.json` ensures client-side routing works seamlessly on refresh.

---

## 9. Security & Regulatory Verification Checklist

- [x] **No Secrets in Frontend:** Service-role keys are never exposed in client code.
- [x] **Zero Synthetic Data Exposure:** Real patient medical data from source samples is replaced with synthetic, fictional profiles.
- [x] **File Constraints Enforced:** File uploads are strictly validated for MIME type (`pdf`, `png`, `jpeg`, `webp`) and maximum size ($\le 10\text{ MB}$).
- [x] **Bilingual RTL Layout:** Bidirectional typography and layout dynamically adapt when switching between English and Urdu.
- [x] **Immutable Auditing:** Every clinical action (upload, verification, authorization, adherence report, reservation) generates an audit entry.
- [x] **Red-Flag Screener:** Critical symptoms trigger immediate advice to seek urgent in-person emergency care.

---

## 10. Medical Disclaimer

> **MedBridge is a medication coordination and information-support application. It does not replace a doctor, pharmacist, emergency medical service, clinical diagnosis, physical examination, or professional medical advice.**
