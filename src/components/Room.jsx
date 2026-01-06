import * as THREE from 'three'
import { useRef } from 'react'

export default function Room() {
    const roomRef = useRef()

    // Room dimensions
    const roomWidth = 8
    const roomHeight = 4
    const roomDepth = 6
    const wallThickness = 0.1

    return (
        <group ref={roomRef} name="room">
            {/* Floor */}
            <mesh position={[0, -roomHeight / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[roomWidth, wallThickness, roomDepth]} />
                <meshStandardMaterial
                    color="#8B4513"
                    roughness={0.8}
                    metalness={0.1}
                    // Enhanced for better shadow reception
                    shadowSide={THREE.FrontSide}
                />
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, roomHeight / 2, 0]} receiveShadow>
                <boxGeometry args={[roomWidth, wallThickness, roomDepth]} />
                <meshStandardMaterial
                    color="#F5F5F5"
                    roughness={0.9}
                    metalness={0.0}
                />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 0, -roomDepth / 2]} receiveShadow>
                <boxGeometry args={[roomWidth, roomHeight, wallThickness]} />
                <meshStandardMaterial
                    color="#E6E6FA"
                    roughness={0.8}
                    metalness={0.0}
                />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-roomWidth / 2, 0, 0]} receiveShadow>
                <boxGeometry args={[wallThickness, roomHeight, roomDepth]} />
                <meshStandardMaterial
                    color="#F0F8FF"
                    roughness={0.8}
                    metalness={0.0}
                />
            </mesh>

            {/* Right Wall */}
            <mesh position={[roomWidth / 2, 0, 0]} receiveShadow>
                <boxGeometry args={[wallThickness, roomHeight, roomDepth]} />
                <meshStandardMaterial
                    color="#F0F8FF"
                    roughness={0.8}
                    metalness={0.0}
                />
            </mesh>

            {/* Window frame on back wall */}
            <group position={[0, 0.5, -roomDepth / 2 + 0.01]}>
                {/* Window glass */}
                <mesh>
                    <planeGeometry args={[2, 1.5]} />
                    <meshPhysicalMaterial
                        color="#87CEEB"
                        transparent
                        opacity={0.3}
                        transmission={0.9}
                        roughness={0.0}
                        metalness={0.0}
                        ior={1.5}
                    />
                </mesh>

                {/* Window frame */}
                <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(2, 1.5)]} />
                    <lineBasicMaterial color="#8B4513" linewidth={3} />
                </lineSegments>
            </group>

            {/* Baseboards */}
            {/* Back wall baseboard */}
            <mesh position={[0, -roomHeight / 2 + 0.1, -roomDepth / 2 + 0.01]}>
                <boxGeometry args={[roomWidth - 0.2, 0.2, 0.05]} />
                <meshStandardMaterial color="#654321" roughness={0.6} />
            </mesh>

            {/* Left wall baseboard */}
            <mesh position={[-roomWidth / 2 + 0.01, -roomHeight / 2 + 0.1, 0]}>
                <boxGeometry args={[0.05, 0.2, roomDepth - 0.2]} />
                <meshStandardMaterial color="#654321" roughness={0.6} />
            </mesh>

            {/* Right wall baseboard */}
            <mesh position={[roomWidth / 2 - 0.01, -roomHeight / 2 + 0.1, 0]}>
                <boxGeometry args={[0.05, 0.2, roomDepth - 0.2]} />
                <meshStandardMaterial color="#654321" roughness={0.6} />
            </mesh>

            {/* Some furniture for ambiance */}
            {/* Simple table in corner */}
            <group position={[-2.5, -1.5, -2]}>
                {/* Table top */}
                <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                    <boxGeometry args={[1.2, 0.05, 0.8]} />
                    <meshStandardMaterial color="#D2691E" roughness={0.4} metalness={0.1} />
                </mesh>

                {/* Table legs */}
                {[[-0.5, 0, -0.3], [0.5, 0, -0.3], [-0.5, 0, 0.3], [0.5, 0, 0.3]].map((pos, i) => (
                    <mesh key={i} position={pos} castShadow>
                        <cylinderGeometry args={[0.03, 0.03, 0.7]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.6} />
                    </mesh>
                ))}
            </group>

            {/* Simple chair */}
            <group position={[2, -1.5, -1.5]}>
                {/* Seat */}
                <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.5, 0.05, 0.5]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.5} />
                </mesh>

                {/* Backrest */}
                <mesh position={[0, 0.8, -0.22]} castShadow receiveShadow>
                    <boxGeometry args={[0.5, 0.7, 0.06]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.5} />
                </mesh>

                {/* Chair legs */}
                {[[-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2]].map((pos, i) => (
                    <mesh key={i} position={pos} castShadow>
                        <cylinderGeometry args={[0.025, 0.025, 0.45]} />
                        <meshStandardMaterial color="#654321" roughness={0.6} />
                    </mesh>
                ))}
            </group>

            {/* Wall picture frame */}
            <group position={[2.5, 0.5, -2.99]}>
                <mesh>
                    <planeGeometry args={[1, 0.7]} />
                    <meshStandardMaterial color="#4682B4" roughness={0.3} />
                </mesh>

                {/* Frame border */}
                <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(1.1, 0.8)]} />
                    <lineBasicMaterial color="#DAA520" linewidth={2} />
                </lineSegments>
            </group>
        </group>
    )
}
