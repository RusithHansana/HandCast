// src/hooks/useRaycasting.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { findIntersectedBulb } from '../utils/raycastUtils'

// Configuration for selection hold mechanism
const SELECTION_HOLD_DURATION = 3000 // 3 seconds in milliseconds

export default function useRaycasting(camera, landmarks, bulbRefs) {
    const [hitInfo, setHitInfo] = useState(null)
    const [pointing, setPointing] = useState(false)
    const lastHitIdRef = useRef(null)
    const selectionHoldRef = useRef(null) // Stores held selection info
    const holdTimeoutRef = useRef(null) // Timer for selection hold

    // Clear selection hold timeout
    const clearSelectionHold = useCallback(() => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current)
            holdTimeoutRef.current = null
        }
    }, [])

    // Set selection hold with timeout
    const setSelectionHold = useCallback((hitData) => {
        clearSelectionHold()
        selectionHoldRef.current = hitData

        holdTimeoutRef.current = setTimeout(() => {
            console.log(`⏱️ Selection hold expired for Bulb ${hitData.bulbId}`)
            selectionHoldRef.current = null
            holdTimeoutRef.current = null
            // If no current intersection, clear hit info
            if (!pointing) {
                setHitInfo(null)
            }
        }, SELECTION_HOLD_DURATION)

        console.log(`🔒 Holding selection for Bulb ${hitData.bulbId} for ${SELECTION_HOLD_DURATION / 1000} seconds`)
    }, [pointing, clearSelectionHold])

    // Get the index finger tip position (landmark 8)
    const getFingerTipPosition = useCallback(() => {
        if (!landmarks || !landmarks[8]) {
            return null
        }

        return {
            x: landmarks[8].x,
            y: landmarks[8].y,
            z: landmarks[8].z
        }
    }, [landmarks])

    // Perform raycasting and update hit information
    const performRaycast = useCallback(() => {
        const fingerTip = getFingerTipPosition()

        if (!camera || !fingerTip || !bulbRefs?.current) {
            setHitInfo(null)
            setPointing(false)
            lastHitIdRef.current = null
            return
        }

        // Get bulb hitbox meshes from refs (use larger hitboxes for easier targeting)
        const bulbMeshes = bulbRefs.current
            .filter(bulbRef => bulbRef && bulbRef.hitbox)
            .map(bulbRef => bulbRef.hitbox)

        if (bulbMeshes.length === 0) {
            setHitInfo(null)
            setPointing(false)
            lastHitIdRef.current = null
            return
        }

        // Perform intersection test
        // Flip X coordinate to correct camera mirroring
        const intersection = findIntersectedBulb(
            camera,
            1 - fingerTip.x,  // Flip X coordinate 
            fingerTip.y,
            bulbMeshes
        )

        if (intersection) {
            const newHitInfo = {
                bulbId: intersection.bulbId,
                object: intersection.object,
                point: intersection.point,
                distance: intersection.distance,
                fingerPosition: fingerTip
            }

            setHitInfo(newHitInfo)
            setPointing(true)

            // Log when hitting a new bulb
            if (lastHitIdRef.current !== intersection.bulbId) {
                console.log(`🎯 Pointing at Bulb ${intersection.bulbId}`)
                lastHitIdRef.current = intersection.bulbId

                // Start selection hold for this bulb
                setSelectionHold(newHitInfo)
            }
        } else {
            setPointing(false)

            // If we have a held selection and no current intersection, keep the held selection active
            if (selectionHoldRef.current) {
                // Use the held selection but update finger position for ray visualization
                const heldHitInfo = {
                    ...selectionHoldRef.current,
                    fingerPosition: fingerTip // Update finger position for ray visualization
                }
                setHitInfo(heldHitInfo)
                console.log(`🔒 Using held selection for Bulb ${selectionHoldRef.current.bulbId}`)
            } else {
                setHitInfo(null)
                // Log when no longer pointing at any bulb
                if (lastHitIdRef.current !== null) {
                    console.log('👆 No longer pointing at any bulb')
                    lastHitIdRef.current = null
                }
            }
        }
    }, [camera, getFingerTipPosition, bulbRefs, setSelectionHold])

    // Perform raycasting whenever landmarks change
    useEffect(() => {
        performRaycast()
    }, [performRaycast])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            clearSelectionHold()
        }
    }, [clearSelectionHold])

    // Manual raycast function for external use
    const raycast = useCallback(() => {
        performRaycast()
    }, [performRaycast])

    return {
        hitInfo,           // Current hit information { bulbId, object, point, distance, fingerPosition }
        pointing,          // Boolean: whether currently pointing at a bulb
        fingerPosition: getFingerTipPosition(), // Current finger tip position
        raycast,           // Manual raycast function
        isHoldingSelection: !!selectionHoldRef.current, // Boolean: whether using held selection
        selectionTimeRemaining: holdTimeoutRef.current ? SELECTION_HOLD_DURATION : 0 // Time remaining for held selection
    }
}
