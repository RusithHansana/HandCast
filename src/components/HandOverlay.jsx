// src/components/HandOverlay.jsx
import { useRef, useEffect } from 'react'

export default function HandOverlay({ landmarks, connectionStatus }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const { width, height } = canvas

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Draw connection status
        ctx.fillStyle = connectionStatus === 'connected' ? '#22c55e' : '#ef4444'
        ctx.fillRect(10, 10, 10, 10)
        ctx.fillStyle = '#ffffff'
        ctx.font = '14px monospace'
        ctx.fillText(`Status: ${connectionStatus}`, 30, 20)

        if (!landmarks) {
            ctx.fillText('No hand detected', 30, 45)
            return
        }

        // Draw landmarks
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * width
            const y = landmark.y * height

            // Draw landmark point
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fillStyle = '#ffeb3b'
            ctx.fill()

            // Draw landmark number for key points
            if ([0, 4, 8, 12, 16, 20].includes(index)) {
                ctx.fillStyle = '#ffffff'
                ctx.font = '10px monospace'
                ctx.fillText(index.toString(), x + 5, y - 5)
            }
        })

        // Draw connections between landmarks (simplified)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],       // Index finger
            [5, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
            [13, 17], [17, 18], [18, 19], [19, 20] // Pinky
        ]

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start]
            const endPoint = landmarks[end]

            ctx.beginPath()
            ctx.moveTo(startPoint.x * width, startPoint.y * height)
            ctx.lineTo(endPoint.x * width, endPoint.y * height)
            ctx.stroke()
        })

        // Highlight fingertip (index finger tip - landmark 8)
        const fingertip = landmarks[8]
        if (fingertip) {
            ctx.beginPath()
            ctx.arc(fingertip.x * width, fingertip.y * height, 8, 0, 2 * Math.PI)
            ctx.strokeStyle = '#ff0000'
            ctx.lineWidth = 2
            ctx.stroke()

            // Add text label
            ctx.fillStyle = '#ff0000'
            ctx.font = '12px monospace'
            ctx.fillText('FINGERTIP', fingertip.x * width + 10, fingertip.y * height - 10)
        }
    }, [landmarks, connectionStatus])

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={200}
            style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                border: '2px solid #333',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 1000
            }}
        />
    )
}
