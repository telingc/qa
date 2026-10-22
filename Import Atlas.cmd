@echo off
cd /d "%~dp0"
call npm run import:atlas
if errorlevel 1 (pause & exit /b 1)
echo.
choice /C YN /N /M "Apply the reviewed import to local QA content? [Y/N] "
if errorlevel 2 exit /b
call npm run import:atlas -- --confirm
pause
