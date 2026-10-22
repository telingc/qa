@echo off
cd /d "%~dp0"
call npm run publish
if errorlevel 1 (pause & exit /b 1)
echo.
echo Review publish-review.json and the local preview before publishing.
choice /C YN /N /M "Commit and push this reviewed site to GitHub? [Y/N] "
if errorlevel 2 exit /b
call npm run publish -- --confirm
pause
