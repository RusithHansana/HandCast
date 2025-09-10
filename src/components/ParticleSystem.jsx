import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleSystem({ count = 100, speed = 0.01, size = 0.02 }) {
    const meshRef = useRef()
    const timeRef = useRef(0)

    // Generate random particle positions and properties
    const particleData = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const opacities = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // Position particles in room bounds
            positions[i * 3] = (Math.random() - 0.5) * 7     // x: -3.5 to 3.5
            positions[i * 3 + 1] = Math.random() * 3.5 - 0.5 // y: -0.5 to 3
            positions[i * 3 + 2] = (Math.random() - 0.5) * 5 // z: -2.5 to 2.5

            // Random slow velocities (dust particles floating)
            velocities[i * 3] = (Math.random() - 0.5) * speed * 0.3
            velocities[i * 3 + 1] = Math.random() * speed * 0.5 + speed * 0.2 // Slight upward drift
            velocities[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.3

            // Random sizes and opacities
            sizes[i] = Math.random() * size + size * 0.5
            opacities[i] = Math.random() * 0.3 + 0.1 // Very subtle
        }

        return { positions, velocities, sizes, opacities }
    }, [count, speed, size])

    // Animate particles
    useFrame((state, delta) => {
        if (!meshRef.current) return

        timeRef.current += delta
        const positions = meshRef.current.geometry.attributes.position.array
        const { velocities } = particleData

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Update positions
            positions[i3] += velocities[i3] * delta * 60
            positions[i3 + 1] += velocities[i3 + 1] * delta * 60
            positions[i3 + 2] += velocities[i3 + 2] * delta * 60

            // Boundary checking - wrap particles around room
            if (positions[i3] > 3.5) positions[i3] = -3.5
            if (positions[i3] < -3.5) positions[i3] = 3.5
            if (positions[i3 + 1] > 3) positions[i3 + 1] = -0.5
            if (positions[i3 + 1] < -0.5) positions[i3 + 1] = 3
            if (positions[i3 + 2] > 2.5) positions[i3 + 2] = -2.5
            if (positions[i3 + 2] < -2.5) positions[i3 + 2] = 2.5
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particleData.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={particleData.sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-opacity"
                    count={count}
                    array={particleData.opacities}
                    itemSize={1}
                />
            </bufferGeometry>

            <pointsMaterial
                size={size}
                sizeAttenuation={true}
                transparent={true}
                opacity={0.6}
                color="#ffffff"
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                vertexColors={false}
            />
        </points>
    )
}
