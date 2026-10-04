// =============================================================================
// MedBridge Initial Synthetic Mock State Engine
// Supports zero-config instant demo with localStorage persistence
// DEMO DATA — NOT REAL PATIENT INFORMATION
// =============================================================================

export const INITIAL_DEMO_USERS = [
  {
    id: 'user-pat-01',
    auth_user_id: 'auth-pat-01',
    email: 'patient@medbridge.demo',
    full_name: 'Shahid Ehsan (Demo Patient)',
    phone: '+92 300 0068443',
    role: 'patient',
    language: 'en',
    profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    patient_details: {
      mrn: '00000690',
      date_of_birth: '1982-01-01',
      age: '44 Y',
      gender: 'Male',
      allergies: ['Penicillin', 'Sulfa drugs'],
      current_medications: 'Dolmet 500mg, Vonoprazan 20mg Cap, Zyloric 300mg',
      emergency_contact: 'Ayesha Shahid (Spouse) - 0300-9876543',
      caregiver_enabled: true,
      caregiver_name: 'Ayesha Shahid',
      caregiver_phone: '0300-9876543'
    }
  },
  {
    id: 'user-doc-01',
    auth_user_id: 'auth-doc-01',
    email: 'doctor@medbridge.demo',
    full_name: 'Dr. Ali Raza Naqvi (Demo Doctor)',
    phone: '+92 321 4455667',
    role: 'doctor',
    language: 'en',
    specialty: 'Consultant Diabetologist & Endocrinologist',
    credentials: 'MBBS (AIMC), MRCP UK (Endocrinology), FRCP London, CCT UK Imperial College London',
    clinic: 'Prime Health HUB Dew, DHA Phase 6, Lahore',
    profile_photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-phm-01',
    auth_user_id: 'auth-phm-01',
    email: 'pharmacist@medbridge.demo',
    full_name: 'Zainab Fatima, PharmD (Care Pharmacist)',
    phone: '+92 333 8899001',
    role: 'pharmacist',
    language: 'ur',
    license: 'PB-RPh-84920',
    institution: 'MedBridge Integrated Clinical Pharmacy Network',
    profile_photo: 'https://images.unsplash.com/photo-1594824813589-980f76c5d947?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-ops-01',
    auth_user_id: 'auth-ops-01',
    email: 'pharmacy@medbridge.demo',
    full_name: 'Usman Tariq (Pharmacy Manager)',
    phone: '+92 42 35720011',
    role: 'pharmacy_operator',
    pharmacy_id: 'pharm-01',
    pharmacy_name: 'Prime Health Hub Pharmacy - DHA Phase 6',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-adm-01',
    auth_user_id: 'auth-adm-01',
    email: 'admin@medbridge.demo',
    full_name: 'MedBridge System Administrator',
    phone: '+92 300 1234567',
    role: 'admin',
    language: 'en',
    profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
]

export const INITIAL_MEDICINES = [
  {
    id: 'med-01',
    product_name: 'Tirzee 12.5mg/0.5ml Pre-filled Pen 1s',
    brand_name: 'Tirzee',
    active_ingredient: 'Tirzepatide',
    strength: '12.5 mg / 0.5 ml',
    dosage_form: 'Pre-filled Pen Injectable',
    route: 'Subcutaneous',
    release_type: 'Extended Release',
    manufacturer: 'Helix Pharma (Pvt) Ltd',
    source: 'DRAP Registered 098421'
  },
  {
    id: 'med-02',
    product_name: 'Tirzee 10mg/0.5ml Pre-filled Pen 1s',
    brand_name: 'Tirzee',
    active_ingredient: 'Tirzepatide',
    strength: '10 mg / 0.5 ml',
    dosage_form: 'Pre-filled Pen Injectable',
    route: 'Subcutaneous',
    release_type: 'Extended Release',
    manufacturer: 'Helix Pharma (Pvt) Ltd',
    source: 'DRAP Registered 098420'
  },
  {
    id: 'med-03',
    product_name: 'Tirzee 2.5mg/0.5ml Pre-filled Pen 1s',
    brand_name: 'Tirzee',
    active_ingredient: 'Tirzepatide',
    strength: '2.5 mg / 0.5 ml',
    dosage_form: 'Pre-filled Pen Injectable',
    route: 'Subcutaneous',
    release_type: 'Extended Release',
    manufacturer: 'Helix Pharma (Pvt) Ltd',
    source: 'DRAP Registered 098418'
  },
  {
    id: 'med-04',
    product_name: 'Zanov 20mg Capsules',
    brand_name: 'Zanov',
    active_ingredient: 'Vonoprazan Fumarate',
    strength: '20 mg',
    dosage_form: 'Capsule',
    route: 'Oral',
    release_type: 'Immediate Release',
    manufacturer: 'Getz Pharma (Pvt) Ltd',
    source: 'DRAP Registered 087612'
  },
  {
    id: 'med-05',
    product_name: 'Methix Tablets 20s',
    brand_name: 'Methix',
    active_ingredient: 'Mecobalamin',
    strength: '500 mcg',
    dosage_form: 'Tablet',
    route: 'Oral',
    release_type: 'Immediate Release',
    manufacturer: 'Highnoon Laboratories',
    source: 'DRAP Registered 043219'
  },
  {
    id: 'med-06',
    product_name: 'Dolmet 500mg Tablets',
    brand_name: 'Dolmet',
    active_ingredient: 'Metformin HCl',
    strength: '500 mg',
    dosage_form: 'Tablet',
    route: 'Oral',
    release_type: 'Extended Release',
    manufacturer: 'Searle Company Limited',
    source: 'DRAP Registered 012499'
  },
  {
    id: 'med-07',
    product_name: 'Zyloric 300mg Tablets',
    brand_name: 'Zyloric',
    active_ingredient: 'Allopurinol',
    strength: '300 mg',
    dosage_form: 'Tablet',
    route: 'Oral',
    release_type: 'Immediate Release',
    manufacturer: 'GSK Pakistan',
    source: 'DRAP Registered 003112'
  },
  {
    id: 'med-08',
    product_name: 'Glucophage 500mg Tablets',
    brand_name: 'Glucophage',
    active_ingredient: 'Metformin HCl',
    strength: '500 mg',
    dosage_form: 'Tablet',
    route: 'Oral',
    release_type: 'Immediate Release',
    manufacturer: 'Merck Marker (Pvt) Ltd',
    source: 'DRAP Registered 001928'
  },
  {
    id: 'med-09',
    product_name: 'Panadol 500mg Tablets',
    brand_name: 'Panadol',
    active_ingredient: 'Paracetamol',
    strength: '500 mg',
    dosage_form: 'Tablet',
    route: 'Oral',
    release_type: 'Immediate Release',
    manufacturer: 'Haleon / GSK Pakistan',
    source: 'DRAP Registered 000101'
  },
  {
    id: 'med-10',
    product_name: 'Vonoprazan 20mg Capsules',
    brand_name: 'Vonoprazan',
    active_ingredient: 'Vonoprazan Fumarate',
    strength: '20 mg',
    dosage_form: 'Capsule',
    route: 'Oral',
    release_type: 'Immediate Release',
    manufacturer: 'Sami Pharmaceuticals',
    source: 'DRAP Registered 091234'
  }
]

export const INITIAL_PHARMACIES = [
  {
    id: 'pharm-01',
    name: 'Prime Health Hub Pharmacy - DHA Phase 6',
    city: 'Lahore',
    address: 'Plaza 154, CCA 1, Sector C, DHA Phase 6, Lahore',
    latitude: 31.4705,
    longitude: 74.4352,
    phone: '042-35720011',
    status: 'active',
    rating: 4.9
  },
  {
    id: 'pharm-02',
    name: 'CareMeds Community Dispensary - Gulberg',
    city: 'Lahore',
    address: 'Main Boulevard, Near Liberty Roundabout, Gulberg III, Lahore',
    latitude: 31.5102,
    longitude: 74.3441,
    phone: '042-35759922',
    status: 'active',
    rating: 4.7
  },
  {
    id: 'pharm-03',
    name: 'Model Town Central Chemist',
    city: 'Lahore',
    address: 'Central Commercial Market, Block C, Model Town, Lahore',
    latitude: 31.4820,
    longitude: 74.3180,
    phone: '042-35848833',
    status: 'active',
    rating: 4.8
  }
]

export const INITIAL_INVENTORY = [
  // Pharmacy 1: DHA Phase 6 has Tirzee 12.5mg AVAILABLE
  {
    id: 'inv-01',
    pharmacy_id: 'pharm-01',
    medicine_id: 'med-01', // Tirzee 12.5mg
    quantity: 8,
    stock_status: 'available',
    last_updated: '10 minutes ago'
  },
  {
    id: 'inv-02',
    pharmacy_id: 'pharm-01',
    medicine_id: 'med-04', // Zanov 20mg
    quantity: 25,
    stock_status: 'available',
    last_updated: '15 minutes ago'
  },
  {
    id: 'inv-03',
    pharmacy_id: 'pharm-01',
    medicine_id: 'med-05', // Methix
    quantity: 18,
    stock_status: 'available',
    last_updated: '15 minutes ago'
  },
  // Pharmacy 2: Gulberg has Tirzee 12.5mg OUT OF STOCK
  {
    id: 'inv-04',
    pharmacy_id: 'pharm-02',
    medicine_id: 'med-01', // Tirzee 12.5mg
    quantity: 0,
    stock_status: 'out_of_stock',
    last_updated: '45 minutes ago'
  },
  {
    id: 'inv-05',
    pharmacy_id: 'pharm-02',
    medicine_id: 'med-04', // Zanov 20mg
    quantity: 14,
    stock_status: 'available',
    last_updated: '1 hour ago'
  },
  {
    id: 'inv-06',
    pharmacy_id: 'pharm-02',
    medicine_id: 'med-05', // Methix
    quantity: 4,
    stock_status: 'low_stock',
    last_updated: '30 minutes ago'
  },
  // Pharmacy 3: Model Town has LOW STOCK
  {
    id: 'inv-07',
    pharmacy_id: 'pharm-03',
    medicine_id: 'med-01', // Tirzee 12.5mg
    quantity: 2,
    stock_status: 'low_stock',
    last_updated: '2 hours ago'
  },
  {
    id: 'inv-08',
    pharmacy_id: 'pharm-03',
    medicine_id: 'med-04',
    quantity: 35,
    stock_status: 'available',
    last_updated: '10 minutes ago'
  }
]

export const INITIAL_PRESCRIPTIONS = []

export const INITIAL_MEDICATION_PLANS = []
export const INITIAL_SCHEDULES = []
export const INITIAL_LOGS = []
export const INITIAL_RESERVATIONS = []
export const INITIAL_CASES = []
export const INITIAL_NOTIFICATIONS = []

export const INITIAL_AUDIT_LOGS = []

// LocalStorage Persistence Engine
const STORAGE_KEY = 'medbridge_app_state_v2_clean'

export function getAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to load MedBridge local state:', err)
  }

  // Fallback to fresh initial state
  const freshState = {
    users: INITIAL_DEMO_USERS,
    medicines: INITIAL_MEDICINES,
    pharmacies: INITIAL_PHARMACIES,
    inventory: INITIAL_INVENTORY,
    prescriptions: INITIAL_PRESCRIPTIONS,
    medication_plans: INITIAL_MEDICATION_PLANS,
    schedules: INITIAL_SCHEDULES,
    logs: INITIAL_LOGS,
    reservations: INITIAL_RESERVATIONS,
    cases: INITIAL_CASES,
    notifications: INITIAL_NOTIFICATIONS,
    audit_logs: INITIAL_AUDIT_LOGS
  }
  saveAppState(freshState)
  return freshState
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save MedBridge local state:', err)
  }
}

export function resetDemoState() {
  localStorage.removeItem(STORAGE_KEY)
  const fresh = getAppState()
  return fresh
}
