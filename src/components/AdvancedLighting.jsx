import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AdvancedLighting() {
    const sunLightRef = useRef()
    const timeRef = useRef(0)

    // Animate lighting to simulate time of day changes
    useFrame((state, delta) => {
        timeRef.current += delta * 0.1 // Slow time progression

        if (sunLightRef.current) {
            // Subtle sun movement for dynamic shadows
            const sunAngle = Math.sin(timeRef.current) * 0.3
            sunLightRef.current.position.x = 3 + sunAngle
            sunLightRef.current.position.z = 2 + Math.cos(timeRef.current) * 0.5

            // Subtle intensity variation
            const baseIntensity = 1.2
            sunLightRef.current.intensity = baseIntensity + Math.sin(timeRef.current * 0.5) * 0.2
        }
    })

    return (
        <group name="advanced-lighting">
            {/* Enhanced ambient lighting with subtle color variation */}
            <ambientLight intensity={0.25} color="#f0f4f8" />

            {/* Main sunlight through window - animated */}
            <directionalLight
                ref={sunLightRef}
                position={[3, 8, 2]}
                intensity={1.2}
                color="#ffffcc"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={25}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.0001}
            />

            {/* Secondary fill light (bounced light from walls) */}
            <directionalLight
                position={[-2, 5, 4]}
                intensity={0.3}
                color="#e6f3ff"
                castShadow={false}
            />

            {/* Warm accent light from corner */}
            <pointLight
                position={[3, 2, 1]}
                intensity={0.4}
                color="#ffcc88"
                decay={2}
                distance={6}
                castShadow
                shadow-mapSize-width={512}
                shadow-mapSize-height={512}
            />

            {/* Subtle rim lighting */}
            <pointLight
                position={[-3, 1, -2]}
                intensity={0.2}
                color="#cce7ff"
                decay={2}
                distance={4}
            />

            {/* Floor bounce light (simulates light reflecting off floor) */}
            <hemisphereLight
                skyColor="#ffffff"
                groundColor="#8B7355"
                intensity={0.3}
            />

            {/* Subtle colored accent lights for atmosphere */}
            <pointLight
                position={[0, -1, -2.5]}
                intensity={0.1}
                color="#ff9999"
                decay={3}
                distance={2}
            />

            <pointLight
                position={[2, 0.5, 2]}
                intensity={0.08}
                color="#99ff99"
                decay={3}
                distance={1.5}
            />
        </group>
    )
}
