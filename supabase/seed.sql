-- =============================================================================
-- MedBridge Synthetic Seed Data
-- CAUTION: DEMO DATA — NOT REAL PATIENT INFORMATION
-- =============================================================================

-- Seed Demo Profiles
INSERT INTO public.profiles (id, full_name, email, phone, role, language) VALUES
('11111111-1111-1111-1111-111111111111', 'Shahid Ehsan (Demo Patient)', 'patient@medbridge.demo', '+92 300 0068443', 'patient', 'en'),
('22222222-2222-2222-2222-222222222222', 'Dr. Ali Raza Naqvi (Demo Doctor)', 'doctor@medbridge.demo', '+92 321 4455667', 'doctor', 'en'),
('33333333-3333-3333-3333-333333333333', 'Zainab Fatima, PharmD (Care Pharmacist)', 'pharmacist@medbridge.demo', '+92 333 8899001', 'pharmacist', 'en'),
('44444444-4444-4444-4444-444444444444', 'Usman Tariq (DHA Pharmacy Operator)', 'pharmacy@medbridge.demo', '+92 42 35720011', 'pharmacy_operator', 'en'),
('55555555-5555-5555-5555-555555555555', 'MedBridge System Admin', 'admin@medbridge.demo', '+92 300 1234567', 'admin', 'en')
ON CONFLICT (email) DO NOTHING;

-- Seed Patient Record
INSERT INTO public.patients (id, profile_id, mrn, date_of_birth, gender, allergies, current_medications, emergency_contact, caregiver_enabled, caregiver_name, caregiver_phone) VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'MRN-00000690', '1982-01-01', 'Male', ARRAY['Penicillin', 'Sulfa drugs'], 'Dolmet 500mg, Vonoprazan 20mg', '+92 300 9876543 (Spouse)', TRUE, 'Ayesha Shahid', '+92 300 9876543')
ON CONFLICT (profile_id) DO NOTHING;

-- Assign Doctor and Pharmacist to Patient
INSERT INTO public.professional_patient_assignments (patient_id, professional_id, professional_role, status) VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'doctor', 'active'),
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'pharmacist', 'active')
ON CONFLICT DO NOTHING;

-- Seed 10 DRAP-Aligned Medicines Catalogue
INSERT INTO public.medicines (id, product_name, brand_name, active_ingredient, strength, dosage_form, route, release_type, manufacturer, source) VALUES
('bbbb0001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tirzee Pre-filled Pen 12.5mg/0.5ml', 'Tirzee', 'Tirzepatide', '12.5mg/0.5ml', 'Pre-filled Pen Injectable', 'Subcutaneous', 'Extended Release', 'Helix Pharma', 'DRAP Registered'),
('bbbb0002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tirzee Pre-filled Pen 10mg/0.5ml', 'Tirzee', 'Tirzepatide', '10mg/0.5ml', 'Pre-filled Pen Injectable', 'Subcutaneous', 'Extended Release', 'Helix Pharma', 'DRAP Registered'),
('bbbb0003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tirzee Pre-filled Pen 2.5mg/0.5ml', 'Tirzee', 'Tirzepatide', '2.5mg/0.5ml', 'Pre-filled Pen Injectable', 'Subcutaneous', 'Extended Release', 'Helix Pharma', 'DRAP Registered'),
('bbbb0004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Zanov 20mg Capsules', 'Zanov', 'Vonoprazan', '20mg', 'Capsule', 'Oral', 'Immediate Release', 'Getz Pharma', 'DRAP Registered'),
('bbbb0005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Methix Tablets 20s', 'Methix', 'Mecobalamin', '500mcg', 'Tablet', 'Oral', 'Immediate Release', 'Highnoon Laboratories', 'DRAP Registered'),
('bbbb0006-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dolmet 500mg Tablets', 'Dolmet', 'Metformin HCl', '500mg', 'Tablet', 'Oral', 'Extended Release', 'Searle Pakistan', 'DRAP Registered'),
('bbbb0007-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Zyloric 300mg Tablets', 'Zyloric', 'Allopurinol', '300mg', 'Tablet', 'Oral', 'Immediate Release', 'GSK Pakistan', 'DRAP Registered'),
('bbbb0008-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Glucophage 500mg Tablets', 'Glucophage', 'Metformin HCl', '500mg', 'Tablet', 'Oral', 'Immediate Release', 'Merck Pakistan', 'DRAP Registered'),
('bbbb0009-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Panadol 500mg Tablets', 'Panadol', 'Paracetamol', '500mg', 'Tablet', 'Oral', 'Immediate Release', 'GSK Pakistan', 'DRAP Registered'),
('bbbb0010-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Vonoprazan 20mg Capsules', 'Vonoprazan', 'Vonoprazan Fumarate', '20mg', 'Capsule', 'Oral', 'Immediate Release', 'Sami Pharmaceuticals', 'DRAP Registered')
ON CONFLICT (id) DO NOTHING;

-- Seed 3 Fictional Pharmacies in Lahore
INSERT INTO public.pharmacies (id, name, city, address, latitude, longitude, phone, status) VALUES
('cccc0001-cccc-cccc-cccc-cccccccccccc', 'Prime Health Hub Pharmacy - DHA Phase 6', 'Lahore', 'Plaza 154, CCA 1, Sector C, DHA Phase 6, Lahore', 31.4705, 74.4352, '+92 42 35720011', 'active'),
('cccc0002-cccc-cccc-cccc-cccccccccccc', 'CareMeds Community Dispensary - Gulberg', 'Lahore', 'Main Boulevard, Near Liberty Roundabout, Gulberg III, Lahore', 31.5102, 74.3441, '+92 42 35759922', 'active'),
('cccc0003-cccc-cccc-cccc-cccccccccccc', 'Model Town Central Chemist', 'Lahore', 'Central Commercial Market, Model Town, Lahore', 31.4820, 74.3180, '+92 42 35848833', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Pharmacy Inventory (Showing reported availability vs stockout)
-- Pharmacy 1 (DHA Phase 6) has Tirzee 12.5mg AVAILABLE
INSERT INTO public.pharmacy_inventory (pharmacy_id, medicine_id, quantity, stock_status, last_updated) VALUES
('cccc0001-cccc-cccc-cccc-cccccccccccc', 'bbbb0001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 8, 'available', NOW() - INTERVAL '12 minutes'),
('cccc0001-cccc-cccc-cccc-cccccccccccc', 'bbbb0004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 25, 'available', NOW() - INTERVAL '15 minutes'),
('cccc0001-cccc-cccc-cccc-cccccccccccc', 'bbbb0005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 18, 'available', NOW() - INTERVAL '15 minutes'),

-- Pharmacy 2 (Gulberg) has Tirzee 12.5mg OUT OF STOCK (Explicit Demo requirement!)
('cccc0002-cccc-cccc-cccc-cccccccccccc', 'bbbb0001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0, 'out_of_stock', NOW() - INTERVAL '45 minutes'),
('cccc0002-cccc-cccc-cccc-cccccccccccc', 'bbbb0004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 14, 'available', NOW() - INTERVAL '1 hour'),
('cccc0002-cccc-cccc-cccc-cccccccccccc', 'bbbb0005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, 'low_stock', NOW() - INTERVAL '30 minutes'),

-- Pharmacy 3 (Model Town) has low stock
('cccc0003-cccc-cccc-cccc-cccccccccccc', 'bbbb0001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'low_stock', NOW() - INTERVAL '2 hours'),
('cccc0003-cccc-cccc-cccc-cccccccccccc', 'bbbb0004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 40, 'available', NOW() - INTERVAL '10 minutes'),
('cccc0003-cccc-cccc-cccc-cccccccccccc', 'bbbb0005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 30, 'available', NOW() - INTERVAL '10 minutes')
ON CONFLICT (pharmacy_id, medicine_id) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    stock_status = EXCLUDED.stock_status,
    last_updated = EXCLUDED.last_updated;
