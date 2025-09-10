import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Audio manager that handles user interaction requirements
 */
class AudioManager {
    constructor() {
        this.audioContext = null
        this.isInitialized = false
        this.sounds = new Map()
        this.userInteracted = false
    }

    async initialize() {
        if (this.isInitialized) return true

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

            // Load click sound
            await this.loadSound('click', '/sounds/click.wav')

            this.isInitialized = true
            console.log('🔊 Audio system initialized')
            return true
        } catch (error) {
            console.warn('Audio system initialization failed:', error)
            return false
        }
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
            this.sounds.set(name, audioBuffer)
        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error)
        }
    }

    async playSound(name, volume = 0.7) {
        if (!this.isInitialized || !this.userInteracted) {
            console.log('Audio system not ready or user hasn\'t interacted yet')
            return false
        }

        const audioBuffer = this.sounds.get(name)
        if (!audioBuffer) {
            console.warn(`Sound ${name} not found`)
            return false
        }

        try {
            const source = this.audioContext.createBufferSource()
            const gainNode = this.audioContext.createGain()

            source.buffer = audioBuffer
            gainNode.gain.value = volume

            source.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            source.start()
            return true
        } catch (error) {
            console.warn(`Failed to play sound ${name}:`, error)
            return false
        }
    }

    enableUserInteraction() {
        this.userInteracted = true
        console.log('🎵 User interaction enabled for audio')
    }
}

// Global audio manager instance
const audioManager = new AudioManager()

/**
 * Hook for managing audio in the application
 */
export default function useAudio() {
    const [isReady, setIsReady] = useState(false)
    const [userInteracted, setUserInteracted] = useState(false)
    const initializingRef = useRef(false)

    // Initialize audio system
    const initializeAudio = useCallback(async () => {
        if (initializingRef.current || audioManager.isInitialized) return

        initializingRef.current = true
        const success = await audioManager.initialize()
        setIsReady(success)
        initializingRef.current = false
    }, [])

    // Enable user interaction (call this on first user click/touch)
    const enableUserInteraction = useCallback(() => {
        if (!userInteracted) {
            audioManager.enableUserInteraction()
            setUserInteracted(true)
        }
    }, [userInteracted])

    // Play sound function
    const playSound = useCallback(async (name, volume = 0.7) => {
        if (!userInteracted) {
            enableUserInteraction()
        }
        return await audioManager.playSound(name, volume)
    }, [userInteracted, enableUserInteraction])

    // Auto-initialize on mount
    useEffect(() => {
        initializeAudio()
    }, [initializeAudio])

    return {
        isReady,
        userInteracted,
        playSound,
        enableUserInteraction,
        initializeAudio
    }
}
