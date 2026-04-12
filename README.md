<h1 align="center">HandCast</h1>

<p align="center">
  <strong>A cutting-edge gesture-based 3D lighting control system</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-R166-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/MediaPipe-0.10.5-FF6B35?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License: MIT" />
</p>

---

## Overview

HandCast is a gesture-based 3D lighting control system that detects hand pointing gestures and allows users to toggle smart bulbs in a realistic 3D environment using pinch gestures. The project translates physical real-world movements into interactions within a virtual 3D space, built using a React Three.js frontend and a Python MediaPipe backend over WebSockets.

## Features

- **Real-time hand tracking** — utilizing MediaPipe and webcam input for accurate tracking
- **3D pointing detection** — performing precise ray casting within the 3D space
- **Pinch gesture recognition** — enabling device interactions natively
- **Smart bulb simulation** — featuring realistic 3D models and lighting effects
- **WebSocket communication** — facilitating fast, real-time message passing between frontend and backend
- **Realistic 3D room environment** — featuring walls, a ceiling, and furniture for an immersive experience
- **Dynamic lighting system** — casting shadows and simulating ambient effects
- **Modern UI / Glassmorphism** — providing a modern debug panel with backdrop blur effects
- **Spatial audio effects** — playing sound feedback for bulb interactions

## Demo

[Demo](https://github.com/user-attachments/assets/eda98879-f875-4f07-8af6-47d04c4f5ab3)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19.1, @react-three/fiber, @react-three/drei, Three.js, TailwindCSS |
| **Backend** | Python 3.8+, FastAPI, MediaPipe, OpenCV, WebSockets |
| **Database** | N/A |
| **Infrastructure** | Node.js, Vite |

---

## Architecture

```
┌─────────────────┐    WebSocket    ┌──────────────────────┐
│   React Frontend│ ←──────────────→│   Python Backend     │
│                 │                 │                      │
│ • Three.js 3D   │                 │ • MediaPipe Hand     │
│ • Ray Casting   │                 │   Tracking           │
│ • Pinch Detect  │                 │ • FastAPI Server     │
│ • UI Components │                 │ • Real-time Data     │
└─────────────────┘                 └──────────────────────┘
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Python](https://www.python.org/downloads/) 3.8 or higher
- A working webcam for hand tracking

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RusithHansana/HandCast.git
   cd HandCast
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Start the frontend development server**

   ```bash
   npm run dev
   ```

4. **Setup the Python backend**

   Open a new terminal session.

   ```bash
   cd backend
   python -m venv venv
   
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   # source venv/bin/activate
   
   pip install -r requirements.txt
   ```

5. **Start the backend server**

   ```bash
   python server.py
   ```

   The frontend runs at `http://localhost:5173` and the backend WebSocket runs at `ws://localhost:8000/ws`.

---

## Configuration

### Hand Tracking Configuration
| Variable | Description | Default |
|---|---|---|
| `PINCH_THRESHOLD` | Threshold limit to detect a pinch. | `0.1` |
| `MAX_RAY_DISTANCE` | Distance covered for ray casting. | `15` |
| `MIN_HAND_CONFIDENCE` | Certainty score of the model to begin tracking. | `0.7` |

### Visual Settings
| Variable | Description | Default |
|---|---|---|
| `RAY_COLOR` | Color of the tracking ray. | `0x00ffff` |
| `RAY_OPACITY` | Opacity value of the visual ray. | `0.8` |
| `PARTICLE_COUNT` | Number of ambient particles surrounding cursor. | `25` |

---

## Project Structure

```
HandCast/
├── backend/            # Python MediaPipe hand tracking server
├── public/             # Static assets
└── src/                # Frontend React application
    ├── components/     # 3D Scene components, Lighting, UI Overlays
    ├── hooks/          # Custom hooks handling logic, raycasting and sockets
    ├── utils/          # Standalone helper utilities
    └── App.jsx         # Main application component
```

---

## Contributing

Contributions are always welcome!

Please read our [Contributing Guide](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

This project has adopted the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- **MediaPipe Team** for the excellent hand tracking framework
- **Three.js Community** for the powerful 3D graphics library
- **React Three Fiber** for seamless integration
- **FastAPI** for a modern Python web framework
- **Vite Team** for the lightning-fast development experience

---

<p align="center">
  Built with ☕ by <a href="https://github.com/RusithHansana">RusithHansana</a>
</p>
