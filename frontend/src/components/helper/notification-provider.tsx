"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { Notification, type NotificationType } from "./notification"

// Define the context type
type NotificationContextType = {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
  hideNotification: () => void
}

// Create the context with a default value
const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  hideNotification: () => {},
})

// Hook to use the notification context
export const useNotification = () => useContext(NotificationContext)

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<{
    type: NotificationType
    message: string
    isVisible: boolean
    duration: number
  }>({
    type: "success",
    message: "",
    isVisible: false,
    duration: 10000,
  })

  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    setNotification({
      type,
      message,
      isVisible: true,
      duration,
    })
  }

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </NotificationContext.Provider>
  )
}
