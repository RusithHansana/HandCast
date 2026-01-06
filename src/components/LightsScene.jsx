import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, forwardRef, useImperativeHandle, useState } from 'react'
import * as THREE from 'three'
import RayVisualizer from './RayVisualizer'
import Room from './Room'
import ParticleSystem from './ParticleSystem'
import Skybox from './Skybox'
import AdvancedLighting from './AdvancedLighting'
import useAudio from '../hooks/useAudio'

const Bulb = forwardRef(({ id, position, onToggle, isPointed = false, isCeiling = false }, ref) => {
    const [on, setOn] = useState(false)
    const meshRef = useRef()
    const hitboxRef = useRef()
    const { playSound } = useAudio()

    const playClickSound = async () => {
        try {
            const success = await playSound('click', 0.7)
            if (success) {
                console.log('🔊 Playing sound for bulb', id)
            } else {
                console.log('🔇 Audio not ready or user interaction needed')
            }
        } catch (error) {
            console.warn('Audio playback failed:', error)
        }
    }

    useImperativeHandle(ref, () => ({
        toggle: () => {
            setOn(prevOn => {
                const newOn = !prevOn
                playClickSound()
                return newOn
            })
        },
        id,
        mesh: meshRef.current,
        hitbox: hitboxRef.current, // Add reference to hitbox
        isOn: on
    }))

    return (
        <group position={position}>
            {/* Different fixture based on mounting type */}
            {isCeiling ? (
                // Ceiling Light Fixture
                <>
                    <mesh position={[0, 0.1, 0]} castShadow>
                        <cylinderGeometry args={[0.15, 0.1, 0.2, 8]} />
                        <meshStandardMaterial
                            color="#404040"
                            roughness={0.3}
                            metalness={0.8}
                        />
                    </mesh>

                    {/* Hanging cord */}
                    <mesh position={[0, 0.3, 0]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
                        <meshStandardMaterial color="#333333" roughness={0.8} />
                    </mesh>
                </>
            ) : (
                // Wall Sconce Fixture
                <>
                    {/* Wall mount bracket */}
                    <mesh position={[0, 0, 0.1]} castShadow>
                        <boxGeometry args={[0.3, 0.15, 0.1]} />
                        <meshStandardMaterial
                            color="#2c2c2c"
                            roughness={0.4}
                            metalness={0.6}
                        />
                    </mesh>

                    {/* Decorative arm */}
                    <mesh position={[0, -0.1, 0.05]} castShadow>
                        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                        <meshStandardMaterial color="#404040" roughness={0.3} />
                    </mesh>
                </>
            )}

            {/* Main Bulb */}
            <mesh
                ref={meshRef}
                position={isCeiling ? [0, -0.1, 0] : [0, -0.15, 0]}
                userData={{ id }}
                onClick={() => {
                    setOn(prev => {
                        const newOn = !prev
                        playClickSound()
                        onToggle?.(id)
                        return newOn
                    })
                }}
                castShadow
            >
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial
                    color={on ? '#fff8dc' : '#f5f5f5'}
                    emissive={on ? '#ffeb3b' : isPointed ? '#00ff88' : '#000000'}
                    emissiveIntensity={on ? 0.6 : isPointed ? 0.2 : 0}
                    roughness={0.2}
                    metalness={0.1}
                    transparent={!on}
                    opacity={on ? 1.0 : 0.8}
                />
            </mesh>

            {/* Invisible larger hitbox for easier targeting */}
            <mesh
                ref={hitboxRef}
                position={isCeiling ? [0, -0.1, 0] : [0, -0.15, 0]}
                userData={{ id }}
                visible={false}
            >
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Light emission when bulb is on */}
            {on && (
                <pointLight
                    position={isCeiling ? [0, -0.1, 0] : [0, -0.15, 0]}
                    intensity={isCeiling ? 2.0 : 1.2}
                    distance={isCeiling ? 8 : 5}
                    decay={2}
                    color="#fff8dc"
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
            )}

            {/* Outline effect when pointed at */}
            {isPointed && (
                <>
                    {/* Main bulb outline */}
                    <mesh
                        position={isCeiling ? [0, -0.1, 0] : [0, -0.15, 0]}
                        scale={[1.15, 1.15, 1.15]}
                    >
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshBasicMaterial
                            color={on ? "#ffffff" : "#00ff88"}
                            transparent
                            opacity={0.15}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Hitbox visualization (subtle wireframe) */}
                    <mesh
                        position={isCeiling ? [0, -0.1, 0] : [0, -0.15, 0]}
                    >
                        <sphereGeometry args={[0.4, 16, 16]} />
                        <meshBasicMaterial
                            color="#00ff88"
                            transparent
                            opacity={0.05}
                            wireframe
                        />
                    </mesh>
                </>
            )}
        </group>
    )
})

Bulb.displayName = 'Bulb'

export default function LightsScene({
    bulbRefs,
    onCameraReady,
    pointedBulbId = null,
    fingerPosition = null,
    pointing = false
}) {
    const { enableUserInteraction } = useAudio()

    const handleBulbToggle = (bulbId) => {
        // Enable audio on first interaction
        enableUserInteraction()
        console.log(`Bulb ${bulbId} toggled`)
    }

    return (
        <div
            style={{ width: '100vw', height: '100vh' }}
            onClick={enableUserInteraction}
            onTouchStart={enableUserInteraction}
        >
            <Canvas
                camera={{ position: [0, 1.2, 2.5], fov: 65 }}
                style={{ width: '100%', height: '100%' }}
                shadows
                onCreated={({ camera, gl, scene }) => {
                    // Enhanced shadow mapping
                    gl.shadowMap.enabled = true
                    gl.shadowMap.type = THREE.PCFSoftShadowMap
                    gl.shadowMap.autoUpdate = true

                    // Enhanced rendering settings
                    gl.toneMapping = THREE.ACESFilmicToneMapping
                    gl.toneMappingExposure = 1.0
                    gl.outputColorSpace = THREE.SRGBColorSpace

                    // Anti-aliasing and quality improvements
                    gl.antialias = true
                    gl.pixelRatio = Math.min(window.devicePixelRatio, 2)

                    // Add subtle fog for depth
                    scene.fog = new THREE.Fog('#f0f4f8', 8, 20)

                    // Background color fallback
                    scene.background = new THREE.Color('#f0f4f8')

                    if (onCameraReady) {
                        onCameraReady(camera)
                    }
                }}
            >
                {/* Skybox for realistic background */}
                <Skybox />

                {/* Advanced dynamic lighting system */}
                <AdvancedLighting />

                {/* Room Environment */}
                <Room />

                {/* Ambient particle system */}
                <ParticleSystem count={80} speed={0.008} size={0.015} />

                {/* Orbit controls - enhance for room navigation */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={2}
                    maxDistance={8}
                    minPolarAngle={Math.PI / 8}
                    maxPolarAngle={Math.PI / 2.1}
                    maxAzimuthAngle={Math.PI / 3}
                    minAzimuthAngle={-Math.PI / 3}
                    enableDamping={true}
                    dampingFactor={0.05}
                />

                {/* Smart bulbs - one ceiling light and two wall sconces */}
                {[
                    [0, 1.8, 0],      // Ceiling bulb (center)
                    [-3.5, 0.8, -2.5], // Left wall bulb  
                    [3.5, 0.8, -2.5]   // Right wall bulb
                ].map((position, index) => (
                    <Bulb
                        key={index}
                        id={index + 1}
                        position={position}
                        isPointed={pointedBulbId === index + 1}
                        isCeiling={index === 0} // First bulb is ceiling mounted
                        ref={(el) => {
                            if (bulbRefs && bulbRefs.current) {
                                bulbRefs.current[index] = el
                            }
                        }}
                        onToggle={handleBulbToggle}
                    />
                ))}

                {/* Enhanced ray visualization */}
                {fingerPosition && (
                    <RayVisualizer
                        fingerPosition={fingerPosition}
                        visible={true}
                        color={pointing ? 0x00ccff : 0x00ffcc}
                        length={8}
                    />
                )}
            </Canvas>
        </div>
    )
}
