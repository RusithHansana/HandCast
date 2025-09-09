@echo off
echo Setting up Python backend for hand tracking...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Setup complete! 
echo.
echo To run the backend server:
echo   1. venv\Scripts\activate
echo   2. python server.py
echo.
echo Or use: npm run dev:full (to run both frontend and backend)
pause
