import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, forwardRef, useImperativeHandle, useState } from 'react'
import * as THREE from 'three'
import RayVisualizer from './RayVisualizer'
import Room from './Room'

// Preload audio outside component to avoid re-creation
let clickAudio = null
try {
    clickAudio = new Audio('/sounds/click.wav')
    clickAudio.volume = 0.7
    clickAudio.preload = 'auto'
} catch (error) {
    console.warn('Could not preload audio:', error)
}

const Bulb = forwardRef(({ id, position, onToggle, isPointed = false }, ref) => {
    const [on, setOn] = useState(false)
    const meshRef = useRef()

    const playClickSound = async () => {
        try {
            if (clickAudio) {
                clickAudio.currentTime = 0
                console.log('Playing sound for bulb', id)
                await clickAudio.play()
            }
        } catch (error) {
            console.warn('Could not play sound:', error)
            // Fallback: create new audio instance
            try {
                const audio = new Audio('/sounds/click.wav')
                audio.volume = 0.7
                await audio.play()
            } catch (fallbackError) {
                console.warn('Fallback audio also failed:', fallbackError)
            }
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
        isOn: on
    }))

    return (
        <group position={position}>
            {/* Light Fixture Base */}
            <mesh position={[0, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.1, 0.2, 8]} />
                <meshStandardMaterial 
                    color="#404040" 
                    roughness={0.3}
                    metalness={0.8}
                />
            </mesh>

            {/* Main Bulb */}
            <mesh
                ref={meshRef}
                position={[0, -0.1, 0]}
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

            {/* Light emission when bulb is on */}
            {on && (
                <pointLight
                    position={[0, -0.1, 0]}
                    intensity={1.5}
                    distance={6}
                    decay={2}
                    color="#fff8dc"
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
            )}

            {/* Outline effect when pointed at */}
            {isPointed && (
                <mesh position={[0, -0.1, 0]} scale={[1.15, 1.15, 1.15]}>
                    <sphereGeometry args={[0.2, 32, 32]} />
                    <meshBasicMaterial
                        color={on ? "#ffffff" : "#00ff88"}
                        transparent
                        opacity={0.15}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Hanging cord */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
                <meshStandardMaterial color="#333333" roughness={0.8} />
            </mesh>
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
    const handleBulbToggle = (bulbId) => {
        console.log(`Bulb ${bulbId} toggled`)
    }

    return (
        <Canvas
            camera={{ position: [0, 1.2, 2.5], fov: 65 }}
            style={{ width: '100vw', height: '100vh' }}
            shadows
            onCreated={({ camera, gl }) => {
                // Enable shadows
                gl.shadowMap.enabled = true
                gl.shadowMap.type = THREE.PCFSoftShadowMap
                
                // Enhance rendering
                gl.toneMapping = THREE.ACESFilmicToneMapping
                gl.toneMappingExposure = 1.2
                
                if (onCameraReady) {
                    onCameraReady(camera)
                }
            }}
        >
            {/* Enhanced ambient lighting for realistic room illumination */}
            <ambientLight intensity={0.3} color="#f0f0f0" />

            {/* Main directional light (sunlight through window) */}
            <directionalLight
                position={[3, 8, 2]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={20}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                color="#ffffcc"
            />

            {/* Secondary fill light */}
            <directionalLight
                position={[-2, 5, 4]}
                intensity={0.4}
                color="#e6f3ff"
            />

            {/* Warm accent light from the side */}
            <pointLight 
                position={[3, 2, 1]} 
                intensity={0.6} 
                color="#ffcc88"
                decay={2}
                distance={8}
            />

            {/* Room Environment */}
            <Room />

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
            />

            {/* Smart bulbs positioned as ceiling lights in room */}
            {[[-2, 1.8, -1], [0, 1.8, 0], [2, 1.8, 1]].map((position, index) => (
                <Bulb
                    key={index}
                    id={index + 1}
                    position={position}
                    isPointed={pointedBulbId === index + 1}
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
    )
}
