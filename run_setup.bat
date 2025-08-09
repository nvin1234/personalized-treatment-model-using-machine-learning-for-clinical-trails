@echo off
echo Heart Treatment System Setup
echo ============================

echo.
echo Step 1: Checking installation...
python check_installation.py

echo.
echo Step 2: Setting up models...
python simple_setup.py

echo.
echo Step 3: Starting Flask server...
echo The server will start at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python simple_app.py

pause
