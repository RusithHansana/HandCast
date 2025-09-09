# server.py
import cv2
import json
import asyncio
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from mediapipe.python.solutions import hands as mp_hands
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hand Tracking Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# Initialize camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    logger.error("Could not open camera")
    cap = None
else:
    # Set camera properties for better performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    logger.info("Camera initialized successfully")

@app.get("/")
async def root():
    return {"message": "Hand Tracking WebSocket Server", "status": "running"}

@app.get("/health")
async def health():
    camera_status = "connected" if cap and cap.isOpened() else "disconnected"
    return {
        "status": "healthy",
        "camera": camera_status,
        "mediapipe": "loaded"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        frame_count = 0
        while True:
            if not cap or not cap.isOpened():
                await websocket.send_text(json.dumps({
                    "error": "Camera not available"
                }))
                await asyncio.sleep(0.1)
                continue

            success, frame = cap.read()
            if not success:
                logger.warning("Failed to read frame from camera")
                await asyncio.sleep(0.01)
                continue

            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the frame
            results = hands.process(rgb_frame)
            
            frame_count += 1
            
            # Prepare payload
            if results.multi_hand_landmarks:
                landmarks = results.multi_hand_landmarks[0].landmark
                payload = {
                    "landmarks": [
                        {"x": lm.x, "y": lm.y, "z": lm.z} 
                        for lm in landmarks
                    ],
                    "frame_count": frame_count,
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                if frame_count % 30 == 0:  # Log every 30 frames
                    logger.info(f"Hand detected - Frame {frame_count}")
            else:
                payload = {
                    "landmarks": None,
                    "frame_count": frame_count,
                    "timestamp": asyncio.get_event_loop().time()
                }

            # Send data to frontend
            await websocket.send_text(json.dumps(payload))
            
            # Control frame rate (~30 FPS)
            await asyncio.sleep(0.033)
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed by client")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        logger.info("Cleaning up WebSocket connection")

@app.on_event("shutdown")
async def shutdown_event():
    if cap:
        cap.release()
    logger.info("Server shutdown complete")

if __name__ == "__main__":
    logger.info("Starting Hand Tracking Server...")
    logger.info("WebSocket will be available at: ws://localhost:8000/ws")
    logger.info("Health check available at: http://localhost:8000/health")
    
    uvicorn.run(
        "server:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
