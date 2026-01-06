// src/hooks/useHandPython.js
import { useEffect, useState, useCallback, useRef } from 'react'

export default function useHandPython() {
    const [landmarks, setLandmarks] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const [error, setError] = useState(null)
    const [frameCount, setFrameCount] = useState(0)
    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)
    const maxReconnectAttempts = 5
    const reconnectAttemptsRef = useRef(0)

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return // Already connected
        }

        console.log('Connecting to hand tracking WebSocket...')
        setConnectionStatus('connecting')
        setError(null)

        try {
            const ws = new WebSocket('ws://localhost:8000/ws')
            wsRef.current = ws

            ws.onopen = () => {
                console.log('✅ WebSocket connected to hand tracking server')
                setConnectionStatus('connected')
                setError(null)
                reconnectAttemptsRef.current = 0
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.error) {
                        setError(data.error)
                        setLandmarks(null)
                        return
                    }

                    setLandmarks(data.landmarks)
                    setFrameCount(data.frame_count || 0)

                    // Log every 60 frames to avoid spam
                    if (data.frame_count && data.frame_count % 60 === 0) {
                        console.log(`📊 Processed ${data.frame_count} frames, Hand detected: ${data.landmarks ? '✅' : '❌'}`)
                    }
                } catch (parseError) {
                    console.warn('Failed to parse WebSocket message:', parseError)
                }
            }

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error)
                setError('WebSocket connection error')
                setConnectionStatus('error')
            }

            ws.onclose = (event) => {
                console.log('🔌 WebSocket connection closed:', event.code, event.reason)
                setConnectionStatus('disconnected')
                setLandmarks(null)
                wsRef.current = null

                // Attempt to reconnect if not manually closed
                if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current += 1
                    console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect()
                    }, 2000 * reconnectAttemptsRef.current) // Exponential backoff
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    setError('Max reconnection attempts reached. Please refresh the page.')
                }
            }
        } catch (connectionError) {
            console.error('Failed to create WebSocket connection:', connectionError)
            setConnectionStatus('error')
            setError('Failed to connect to hand tracking server')
        }
    }, [])

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        if (wsRef.current) {
            console.log('🔌 Manually disconnecting WebSocket')
            wsRef.current.close(1000, 'Manual disconnect')
            wsRef.current = null
        }

        setConnectionStatus('disconnected')
        setLandmarks(null)
        setError(null)
        reconnectAttemptsRef.current = 0
    }, [])

    useEffect(() => {
        connect()

        // Cleanup on unmount
        return () => {
            disconnect()
        }
    }, [connect, disconnect])

    // Return the hook's state and methods
    return {
        landmarks,           // Array of 21 hand landmarks or null
        connectionStatus,    // 'connecting' | 'connected' | 'disconnected' | 'error'
        error,              // Error message string or null
        frameCount,         // Number of frames processed
        reconnect: connect, // Manual reconnect function
        disconnect         // Manual disconnect function
    }
}
