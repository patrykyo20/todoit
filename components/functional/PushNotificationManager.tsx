'use client'

import { useState, useEffect, FC, useCallback } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/actions/pushNotificationAction'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

interface PushNotificationManagerProps {
  className?: string
}

export const PushNotificationManager: FC<PushNotificationManagerProps> = ({
  className,
}) => {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<globalThis.PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [registerServiceWorker])

  async function subscribeToPush() {
    try {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        alert('VAPID public key is not configured')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    } catch (error) {
      console.error('Subscription failed:', error)
      alert('Failed to subscribe to push notifications')
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (error) {
      console.error('Unsubscription failed:', error)
    }
  }

  async function sendTestNotification() {
    if (subscription && message) {
      try {
        await sendNotification(message)
        setMessage('')
      } catch (error) {
        console.error('Failed to send notification:', error)
        alert('Failed to send notification')
      }
    }
  }

  if (!isSupported) {
    return (
      <div className={className}>
        <p>Push notifications are not supported in this browser.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
      {subscription ? (
        <div className="space-y-4">
          <p className="text-green-600 dark:text-green-400">
            You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Unsubscribe
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendTestNotification()
                }
              }}
            />
            <button
              onClick={sendTestNotification}
              disabled={!message}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Test
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p>You are not subscribed to push notifications.</p>
          <button
            onClick={subscribeToPush}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Subscribe
          </button>
        </div>
      )}
    </div>
  )
}