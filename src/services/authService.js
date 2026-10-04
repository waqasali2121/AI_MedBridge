import { getAppState, saveAppState, INITIAL_DEMO_USERS } from './mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const authService = {
  async getCurrentUser() {
    const raw = localStorage.getItem('medbridge_current_user')
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch (e) {
        console.warn('Error parsing cached user:', e)
      }
    }

    // Default to Patient demo user for immediate zero-config walkthrough
    const defaultUser = INITIAL_DEMO_USERS[0]
    localStorage.setItem('medbridge_current_user', JSON.stringify(defaultUser))
    return defaultUser
  },

  async login({ email, password }) {
    // 1. Check if matches demo users first
    const demoUser = INITIAL_DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (demoUser) {
      localStorage.setItem('medbridge_current_user', JSON.stringify(demoUser))
      return { user: demoUser, error: null }
    }

    // 2. Check Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { user: null, error: error.message }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single()

      const loggedUser = profile || {
        id: data.user.id,
        email: data.user.email,
        role: 'patient',
        full_name: data.user.email.split('@')[0]
      }

      localStorage.setItem('medbridge_current_user', JSON.stringify(loggedUser))
      return { user: loggedUser, error: null }
    }

    return { user: null, error: 'Invalid credentials. Please use one of the demo accounts or configure Supabase.' }
  },

  async register({ email, password, fullName, role = 'patient', phone = '' }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, phone }
        }
      })
      if (error) return { user: null, error: error.message }

      // Insert profile
      if (data.user) {
        const newProfile = {
          id: data.user.id,
          auth_user_id: data.user.id,
          full_name: fullName,
          email,
          phone,
          role,
          language: 'en'
        }
        await supabase.from('profiles').insert([newProfile])
        localStorage.setItem('medbridge_current_user', JSON.stringify(newProfile))
        return { user: newProfile, error: null }
      }
    }

    // Local registration fallback
    const newUser = {
      id: `user-${Date.now()}`,
      auth_user_id: `auth-${Date.now()}`,
      email,
      full_name: fullName,
      phone,
      role,
      language: 'en',
      patient_details: role === 'patient' ? {
        mrn: `0000${Math.floor(1000 + Math.random() * 9000)}`,
        date_of_birth: '1990-01-01',
        gender: 'Other',
        allergies: [],
        current_medications: ''
      } : null
    }

    const state = getAppState()
    state.users = [newUser, ...(state.users || [])]
    saveAppState(state)

    localStorage.setItem('medbridge_current_user', JSON.stringify(newUser))
    return { user: newUser, error: null }
  },

  async logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signOut error:', err)
      }
    }
    localStorage.removeItem('medbridge_current_user')
  },

  /**
   * Switch between the 5 demo accounts instantly
   */
  async switchDemoRole(role) {
    const target = INITIAL_DEMO_USERS.find(u => u.role === role) || INITIAL_DEMO_USERS[0]
    localStorage.setItem('medbridge_current_user', JSON.stringify(target))
    return target
  }
}
