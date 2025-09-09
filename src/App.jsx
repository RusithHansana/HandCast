import { useRef } from 'react'
import LightsScene from './components/LightsScene'
import HandOverlay from './components/HandOverlay'
import useHandPython from './hooks/useHandPython'

function App() {
  const bulbRefs = useRef([])
  const cameraRef = useRef(null)

  // Connect to Python backend for hand tracking
  const { landmarks, connectionStatus, error, frameCount, reconnect } = useHandPython()

  const handleCameraReady = (camera) => {
    cameraRef.current = camera
    console.log('Camera ready:', camera)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <LightsScene
        bulbRefs={bulbRefs}
        onCameraReady={handleCameraReady}
      />

      {/* Hand tracking visualization */}
      <HandOverlay
        landmarks={landmarks}
        connectionStatus={connectionStatus}
      />

      {/* Debug info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '250px'
      }}>
        <div style={{ color: '#ffeb3b', fontWeight: 'bold', marginBottom: '8px' }}>
          DAY 2: Hand Tracking Integration
        </div>
        <div>Click bulbs to toggle them!</div>
        <div>Camera: {cameraRef.current ? '✅ Ready' : '⏳ Loading...'}</div>
        <div>Bulbs: {bulbRefs.current?.length || 0}/3 loaded</div>

        <hr style={{ margin: '8px 0', borderColor: '#444' }} />

        <div>Backend: <span style={{
          color: connectionStatus === 'connected' ? '#22c55e' : '#ef4444'
        }}>
          {connectionStatus}
        </span></div>

        <div>Hand Detected: {landmarks ? '✅ Yes' : '❌ No'}</div>
        <div>Frames: {frameCount}</div>

        {error && (
          <div style={{ color: '#ef4444', marginTop: '4px' }}>
            Error: {error}
          </div>
        )}

        {connectionStatus !== 'connected' && (
          <button
            onClick={reconnect}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🔄 Reconnect
          </button>
        )}

        {landmarks && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#a0a0a0' }}>
            Fingertip: ({landmarks[8]?.x.toFixed(3)}, {landmarks[8]?.y.toFixed(3)})
          </div>
        )}
      </div>
    </div>
  )
}

export default App
