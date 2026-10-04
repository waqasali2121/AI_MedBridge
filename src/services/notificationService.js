import { getAppState, saveAppState } from './mockData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const notificationService = {
  async notify({ userId, type, title, message, linkUrl = '' }) {
    const timestamp = new Date().toISOString()
    const notif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      type,
      title,
      message,
      link_url: linkUrl,
      read: false,
      created_at: timestamp
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').insert([{
          user_id: userId,
          type,
          title,
          message,
          link_url: linkUrl
        }])
      } catch (err) {
        console.warn('Supabase notification dispatch error:', err)
      }
    }

    // Update local state
    const state = getAppState()
    state.notifications = [notif, ...(state.notifications || [])]
    saveAppState(state)

    // Trigger browser notification if supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`MedBridge: ${title}`, {
          body: message,
          icon: '/favicon.ico'
        })
      } catch (err) {
        console.warn('Browser notification error:', err)
      }
    }

    return notif
  },

  async getUserNotifications(userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (!error && data) return data
      } catch (err) {
        console.warn('Falling back to local notifications:', err)
      }
    }

    const state = getAppState()
    return (state.notifications || []).filter(n => !userId || n.user_id === userId)
  },

  async markAsRead(notificationId) {
    const state = getAppState()
    state.notifications = (state.notifications || []).map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    saveAppState(state)

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)
      } catch (err) {
        console.warn('Supabase mark read error:', err)
      }
    }
  },

  async requestBrowserPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'unsupported'
  }
}
