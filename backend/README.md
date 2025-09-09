# Backend - Hand Tracking Server

This directory contains the Python FastAPI backend for real-time hand tracking using MediaPipe.

## Files

- **`server.py`** - FastAPI WebSocket server with MediaPipe hand detection
- **`requirements.txt`** - Python dependencies
- **`setup-backend.bat`** - Windows setup script
- **`venv/`** - Python virtual environment (created automatically)

## Quick Setup

```bash
# From project root
npm run setup:backend

# Or manually
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Running

```bash
# From project root
npm run dev:backend

# Or manually
cd backend
venv\Scripts\activate
python server.py
```

## API Endpoints

- **WebSocket**: `ws://localhost:8000/ws` - Real-time hand landmarks
- **Health Check**: `http://localhost:8000/health` - Server status
- **Root**: `http://localhost:8000/` - Basic info

## Hand Landmarks

The server sends 21 hand landmarks in the format:
```json
{
  "landmarks": [
    {"x": 0.5, "y": 0.3, "z": 0.1},
    ...
  ],
  "frame_count": 123,
  "timestamp": 1234567890.123
}
```

Landmark indices follow MediaPipe convention:
- 0: Wrist
- 4: Thumb tip
- 8: Index finger tip
- 12: Middle finger tip
- 16: Ring finger tip
- 20: Pinky tip
