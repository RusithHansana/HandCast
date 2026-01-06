import { useRef } from 'react'
import * as THREE from 'three'

export default function Skybox() {
    const skyboxRef = useRef()

    // Create a gradient texture for the skybox
    const createSkyTexture = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        const context = canvas.getContext('2d')

        // Create vertical gradient from light blue to darker blue/grey
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#87CEEB')    // Sky blue at top
        gradient.addColorStop(0.3, '#B0E0E6')  // Powder blue
        gradient.addColorStop(0.7, '#F0F8FF')  // Alice blue
        gradient.addColorStop(1, '#F5F5F5')    // White smoke at bottom

        context.fillStyle = gradient
        context.fillRect(0, 0, canvas.width, canvas.height)

        // Add subtle cloud-like texture
        context.globalAlpha = 0.1
        context.fillStyle = '#ffffff'

        // Simple cloud shapes
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height * 0.6 // Clouds in upper portion
            const radius = Math.random() * 40 + 20

            context.beginPath()
            context.arc(x, y, radius, 0, Math.PI * 2)
            context.fill()
        }

        return new THREE.CanvasTexture(canvas)
    }

    const skyTexture = createSkyTexture()

    return (
        <mesh ref={skyboxRef}>
            <sphereGeometry args={[50, 32, 32]} />
            <meshBasicMaterial
                map={skyTexture}
                side={THREE.BackSide} // Render inside the sphere
                fog={false} // Don't apply fog to skybox
            />
        </mesh>
    )
}
