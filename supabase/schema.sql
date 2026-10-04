-- =============================================================================
-- MedBridge Database Schema (Supabase PostgreSQL)
-- Multi-role medication management & professional care platform
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users or acts as independent role table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist', 'pharmacy_operator', 'admin')),
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ur')),
    profile_photo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PATIENTS (Medical profile details for patient role)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mrn TEXT UNIQUE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_medications TEXT,
    emergency_contact TEXT,
    caregiver_enabled BOOLEAN DEFAULT FALSE,
    caregiver_name TEXT,
    caregiver_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PROFESSIONAL-PATIENT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.professional_patient_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_role TEXT NOT NULL CHECK (professional_role IN ('doctor', 'pharmacist')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRESCRIPTIONS (Uploaded files & state tracking)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    original_file_path TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    extraction_status TEXT NOT NULL DEFAULT 'draft' CHECK (extraction_status IN ('draft', 'processing', 'completed', 'failed')),
    verification_status TEXT NOT NULL DEFAULT 'draft' CHECK (verification_status IN (
        'draft', 'processing', 'needs_clarification', 'pending_pharmacist', 'pending_doctor', 'approved', 'rejected', 'archived'
    )),
    extracted_data JSONB DEFAULT '{}'::JSONB,
    doctor_notes TEXT,
    pharmacist_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRESCRIPTION MEDICINES (Itemized extracted prescription items)
CREATE TABLE IF NOT EXISTS public.prescription_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    brand_name TEXT,
    active_ingredient TEXT,
    strength TEXT,
    dosage_form TEXT,
    route TEXT DEFAULT 'Oral',
    frequency TEXT NOT NULL,
    dose TEXT NOT NULL,
    duration TEXT,
    food_instruction TEXT,
    special_instruction TEXT,
    urdu_instruction TEXT,
    extracted_confidence NUMERIC(4,3) DEFAULT 0.950,
    clarification_required BOOLEAN DEFAULT FALSE,
    clarification_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. MEDICATION PLANS (Approved clinical plans activating schedules)
CREATE TABLE IF NOT EXISTS public.medication_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'superseded', 'archived')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    approved_by_doctor UUID REFERENCES public.profiles(id),
    approved_by_pharmacist UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    teach_back_text TEXT,
    teach_back_submitted_at TIMESTAMPTZ,
    teach_back_status TEXT DEFAULT 'pending' CHECK (teach_back_status IN ('pending', 'submitted', 'reviewed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. MEDICATION SCHEDULE (Specific reminder times per plan item)
CREATE TABLE IF NOT EXISTS public.medication_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_plan_id UUID NOT NULL REFERENCES public.medication_plans(id) ON DELETE CASCADE,
    prescription_medicine_id UUID NOT NULL REFERENCES public.prescription_medicines(id) ON DELETE CASCADE,
    scheduled_time TIME,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('once_daily', 'twice_daily', 'three_times_daily', 'weekly', 'custom', 'as_needed')),
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    instruction TEXT,
    urdu_instruction TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. MEDICATION LOGS (Patient reported dose adherence events)
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    medication_schedule_id UUID NOT NULL REFERENCES public.medication_schedule(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('taken', 'skipped', 'remind_later')),
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. MEDICINES CATALOGUE (Standard pharmaceutical catalogue)
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    active_ingredient TEXT NOT NULL,
    strength TEXT NOT NULL,
    dosage_form TEXT NOT NULL,
    route TEXT NOT NULL DEFAULT 'Oral',
    release_type TEXT DEFAULT 'Immediate Release',
    manufacturer TEXT,
    source TEXT DEFAULT 'DRAP Registered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. PHARMACIES (Community dispensary network)
CREATE TABLE IF NOT EXISTS public.pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. PHARMACY INVENTORY (Reported stock with update timestamps)
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    stock_status TEXT NOT NULL DEFAULT 'unknown' CHECK (stock_status IN ('available', 'low_stock', 'out_of_stock', 'unknown')),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES public.profiles(id),
    UNIQUE(pharmacy_id, medicine_id)
);

-- 12. RESERVATIONS (Patient requests to hold verified stock)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id),
    quantity INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'rejected', 'expired', 'fulfilled', 'cancelled')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMPTZ,
    expiry_at TIMESTAMPTZ,
    notes TEXT
);

-- 13. PATIENT CASES (Shared care concerns and consultation requests)
CREATE TABLE IF NOT EXISTS public.patient_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id),
    medication_plan_id UUID REFERENCES public.medication_plans(id),
    concern_type TEXT NOT NULL CHECK (concern_type IN ('not_improving', 'suspected_side_effect', 'medicine_unavailable', 'missed_doses', 'other')),
    description TEXT NOT NULL,
    treatment_start_date DATE,
    doses_taken_count INT,
    symptoms_changed TEXT,
    adverse_effects TEXT,
    urgency TEXT NOT NULL DEFAULT 'standard' CHECK (urgency IN ('standard', 'urgent', 'emergency_referred')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pharmacist_reviewed', 'doctor_resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. CASE MESSAGES (Communication thread inside a shared case)
CREATE TABLE IF NOT EXISTS public.case_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'doctor', 'pharmacist', 'system')),
    message TEXT NOT NULL,
    attachment_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. PROFESSIONAL RECOMMENDATIONS (Pharmacist's assessment)
CREATE TABLE IF NOT EXISTS public.professional_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id),
    professional_role TEXT NOT NULL DEFAULT 'pharmacist',
    recommendation TEXT NOT NULL,
    adherence_assessment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. PROFESSIONAL DECISIONS (Doctor's final clinical outcome)
CREATE TABLE IF NOT EXISTS public.professional_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.profiles(id),
    decision TEXT NOT NULL,
    explanation TEXT NOT NULL,
    new_prescription_id UUID REFERENCES public.prescriptions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. NOTIFICATIONS (In-app alerts for all roles)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. AUDIT LOGS (Immutable tracking of all medical & security actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES for low-latency queries
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_plans_patient ON public.medication_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_schedule_plan ON public.medication_schedule(medication_plan_id);
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacy ON public.pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_inventory_medicine ON public.pharmacy_inventory(medicine_id);
CREATE INDEX IF NOT EXISTS idx_cases_patient ON public.patient_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
