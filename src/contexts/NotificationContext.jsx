import React, { createContext, useContext, useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    const list = await notificationService.getUserNotifications(user.id)
    setNotifications(list)
    setUnreadCount(list.filter(n => !n.read).length)
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 8000)
    return () => clearInterval(interval)
  }, [user])

  const markAsRead = async (id) => {
    await notificationService.markAsRead(id)
    await loadNotifications()
  }

  const requestBrowserPermission = async () => {
    return await notificationService.requestBrowserPermission()
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      refreshNotifications: loadNotifications,
      markAsRead,
      requestBrowserPermission
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
