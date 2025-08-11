'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { message } from 'antd'

interface WebSocketMessage {
  type: 'order_status_update' | 'new_order' | 'payment_received' | 'system_alert'
  data: any
  timestamp: number
}

interface UseWebSocketOptions {
  url?: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
  reconnect: () => void
  disconnect: () => void
}

export const useWebSocket = ({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  onMessage,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return
      }

      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        onConnect?.()
        message.success('اتصال برقرار شد')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const messageData: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(messageData)
          onMessage?.(messageData)

          // Handle different message types
          switch (messageData.type) {
            case 'new_order':
              message.info(`سفارش جدید: #${messageData.data.orderNumber}`)
              break
            case 'order_status_update':
              message.success(`وضعیت سفارش #${messageData.data.orderNumber} به‌روزرسانی شد`)
              break
            case 'payment_received':
              message.success(`پرداخت دریافت شد: ${messageData.data.amount.toLocaleString('fa-IR')} تومان`)
              break
            case 'system_alert':
              message.warning(messageData.data.message)
              break
          }
        } catch (error) {
          console.error('خطا در پردازش پیام WebSocket:', error)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
        
        // Auto-reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            message.warning(`تلاش برای اتصال مجدد... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
            connect()
          }, reconnectInterval)
        } else {
          message.error('اتصال برقرار نشد. لطفاً صفحه را تازه‌سازی کنید.')
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('خطا در WebSocket:', error)
        message.error('خطا در برقراری ارتباط')
      }

    } catch (error) {
      console.error('خطا در ایجاد اتصال WebSocket:', error)
      message.error('امکان برقراری ارتباط وجود ندارد')
    }
  }, [url, onMessage, onConnect, onDisconnect, reconnectInterval, maxReconnectAttempts])

  const sendMessage = useCallback((messageData: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...messageData,
        timestamp: Date.now()
      }))
    } else {
      message.warning('اتصال برقرار نیست')
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setLastMessage(null)
  }, [])

  useEffect(() => {
    // Only connect in client-side
    if (typeof window !== 'undefined') {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Mock WebSocket for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Simulate WebSocket messages in development
      const mockInterval = setInterval(() => {
        const mockMessages: WebSocketMessage[] = [
          {
            type: 'new_order',
            data: { orderNumber: Math.floor(Math.random() * 1000) + 1000 },
            timestamp: Date.now()
          },
          {
            type: 'order_status_update',
            data: { orderNumber: Math.floor(Math.random() * 1000) + 1000, status: 'ready' },
            timestamp: Date.now()
          },
          {
            type: 'payment_received',
            data: { amount: Math.floor(Math.random() * 500000) + 100000 },
            timestamp: Date.now()
          }
        ]

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        setLastMessage(randomMessage)
        onMessage?.(randomMessage)
      }, 15000) // Every 15 seconds

      return () => clearInterval(mockInterval)
    }
  }, [onMessage])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
    disconnect
  }
}
