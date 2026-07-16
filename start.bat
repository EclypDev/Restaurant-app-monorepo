@echo off
title GalaxyPos - Restaurante App
echo ============================================
echo   GalaxyPos - Iniciando Servicios
echo ============================================
echo.
echo [1/2] Iniciando BACKEND (puerto 4000)...
cd /d "%~dp0backend"
start "Backend" cmd /c npm run dev

echo [2/2] Iniciando FRONTEND (puerto 3000)...
cd /d "%~dp0frontend"
start "Frontend" cmd /c npm run dev

echo.
echo ============================================
echo   Servicios iniciados correctamente.
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo.
echo   Menu QR:  http://localhost:3000/n/default-negocio/mesa/ID_MESA
echo.
echo   Cierra las ventanas para detener.
echo ============================================
pause
