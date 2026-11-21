@echo off
rem Windows: double-click this file to preview the site in your browser.
rem Close this window to stop.
cd /d "%~dp0.."
echo.
echo   Previewing %CD%
echo   http://localhost:8000   (close this window to stop)
echo.
start "" cmd /c "timeout /t 1 >nul & start http://localhost:8000/"
python dev\serve.py 8000 2>nul || py dev\serve.py 8000
pause
