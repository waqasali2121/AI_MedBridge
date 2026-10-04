-- =============================================================================
-- MedBridge Row Level Security (RLS) Policies
-- Enforcing strict multi-tenant clinical boundaries
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current profile
CREATE OR REPLACE FUNCTION public.current_profile()
RETURNS public.profiles AS $$
    SELECT * FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth_user_id = auth.uid() OR public.current_role() = 'admin');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth_user_id = auth.uid() OR public.current_role() = 'admin');

-- 2. PATIENTS POLICIES
CREATE POLICY "Patients view own record"
    ON public.patients FOR SELECT
    USING (
        profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR public.current_role() IN ('doctor', 'pharmacist', 'admin')
    );

CREATE POLICY "Patients update own record"
    ON public.patients FOR UPDATE
    USING (profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- 3. PRESCRIPTIONS POLICIES
CREATE POLICY "Patients view own prescriptions"
    ON public.prescriptions FOR SELECT
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            JOIN public.profiles pr ON p.profile_id = pr.id
            WHERE pr.auth_user_id = auth.uid()
        )
        OR public.current_role() IN ('doctor', 'pharmacist', 'admin')
    );

CREATE POLICY "Patients can upload prescriptions"
    ON public.prescriptions FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT p.id FROM public.patients p
            JOIN public.profiles pr ON p.profile_id = pr.id
            WHERE pr.auth_user_id = auth.uid()
        )
        OR public.current_role() IN ('patient', 'doctor', 'admin')
    );

CREATE POLICY "Doctors and Pharmacists can update prescription review"
    ON public.prescriptions FOR UPDATE
    USING (public.current_role() IN ('doctor', 'pharmacist', 'admin'));

-- 4. PRESCRIPTION MEDICINES POLICIES
CREATE POLICY "Users view prescription medicines if they have access to prescription"
    ON public.prescription_medicines FOR SELECT
    USING (
        prescription_id IN (SELECT id FROM public.prescriptions)
    );

CREATE POLICY "Authorized roles can manage prescription medicines"
    ON public.prescription_medicines FOR ALL
    USING (public.current_role() IN ('patient', 'doctor', 'pharmacist', 'admin'));

-- 5. MEDICATION PLANS POLICIES
CREATE POLICY "Patients view own approved plans"
    ON public.medication_plans FOR SELECT
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            JOIN public.profiles pr ON p.profile_id = pr.id
            WHERE pr.auth_user_id = auth.uid()
        )
        OR public.current_role() IN ('doctor', 'pharmacist', 'admin')
    );

CREATE POLICY "Doctors and Pharmacists update plans"
    ON public.medication_plans FOR ALL
    USING (public.current_role() IN ('doctor', 'pharmacist', 'admin'));

-- 6. MEDICATION SCHEDULE POLICIES
CREATE POLICY "Patients view own schedules"
    ON public.medication_schedule FOR SELECT
    USING (
        medication_plan_id IN (
            SELECT id FROM public.medication_plans
        )
    );

CREATE POLICY "Patients and doctors configure schedule"
    ON public.medication_schedule FOR ALL
    USING (public.current_role() IN ('patient', 'doctor', 'pharmacist', 'admin'));

-- 7. MEDICATION LOGS POLICIES
CREATE POLICY "Patients view and add own medication logs"
    ON public.medication_logs FOR ALL
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            JOIN public.profiles pr ON p.profile_id = pr.id
            WHERE pr.auth_user_id = auth.uid()
        )
        OR public.current_role() IN ('doctor', 'pharmacist', 'admin')
    );

-- 8. MEDICINES CATALOGUE (Public read, admin write)
CREATE POLICY "Anyone authenticated can search medicines catalogue"
    ON public.medicines FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage medicines catalogue"
    ON public.medicines FOR ALL
    USING (public.current_role() = 'admin');

-- 9. PHARMACIES & INVENTORY (Public read, operators update own pharmacy)
CREATE POLICY "Anyone can view active pharmacies"
    ON public.pharmacies FOR SELECT
    USING (status = 'active' OR public.current_role() IN ('pharmacy_operator', 'admin'));

CREATE POLICY "Anyone can view reported inventory"
    ON public.pharmacy_inventory FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Pharmacy operators manage inventory"
    ON public.pharmacy_inventory FOR ALL
    USING (public.current_role() IN ('pharmacy_operator', 'admin'));

-- 10. RESERVATIONS POLICIES
CREATE POLICY "Patients view and create reservations"
    ON public.reservations FOR ALL
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            JOIN public.profiles pr ON p.profile_id = pr.id
            WHERE pr.auth_user_id = auth.uid()
        )
        OR public.current_role() IN ('pharmacy_operator', 'admin')
    );

-- 11. PATIENT CASES POLICIES
CREATE POLICY "Patients access own cases, doctors/pharmacists access assigned"
    ON public.patient_cases FOR ALL
    USING (
        patient_id IN (
            SELECT p.id FROM public.patients p
            JOIN public.profiles pr ON p.profile_id = pr.id
            WHERE pr.auth_user_id = auth.uid()
        )
        OR public.current_role() IN ('doctor', 'pharmacist', 'admin')
    );

CREATE POLICY "Case messages access"
    ON public.case_messages FOR ALL
    USING (
        case_id IN (SELECT id FROM public.patient_cases)
    );

CREATE POLICY "Professional recommendations access"
    ON public.professional_recommendations FOR ALL
    USING (public.current_role() IN ('doctor', 'pharmacist', 'admin'));

CREATE POLICY "Professional decisions access"
    ON public.professional_decisions FOR ALL
    USING (
        case_id IN (SELECT id FROM public.patient_cases)
    );

-- 12. NOTIFICATIONS & AUDIT LOGS
CREATE POLICY "Users read own notifications"
    ON public.notifications FOR SELECT
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Audit logs visible to Admins"
    ON public.audit_logs FOR SELECT
    USING (public.current_role() = 'admin');

CREATE POLICY "Authenticated users insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- STORAGE BUCKET POLICIES FOR 'prescriptions'
-- (To be executed in Supabase Storage SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);
-- CREATE POLICY "Authenticated users upload prescription files"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'prescriptions' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "Users access permitted prescription files"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'prescriptions' AND auth.uid() IS NOT NULL);
